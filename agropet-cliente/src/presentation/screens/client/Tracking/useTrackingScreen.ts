import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Animated, BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useUserMenu } from '../../../contexts/UserMenuContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../../data/datasources/supabase/client';

const STEP_LABELS = ['confirmed', 'preparing', 'delivering', 'completed'] as const;
type TrackingStatus = (typeof STEP_LABELS)[number];

export type StepStatusType = 'check' | 'warn' | 'red';

function getActiveStep(status: string): number {
  const idx = STEP_LABELS.indexOf(status as TrackingStatus);
  return idx >= 0 ? idx + 1 : 0;
}

function getOuterStatus(s1: StepStatusType, s2: StepStatusType): StepStatusType {
  if (s1 === 'warn' && s2 === 'red') return 'warn';
  return s1;
}

export function useTrackingScreen({ navigation }: any) {
  const route = useRoute();
  const { toggleMenu } = useUserMenu();
  const [searchText, setSearchText] = useState('');
  const { isDarkMode, colors } = useTheme();
  const [deliveryActive, setDeliveryActive] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderId = (route.params as any)?.orderId || null;
  const [enRouteTriggered, setEnRouteTriggered] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async (showLoading = true) => {
    if (!orderId) { if (showLoading) setLoading(false); return; }
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items( product_id, quantity, unit_price, products( name ) )')
        .eq('id', orderId)
        .single();
      if (data && !error) {
        setOrder(data);
        if (data.en_route_at || data.delivering_at) setEnRouteTriggered(true);
      }
    } catch (e) {
      console.log('Error fetching order for tracking:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel(`tracking_order_${orderId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          const newOrder = payload.new as any;
          setOrder(newOrder);
          if (newOrder?.en_route_at || newOrder?.delivering_at) setEnRouteTriggered(true);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('delivery_active')
          .maybeSingle();
        if (data && !error && data.delivery_active !== undefined) {
          setDeliveryActive(data.delivery_active);
        }
      } catch (e) {
        console.log('Error fetching delivery active in tracking:', e);
      }
    };

    fetchDeliveryStatus();

    const settingsChannelName = `store_settings_tracking_tabs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(settingsChannelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (payload.new && (payload.new as any).delivery_active !== undefined) {
            setDeliveryActive((payload.new as any).delivery_active);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const status = order?.status || '';
  const activeStep = getActiveStep(status);
  const cancelled = status === 'cancelled';

  const stepStatuses = useMemo((): StepStatusType[] => {
    if (cancelled) return STEP_LABELS.map(() => 'red');
    if (status === 'processing') return ['warn', 'red', 'red', 'red'];
    if (status === 'completed') return ['check', 'check', 'check', 'check'];
    if (status === 'confirmed') return ['check', 'warn', 'red', 'red'];
    if (status === 'preparing') return ['check', 'warn', 'red', 'red'];
    if (status === 'delivering') {
      if (enRouteTriggered) return ['check', 'check', 'warn', 'warn'];
      return ['check', 'check', 'red', 'red'];
    }
    return ['red', 'red', 'red', 'red'];
  }, [status, cancelled, enRouteTriggered]);

  const outerStatuses = useMemo(() =>
    stepStatuses.map((s, i) => {
      if (i === 0) return s;
      const next = i + 1 < stepStatuses.length ? stepStatuses[i + 1] : s;
      return getOuterStatus(s, next);
    }),
    [stepStatuses]
  );

  const step4IconStatus: StepStatusType = stepStatuses[3] === 'check' ? 'check' : 'red';
  const step4OuterStatus: StepStatusType = stepStatuses[3] === 'check' ? 'check' : 'red';

  const step2SubStatuses = useMemo((): [StepStatusType, StepStatusType] => {
    if (cancelled) return ['red', 'red'];
    return [
      status === 'confirmed' ? 'warn' : 'check',
      status === 'delivering' || status === 'completed' ? 'check' :
        status === 'preparing' ? 'warn' : 'red',
    ];
  }, [status, cancelled]);

  const step3SubStatuses = useMemo((): [StepStatusType, StepStatusType] => {
    if (cancelled) return ['red', 'red'];
    return [
      enRouteTriggered || status === 'completed' ? 'check' : (status === 'delivering' ? 'warn' : 'red'),
      status === 'completed' ? 'check' : (enRouteTriggered ? 'warn' : 'red'),
    ];
  }, [status, cancelled, enRouteTriggered]);

  const stepTimestamp = (stepIndex: number): string | undefined => {
    if (!order) return undefined;
    if (stepIndex === 0) return order.confirmed_at || order.created_at;
    if (stepIndex === 1) return order.prepared_at;
    if (stepIndex === 2) return order.delivering_at || order.updated_at;
    if (stepIndex === 3) return order.en_route_at || order.updated_at;
    return undefined;
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrder(false);
  }, [fetchOrder]);

  const sharedGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sharedGlowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(sharedGlowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => sharedGlowAnim.stopAnimation?.();
  }, []);

  const getThermometerColor = (stepIndex: number): string => {
    if (stepIndex === 2 && status === 'confirmed') return '#C51818';
    const st = stepStatuses[stepIndex - 1];
    if (!st || cancelled) return '#C51818';
    if (st === 'check') return '#25BE36';
    if (st === 'warn') return '#E9A527';
    return '#C51818';
  };

  const getThermometerOpacity = (stepIndex: number) => {
    return sharedGlowAnim;
  };

  const getThermometerGlowIntensity = (stepIndex: number): { opacity: number[]; radius: number[] } => {
    if (stepIndex === 2 && status === 'confirmed') return { opacity: [0.2, 0.5], radius: [2, 7] };
    const st = stepStatuses[stepIndex - 1];
    if (st === 'check') return { opacity: [0.4, 1], radius: [4, 14] };
    if (st === 'warn') return { opacity: [0.3, 0.7], radius: [3, 10] };
    return { opacity: [0.2, 0.5], radius: [2, 7] };
  };

  return {
    toggleMenu,
    searchText,
    setSearchText,
    isDarkMode,
    colors,
    deliveryActive,
    order,
    loading,
    activeStep,
    cancelled,
    status,
    orderId,
    enRouteTriggered,
    stepStatuses,
    outerStatuses,
    step4IconStatus,
    step4OuterStatus,
    step2SubStatuses,
    step3SubStatuses,
    stepTimestamp,
    formatTime,
    getThermometerColor,
    getThermometerOpacity,
    getThermometerGlowIntensity,
    refreshing,
    onRefresh,
  };
}
