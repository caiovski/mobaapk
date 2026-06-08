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

const NOTIF_DURATION = 7000;

function getNotifMessage(oldData: any, newData: any): string {
  const oldStatus = oldData?.status;
  const newStatus = newData?.status;
  const oldEnRoute = oldData?.en_route_at;
  const newEnRoute = newData?.en_route_at;
  const oldDeliveringAt = oldData?.delivering_at;
  const newDeliveringAt = newData?.delivering_at;

  if (oldStatus === 'confirmed' && newStatus === 'preparing') return 'Seu pedido está sendo preparado!';
  if (oldStatus === 'preparing' && newStatus === 'delivering') return 'Seu pedido foi preparado!';
  if (!oldDeliveringAt && newDeliveringAt && newStatus === 'delivering') return 'Seu pedido saiu para entrega!';
  if (!oldEnRoute && newEnRoute) return 'Seu pedido já está a caminho, 200 metros de sua casa!';
  if (oldStatus === 'delivering' && newStatus === 'completed') return 'Seu pedido foi entregue com sucesso!';

  return '';
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
  const [notifMessage, setNotifMessage] = useState('');
  const [notifVisible, setNotifVisible] = useState(false);

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
        if (data.en_route_at) setEnRouteTriggered(true);
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
          const oldOrder = payload.old as any;
          setOrder(newOrder);
          if (newOrder?.en_route_at) setEnRouteTriggered(true);
          const msg = getNotifMessage(oldOrder, newOrder);
          if (msg) {
            setNotifMessage(msg);
            setNotifVisible(true);
          }
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
  const hasDeliveryDeparted = !!order?.delivering_at;

  const stepStatuses = useMemo((): StepStatusType[] => {
    if (cancelled) return STEP_LABELS.map(() => 'red');
    if (status === 'processing') return ['warn', 'red', 'red', 'red'];
    if (status === 'completed') return ['check', 'check', 'check', 'check'];
    if (status === 'confirmed') return ['check', 'warn', 'red', 'red'];
    if (status === 'preparing') return ['check', 'warn', 'red', 'red'];
    if (status === 'delivering') {
      if (enRouteTriggered) return ['check', 'check', 'check', 'warn'];
      if (hasDeliveryDeparted) return ['check', 'check', 'warn', 'red'];
      return ['check', 'check', 'red', 'red'];
    }
    return ['red', 'red', 'red', 'red'];
  }, [status, cancelled, enRouteTriggered, hasDeliveryDeparted]);

  const outerStatuses = useMemo(() =>
    stepStatuses.map((s, i) => {
      if (i === 0) return s;
      const next = i + 1 < stepStatuses.length ? stepStatuses[i + 1] : s;
      if (status === 'confirmed' && s === 'warn' && next === 'red') return 'red';
      return getOuterStatus(s, next);
    }),
    [stepStatuses, status]
  );

  const step4IconStatus: StepStatusType = stepStatuses[3];
  const step4OuterStatus: StepStatusType = stepStatuses[3];

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
      enRouteTriggered || status === 'completed' ? 'check' : (hasDeliveryDeparted ? 'check' : (status === 'delivering' ? 'warn' : 'red')),
      status === 'completed' ? 'check' : (enRouteTriggered ? 'check' : (hasDeliveryDeparted ? 'warn' : 'red')),
    ];
  }, [status, cancelled, enRouteTriggered, hasDeliveryDeparted]);

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
    if (!notifVisible) return;
    const timer = setTimeout(() => setNotifVisible(false), NOTIF_DURATION);
    return () => clearTimeout(timer);
  }, [notifVisible]);

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
    hasDeliveryDeparted,
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
    notifMessage,
    notifVisible,
    setNotifVisible,
  };
}
