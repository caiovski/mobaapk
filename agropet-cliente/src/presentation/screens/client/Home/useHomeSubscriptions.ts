import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../data/datasources/supabase/client';

interface UseHomeSubscriptionsProps {
  fetchProducts: (showLoading: boolean) => Promise<void>;
  fetchPromoProducts: () => Promise<void>;
  fetchMostViewedToday: () => Promise<void>;
  fetchMostSoldToday: () => Promise<void>;
  checkRecentEsgotados: () => Promise<void>;
  checkDeliveryStatus: () => Promise<void>;
  fetchProfileName: () => Promise<void>;
  checkGreetingPreference: () => Promise<void>;
  reloadCategories: () => void;
  setShowReactivatedAlert: (v: boolean) => void;
  setDeliveryActive: (v: boolean) => void;
}

export default function useHomeSubscriptions({
  fetchProducts, fetchPromoProducts, fetchMostViewedToday, fetchMostSoldToday,
  checkRecentEsgotados, checkDeliveryStatus,
  fetchProfileName, checkGreetingPreference,
  reloadCategories, setShowReactivatedAlert, setDeliveryActive,
}: UseHomeSubscriptionsProps) {
  const navigation = useNavigation<any>();

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
      checkDeliveryStatus();
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
}
