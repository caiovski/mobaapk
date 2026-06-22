import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../contexts/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../../../data/datasources/supabase/client';
import { CartContext } from '../../../contexts/CartContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { useConnectivity } from '../../../contexts/ConnectivityContext';
import { useFilter } from '../../../contexts/FilterContext';
import { isProductInCategories } from '../../../../services/categoryService';
import { getShopStatus } from '../../../../utils/shopHours';
import useHomeSubscriptions from './useHomeSubscriptions';
import useHomeGreeting from './useHomeGreeting';

export default function useHomeScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [mostViewedProducts, setMostViewedProducts] = useState<any[]>([]);
  const [mostSoldProducts, setMostSoldProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { searchText, setSearchText, selectedCategories, categories, reloadCategories } = useFilter();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const { isOnline, productCacheService } = useConnectivity();
  const [esgotadoAlert, setEsgotadoAlert] = useState<string | null>(null);
  const [deliveryActive, setDeliveryActive] = useState<boolean>(true);
  const [showReactivatedAlert, setShowReactivatedAlert] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    clientName, greeting, shopStatus, showGreetingBar,
    greetingOpacity, greetingScale, closeButtonRotate, closeButtonScale,
    fetchProfileName, checkGreetingPreference, handleDismissGreeting,
  } = useHomeGreeting(user, isAdmin, setIsAdmin);

  const fetchProducts = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage, promo_end_at')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const normalized = data.map((p: any) =>
        p.promo_end_at && p.promo_end_at < now ? { ...p, discount_percentage: null } : p
      );
      setProducts(normalized);
      if (productCacheService) {
        await productCacheService.saveProductsToCache(data);
      }
    } else if (productCacheService) {
      const cached = await productCacheService.getCachedProducts();
      setProducts(cached);
    }
    if (showLoadingIndicator) setLoading(false);
  };

  const handleRefresh = async () => {
    setShowReactivatedAlert(false);
    setRefreshing(true);
    await Promise.all([
      fetchProducts(false),
      fetchPromoProducts(),
      fetchMostViewedToday(),
      fetchMostSoldToday(),
      checkRecentEsgotados(),
      checkDeliveryStatus()
    ]);
    setRefreshing(false);
  };

  const checkRecentEsgotados = async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, updated_at')
        .eq('active', false)
        .gte('updated_at', oneDayAgo);

      if (error || !data || data.length === 0) return;

      const seenRaw = await SecureStore.getItemAsync('seen_esgotados');
      const seenList: string[] = seenRaw ? JSON.parse(seenRaw) : [];

      const unseen = data.find(p => !seenList.includes(p.id));
      if (unseen) {
        setEsgotadoAlert(unseen.name);
        seenList.push(unseen.id);
        await SecureStore.setItemAsync('seen_esgotados', JSON.stringify(seenList));
      }
    } catch (e) {
      console.log('Erro ao verificar esgotados:', e);
    }
  };

  const checkDeliveryStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('delivery_active')
        .maybeSingle();

      if (data && !error && data.delivery_active !== undefined) {
        const currentActive = data.delivery_active;
        setDeliveryActive(currentActive);

        if (typeof (global as any).refreshDeliveryTabs === 'function') {
          (global as any).refreshDeliveryTabs();
        }

        const lastKnownRaw = await SecureStore.getItemAsync('last_known_delivery_active');
        if (lastKnownRaw !== null) {
          const lastKnown = lastKnownRaw === 'true';
          if (!lastKnown && currentActive) {
            setShowReactivatedAlert(true);
            await SecureStore.setItemAsync('seen_reactivated_alert', 'true');
          }
        } else {
          await SecureStore.setItemAsync('seen_reactivated_alert', 'true');
        }

        if (!currentActive) {
          await SecureStore.setItemAsync('seen_reactivated_alert', 'false');
          setShowReactivatedAlert(false);
        }

        await SecureStore.setItemAsync('last_known_delivery_active', String(currentActive));
      }
    } catch (e) {
      console.log('Erro ao verificar status do frete na Home:', e);
    }
  };

  const handleCloseReactivated = async () => {
    setShowReactivatedAlert(false);
    await SecureStore.setItemAsync('seen_reactivated_alert', 'true');
  };

  const fetchPromoProducts = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage, promo_end_at')
        .eq('active', true)
        .not('discount_percentage', 'is', null)
        .or(`promo_end_at.gt.${now},promo_end_at.is.null`)
        .order('created_at', { ascending: false });
      if (!error && data) setPromoProducts(data);
      else setPromoProducts([]);
    } catch {
      setPromoProducts([]);
    }
  };

  const fetchMostViewedToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('product_daily_views')
        .select('product_id, views')
        .eq('date', today)
        .order('views', { ascending: false })
        .limit(10);
      if (!error && data && data.length > 0) {
        const ids = data.map(v => v.product_id);
        const now = new Date().toISOString();
        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage, promo_end_at')
          .in('id', ids)
          .eq('active', true);
        if (prodData) {
          const normalized = prodData.map((p: any) =>
            p.promo_end_at && p.promo_end_at < now ? { ...p, discount_percentage: null } : p
          );
          const ordered = ids.map(id => normalized.find((p: any) => p.id === id)).filter(Boolean);
          ordered.sort((a: any, b: any) => {
            const aIsPromo = a.discount_percentage && a.discount_percentage > 0;
            const bIsPromo = b.discount_percentage && b.discount_percentage > 0;
            if (aIsPromo && !bIsPromo) return -1;
            if (!aIsPromo && bIsPromo) return 1;
            return 0;
          });
          setMostViewedProducts(ordered);
        } else setMostViewedProducts([]);
      } else setMostViewedProducts([]);
    } catch {
      setMostViewedProducts([]);
    }
  };

  const fetchMostSoldToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .gte('created_at', today);
      if (!error && data && data.length > 0) {
        const grouped: Record<string, number> = {};
        data.forEach(item => {
          grouped[item.product_id] = (grouped[item.product_id] || 0) + Number(item.quantity);
        });
        const sorted = Object.entries(grouped)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);
        const ids = sorted.map(([id]) => id);
        if (ids.length === 0) { setMostSoldProducts([]); return; }
        const now = new Date().toISOString();
        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage, promo_end_at')
          .in('id', ids)
          .eq('active', true);
        if (prodData) {
          const normalized = prodData.map((p: any) =>
            p.promo_end_at && p.promo_end_at < now ? { ...p, discount_percentage: null } : p
          );
          const ordered = ids.map(id => normalized.find((p: any) => p.id === id)).filter(Boolean);
          ordered.sort((a: any, b: any) => {
            const aIsPromo = a.discount_percentage && a.discount_percentage > 0;
            const bIsPromo = b.discount_percentage && b.discount_percentage > 0;
            if (aIsPromo && !bIsPromo) return -1;
            if (!aIsPromo && bIsPromo) return 1;
            return 0;
          });
          setMostSoldProducts(ordered);
        } else setMostSoldProducts([]);
      } else setMostSoldProducts([]);
    } catch {
      setMostSoldProducts([]);
    }
  };

  useHomeSubscriptions({
    fetchProducts, fetchPromoProducts, fetchMostViewedToday, fetchMostSoldToday,
    checkRecentEsgotados, checkDeliveryStatus,
    fetchProfileName, checkGreetingPreference,
    reloadCategories, setShowReactivatedAlert, setDeliveryActive,
  });

  useEffect(() => {
    const interval = setInterval(() => { fetchPromoProducts(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const matchesFilter = (p: any) => {
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const query = searchText.toLowerCase();
    return (name.includes(query) || desc.includes(query)) && isProductInCategories(p, selectedCategories, categories);
  };

  const filteredPromo = useMemo(() => promoProducts.filter(matchesFilter), [promoProducts, searchText, selectedCategories, categories]);
  const filteredViewed = useMemo(() => mostViewedProducts.filter(matchesFilter), [mostViewedProducts, searchText, selectedCategories, categories]);
  const filteredSold = useMemo(() => mostSoldProducts.filter(matchesFilter), [mostSoldProducts, searchText, selectedCategories, categories]);

  const getDestaqueSections = (productId: string) => {
    let count = 0;
    if (filteredPromo.some(p => p.id === productId)) count++;
    if (filteredViewed.some(p => p.id === productId)) count++;
    if (filteredSold.some(p => p.id === productId)) count++;
    return count;
  };

  const prioritySections: Array<{ id: string; list: any[] }> = [
    { id: 'promocao', list: filteredPromo },
    { id: 'acessados', list: filteredViewed },
    { id: 'comprados', list: filteredSold },
  ];

  const getShowDestaque = (productId: string, _currentSectionId: string) => {
    let count = 0;
    for (const sec of prioritySections) {
      if (sec.list.some(p => p.id === productId)) count++;
    }
    return count > 1;
  };

  const allFiltered = useMemo(() => products.filter(matchesFilter), [products, searchText, selectedCategories, categories]);

  return {
    colors, isDarkMode, navigation,
    products, loading, refreshing,
    searchText, setSearchText, selectedCategories, categories,
    addToCart,
    esgotadoAlert, setEsgotadoAlert,
    deliveryActive, showReactivatedAlert,
    greeting, shopStatus, showGreetingBar,
    greetingOpacity, greetingScale, closeButtonRotate, closeButtonScale,
    filteredPromo, filteredViewed, filteredSold, allFiltered,
    getDestaqueSections, getShowDestaque,
    handleRefresh, handleCloseReactivated, handleDismissGreeting,
    clientName,
  };
}
