import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
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
  const [clientName, setClientName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [shopStatus, setShopStatusState] = useState<any>(null);
  const [showGreetingBar, setShowGreetingBar] = useState(true);

  const greetingOpacity = useRef(new Animated.Value(1)).current;
  const greetingScale = useRef(new Animated.Value(1)).current;
  const closeButtonRotate = useRef(new Animated.Value(0)).current;
  const closeButtonScale = useRef(new Animated.Value(1)).current;

  const fetchProfileName = async () => {
    if (user?.id) {
      try {
        const { data } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', user.id)
          .single();
        if (data?.name) {
          const firstName = data.name.trim().split(' ')[0];
          setClientName(firstName);
        } else {
          setClientName('');
        }
        setIsAdmin(data?.role === 'admin');
      } catch (e) {
        console.log('Erro ao buscar nome do cliente para a saudação:', e);
      }
    } else {
      setClientName('');
      setIsAdmin(false);
    }
  };

  const checkGreetingPreference = async () => {
    try {
      const val = await SecureStore.getItemAsync('show_greeting_bar');
      if (val === 'false') {
        setShowGreetingBar(false);
      } else {
        greetingOpacity.setValue(0);
        greetingScale.setValue(0.95);
        closeButtonRotate.setValue(0);
        closeButtonScale.setValue(1);
        setShowGreetingBar(true);

        Animated.parallel([
          Animated.timing(greetingOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(greetingScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (e) {
      console.log('Erro ao ler preferência de saudação:', e);
    }
  };

  const handleDismissGreeting = () => {
    Animated.parallel([
      Animated.timing(closeButtonRotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(closeButtonScale, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(greetingOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(greetingScale, {
        toValue: 0.95,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      setShowGreetingBar(false);
      try {
        await SecureStore.setItemAsync('show_greeting_bar', 'false');
      } catch (e) {
        console.log('Erro ao salvar preferência de saudação:', e);
      }
    });
  };

  useEffect(() => {
    fetchProfileName();
    checkGreetingPreference();
  }, [user]);

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const status = getShopStatus(now);

      if (isAdmin) {
        setGreeting('Bem-vindo admin, o que vamos testar hoje?');
        if (status.isOpen) {
          setShopStatusState(status);
        } else {
          setShopStatusState({ ...status, isOpen: true, countdownText: 'Modo teste — loja fechada' });
        }
      } else {
        setShopStatusState(status);
        const hour = now.getHours();
        const isDay = hour >= 6 && hour < 18;
        const nameToUse = clientName || 'Cliente';
        if (isDay) {
          setGreeting(`Bom dia, ${nameToUse}!`);
        } else {
          setGreeting(`Boa noite, ${nameToUse}!`);
        }
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [clientName, isAdmin]);

  const fetchProducts = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
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
        .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage')
        .eq('active', true)
        .not('discount_percentage', 'is', null)
        .or(`promo_start_at.is.null,promo_start_at.lte.${now}`)
        .or(`promo_end_at.is.null,promo_end_at.gte.${now}`)
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
        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage')
          .in('id', ids)
          .eq('active', true);
        if (prodData) {
          const ordered = ids.map(id => prodData.find(p => p.id === id)).filter(Boolean);
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
        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage')
          .in('id', ids)
          .eq('active', true);
        if (prodData) {
          const ordered = ids.map(id => prodData.find(p => p.id === id)).filter(Boolean);
          setMostSoldProducts(ordered);
        } else setMostSoldProducts([]);
      } else setMostSoldProducts([]);
    } catch {
      setMostSoldProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPromoProducts();
    fetchMostViewedToday();
    fetchMostSoldToday();
    checkRecentEsgotados();
    checkDeliveryStatus();
    fetchProfileName();

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setShowReactivatedAlert(false);
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchProfileName();
      checkGreetingPreference();
      reloadCategories();
    });

    const channel = supabase
      .channel(`store_settings_home_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        async (payload) => {
          if (payload.new && (payload.new as any).delivery_active !== undefined) {
            const currentActive = (payload.new as any).delivery_active;
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
        }
      )
      .subscribe();

    const prodChannel = supabase
      .channel(`products_home_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          await fetchProducts(false);
          await fetchPromoProducts();
        }
      )
      .subscribe();

    const viewsChannel = supabase
      .channel(`views_home_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'product_daily_views' },
        async () => {
          await fetchMostViewedToday();
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel(`orders_home_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_items' },
        async () => {
          await fetchMostSoldToday();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(prodChannel);
      supabase.removeChannel(viewsChannel);
      supabase.removeChannel(ordersChannel);
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [navigation]);

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

  const getShowDestaque = (productId: string, currentSectionId: string) => {
    for (const sec of prioritySections) {
      if (sec.list.some(p => p.id === productId)) {
        return sec.id === currentSectionId;
      }
    }
    return false;
  };

  const allFiltered = useMemo(() => products.filter(matchesFilter), [products, searchText, selectedCategories, categories]);

  return {
    colors,
    isDarkMode,
    navigation,
    products,
    loading,
    refreshing,
    searchText,
    setSearchText,
    selectedCategories,
    categories,
    addToCart,
    esgotadoAlert,
    setEsgotadoAlert,
    deliveryActive,
    showReactivatedAlert,
    greeting,
    shopStatus,
    showGreetingBar,
    greetingOpacity,
    greetingScale,
    closeButtonRotate,
    closeButtonScale,
    filteredPromo,
    filteredViewed,
    filteredSold,
    allFiltered,
    getDestaqueSections,
    getShowDestaque,
    handleRefresh,
    handleCloseReactivated,
    handleDismissGreeting,
    clientName,
  };
}
