import React, { useState, useContext, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CartContext } from '../../../contexts/CartContext';
import { useUserMenu } from '../../../contexts/UserMenuContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useFilter } from '../../../contexts/FilterContext';
import { fetchActiveCategories } from '../../../../services/categoryService';
import { AuthContext } from '../../../contexts/AuthContext';
import { formatStock } from '../../../../utils/formatStock';

function getFirstImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (_) {}
  }
  return url;
}

function getAllImageUrls(url: string | null | undefined): string[] {
  if (!url) return [];
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(u => !!u);
    } catch (_) {}
  }
  return [url];
}

export default function useProductDetailScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addToCart } = useContext(CartContext);
  const { searchText, setSearchText } = useFilter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const productId = route.params?.product?.id;
    if (productId) {
      (async () => {
        try { await supabase.rpc('increment_product_view', { p_product_id: productId }); } catch {}
      })();
    }
  }, [route.params?.product?.id]);
  const [clientName, setClientName] = useState('');
  const [dismissAlert, setDismissAlert] = useState(false);

  const product = route.params?.product;
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [bulkUnit, setBulkUnit] = useState<'kg' | 'g'>('kg');
  const [bulkInput, setBulkInput] = useState('1');
  const isBulk = product?.is_bulk === true;
  const isPerMeter = product?.is_per_meter === true;
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(
    product?.discount_percentage ?? null
  );
  const [promoEndAt, setPromoEndAt] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState('');

  const discountedPrice = discountPercentage
    ? product?.price * (1 - discountPercentage / 100)
    : null;

  useEffect(() => {
    if (!promoEndAt) return;
    const update = () => {
      const now = new Date();
      const end = new Date(promoEndAt);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) { setCountdownText('Promoção encerrada'); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownText(
        days > 0
          ? `${String(days).padStart(2, '0')} : ${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
          : `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [promoEndAt]);

  const [photos, setPhotos] = useState<string[]>(() => getAllImageUrls(product?.image_url));
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (product?.image_url) {
      setPhotos(getAllImageUrls(product.image_url));
      setCurrentPhotoIndex(0);
    } else if (product?.id) {
      // Dynamic fetch if image_url is missing
      const fetchImage = async () => {
        try {
          const { data } = await supabase.from('products').select('image_url').eq('id', product.id).single();
          if (data?.image_url) {
            product.image_url = data.image_url;
            setPhotos(getAllImageUrls(data.image_url));
          }
        } catch (e) {
          console.log('Error fetching image_url:', e);
        }
      };
      fetchImage();
    }
  }, [product]);

  useEffect(() => {
    if (!product?.id) return;

    const fetchStock = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('stock')
          .eq('id', product.id)
          .single();

        if (data && !error) {
          setStock(data.stock);
        }
      } catch (err) {
        console.error('Erro ao buscar estoque:', err);
      }
    };

    fetchStock();

    const fetchPromoFields = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('discount_percentage, promo_end_at')
          .eq('id', product.id)
          .single();
        if (data) {
          if (data.discount_percentage != null) setDiscountPercentage(data.discount_percentage);
          if (data.promo_end_at) setPromoEndAt(data.promo_end_at);
        }
      } catch {}
    };
    fetchPromoFields();

    const channel = supabase
      .channel(`product_stock_${product.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${product.id}`,
        },
        (payload: any) => {
          if (payload.new && typeof payload.new.stock === 'number') {
            setStock(payload.new.stock);
          }
        }
      )
      .subscribe();

    const intervalId = setInterval(() => {
      fetchStock();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [product?.id]);

  useEffect(() => {
    const fetchProfileName = async () => {
      if (user?.id) {
        try {
          const { data } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .single();
          if (data?.name) {
            const firstName = data.name.trim().split(' ')[0];
            setClientName(firstName);
          }
        } catch (e) {
          console.log('Erro ao buscar nome do cliente para a saudação:', e);
        }
      }
    };
    fetchProfileName();
  }, [user?.id]);

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage')
        .eq('active', true)
        .neq('id', product.id);

      if (!error && data) {
        const currentName = (product.name || '').toLowerCase();
        const currentDesc = (product.description || '').toLowerCase();
        let matchedKeywords: string[] = [];

        try {
          const allCategories = await fetchActiveCategories();
          for (const cat of allCategories) {
            if (cat.keywords.some(kw => currentName.includes(kw.toLowerCase()) || currentDesc.includes(kw.toLowerCase()))) {
              matchedKeywords = [...matchedKeywords, ...cat.keywords];
            }
          }
        } catch (_) {}

        let filtered = data.filter(p => {
          const name = (p.name || '').toLowerCase();
          const description = (p.description || '').toLowerCase();
          return matchedKeywords.some(kw =>
            name.includes(kw.toLowerCase()) ||
            description.includes(kw.toLowerCase())
          );
        });

        if (filtered.length === 0) {
          const cleanText = `${currentName} ${currentDesc}`
            .replace(/[^\w\sà-úÀ-Ú]/g, '')
            .toLowerCase();
          const words = cleanText
            .split(/\s+/)
            .filter((w: string) => w.length > 3);

          filtered = data.filter(p => {
            const name = (p.name || '').toLowerCase();
            const description = (p.description || '').toLowerCase();
            return words.some((w: string) =>
              name.includes(w) ||
              description.includes(w)
            );
          });
        }

        filtered.sort((a, b) => {
          const aDisc = a.discount_percentage ? 1 : 0;
          const bDisc = b.discount_percentage ? 1 : 0;
          return bDisc - aDisc;
        });
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingRelated(false);
    }
  };

  useEffect(() => {
    fetchRelatedProducts();
  }, [product]);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const enrichedProduct = React.useMemo(() => ({
    ...product,
    discount_percentage: discountPercentage,
  }), [product, discountPercentage]);

  const handleAddToCart = () => {
    if (isBulk) {
      const grams = bulkUnit === 'kg' ? Math.round(parseFloat(bulkInput.replace(',', '.')) * 1000) : parseInt(bulkInput, 10);
      addToCart(enrichedProduct, grams);
    } else if (isPerMeter) {
      const meters = parseFloat(bulkInput.replace(',', '.'));
      addToCart(enrichedProduct, meters);
    } else {
      addToCart(enrichedProduct, quantity);
    }
  };

  return {
    colors,
    isDarkMode,
    navigation,
    product,
    stock,
    quantity,
    increment,
    decrement,
    handleAddToCart,
    isBulk,
    isPerMeter,
    bulkUnit, setBulkUnit,
    bulkInput, setBulkInput,
    formatStock,
    relatedProducts,
    loadingRelated,
    photos,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    dismissAlert,
    setDismissAlert,
    clientName,
    searchText,
    setSearchText,
    getFirstImageUrl,
    addToCart,
    discountPercentage,
    discountedPrice,
    countdownText,
    promoEndAt,
  };
}
