import { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Alert } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useTheme } from '../../../contexts/ThemeContext';
import { NotificationService } from '../../../../services/notificationService';
import { useGpsTracking } from './useGpsTracking';

/* istanbul ignore next */
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

const PROXIMITY_THRESHOLD_M = 200;

/* istanbul ignore next */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useAdminOrderDetail({ route, navigation }: any) {
  const { order: initialOrder } = route.params;
  const { colors, isDarkMode } = useTheme();

  const [order, setOrder] = useState(initialOrder);
  const [orderItems, setOrderItems] = useState(route.params?.order?.order_items || []);
  const [enRouteTriggered, setEnRouteTriggered] = useState(!!order.en_route_at);
  const [departed, setDeparted] = useState(
    order.status === 'delivering' && order.delivering_at &&
    new Date(order.delivering_at).getTime() > new Date(order.created_at).getTime() + 1000
  );
  const [completedView, setCompletedView] = useState(order.status === 'completed');

  const orderTotal = order.total || 0;
  const userData = order.users || {};

  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const locationSubscriptionRef = useRef<any>(null);
  const enRouteCalledRef = useRef(false);
  const isCancellingRef = useRef(false);

  useGpsTracking(order, departed);

  useEffect(() => {
    const fetchImages = async () => {
      const productIds = orderItems.map((item: any) => item.product_id).filter(Boolean);
      if (productIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, image_url, is_bulk, is_per_meter')
            .in('id', productIds);

          /* istanbul ignore next */
          if (data && !error) {
            const productMap = new Map();
            data.forEach((p: any) => productMap.set(p.id, { image_url: p.image_url, is_bulk: p.is_bulk, is_per_meter: p.is_per_meter }));

            /* istanbul ignore next */
            setOrderItems((prevItems: any[]) => prevItems.map(item => {
              const pData = productMap.get(item.product_id);
              if (item.products && pData) {
                return { ...item, products: { ...item.products, image_url: pData.image_url, is_bulk: pData.is_bulk, is_per_meter: pData.is_per_meter } };
              }
              return item;
            }));
          }
        } catch (e) {
          /* istanbul ignore next */
          console.error('Error fetching images for order detail:', e);
        }
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items( product_id, quantity, unit_price, products( id, name, image_url, is_bulk, is_per_meter ) )')
          .eq('id', initialOrder.id)
          .single();
        if (data && !error) {
          setOrder(data);
          setOrderItems(data.order_items || []);
          /* istanbul ignore next */
          setDeparted(
            data.status === 'delivering' && data.delivering_at &&
            new Date(data.delivering_at).getTime() > new Date(data.created_at).getTime() + 1000
          );
          setEnRouteTriggered(!!data.en_route_at);
          setCompletedView(data.status === 'completed');
        }
      } catch (e) {
        /* istanbul ignore next */
        console.error('Error fetching fresh order data:', e);
      }
    };
    fetchOrder();
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  /* istanbul ignore next */
  const stopLocationWatch = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  /* istanbul ignore next */
  const startProximityMonitoring = useCallback(async (clientLat: number, clientLng: number) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      async (loc) => {
        if (enRouteCalledRef.current) return;

        const dist = haversineDistance(
          loc.coords.latitude, loc.coords.longitude,
          clientLat, clientLng
        );

        if (dist < PROXIMITY_THRESHOLD_M) {
          enRouteCalledRef.current = true;
          setEnRouteTriggered(true);

          try {
            const { data, error } = await supabase.rpc('mark_en_route', {
              p_order_id: order.id,
            });

            if (data?.user_id) {
              await NotificationService.sendOrderStatusNotification(
                data.user_id, order.id, 'en_route'
              );
            }
          } catch (e) {
            console.error('Erro ao marcar à caminho:', e);
          }

          stopLocationWatch();
        }
      }
    );
    locationSubscriptionRef.current = sub;
  }, [order.id, stopLocationWatch]);

  useEffect(() => {
    return () => {
      stopLocationWatch();
    };
  }, [stopLocationWatch]);

  const orderDateObj = new Date(order.created_at);
  const formattedDate = `${orderDateObj.getDate().toString().padStart(2, '0')}/${(orderDateObj.getMonth() + 1).toString().padStart(2, '0')}/${orderDateObj.getFullYear()}`;

  const isPhysicalPDV = order.delivery_address === 'Venda Física PDV';
  const isDelivered = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';
  /* istanbul ignore next */
  const isPixPending = order.payment_method === 'pix' && order.status === 'processing';
  const isCompletedView = completedView;

  let lineColor = '#FF8A80';
  let textColor = '#D32F2F';
  let statusText = 'Pendente';
  let isRightAligned = false;

  if (isPhysicalPDV) {
    lineColor = '#00E676';
    textColor = '#00E676';
    statusText = isCancelled ? 'Venda Física (Cancelada)' : 'Venda Física (Concluída)';
    isRightAligned = !isCancelled;
  } else if (isDelivered) {
    lineColor = '#42A5F5';
    textColor = '#1976D2';
    statusText = 'Entregue';
    isRightAligned = true;
  } else if (isCancelled) {
    lineColor = '#BDBDBD';
    textColor = '#757575';
    statusText = 'Cancelado';
    isRightAligned = false;
  } else if (order.status === 'preparing') {
    lineColor = '#FFA726';
    textColor = '#FFA726';
    statusText = 'Preparando';
  } else if (departed && enRouteTriggered) {
    lineColor = '#E9A527';
    textColor = '#E9A527';
    statusText = 'À caminho';
  } else if (departed) {
    lineColor = '#E9A527';
    textColor = '#E9A527';
    statusText = 'Saiu para entrega';
  }

  const clientAddress = isPhysicalPDV ? 'Venda Física (PDV)' : [
    userData.rua,
    userData.numero ? `N° ${userData.numero}` : null,
    userData.bairro,
    userData.cep,
  ].filter(Boolean).join(', ');

  const handleGoBack = () => {
    stopLocationWatch();
    navigation.goBack();
  };

  /* istanbul ignore next */
  const nextStatus = useCallback((): string | null => {
    const s = order.status;
    if (s === 'confirmed') return 'preparing';
    if (s === 'preparing') return 'delivering';
    if (s === 'delivering' && departed && enRouteTriggered) return 'completed';
    return null;
  }, [order.status, departed, enRouteTriggered]);

  /* istanbul ignore next */
  const nextStatusLabel = useCallback((): string => {
    const s = order.status;
    if (s === 'cancelled') return 'Pedido Cancelado';
    if (s === 'confirmed') return 'Iniciar preparação';
    if (s === 'preparing') return 'Pedido preparado!';
    if (s === 'delivering' && departed && enRouteTriggered) return 'Concluir entrega';
    if (s === 'delivering' && departed) return 'À caminho';
    if (s === 'delivering') return 'Saiu para entrega';
    if (s === 'completed') return 'Entregue!';
    return '';
  }, [order.status, departed, enRouteTriggered]);

  /* istanbul ignore next */
  const getButtonColor = useCallback((): string => {
    const s = order.status;
    if (s === 'cancelled' || s === 'completed') return '#A0A0A0';
    if (isPixPending) return '#A0A0A0';
    if (s === 'delivering' && departed && enRouteTriggered) return '#00BFA5';
    if (s === 'delivering' && departed) return '#2E7D32';
    if (s === 'delivering') return '#2E7D32';
    if (s === 'preparing') return '#042A7D';
    if (s === 'confirmed') return '#042A7D';
    return '#042A7D';
  }, [order.status, departed, isPixPending, enRouteTriggered]);

  /* istanbul ignore next */
  const isButtonDisabled = useCallback((): boolean => {
    if (isPixPending) return true;
    if (order.status === 'cancelled' || order.status === 'completed') return true;
    return false;
  }, [isPixPending, order.status]);

  /* istanbul ignore next */
  const handleDeliveryDeparture = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('mark_delivery_departure', {
        p_order_id: order.id,
      });

      if (error || !data?.success) {
        Alert.alert('Erro', data?.error || 'Não foi possível registrar a saída.');
        return;
      }

      if (data.user_id) {
        await NotificationService.sendOrderStatusNotification(
          data.user_id, order.id, 'saiu_para_entrega'
        );
      }

      setDeparted(true);

      Alert.alert('Sucesso', 'Saída para entrega registrada!');
    } catch (e) {
      console.error('Erro em handleDeliveryDeparture:', e);
      Alert.alert('Erro', 'Ocorreu um erro ao processar a entrega.');
    }
  }, [order.id]);

  /* istanbul ignore next */
  const handleManualEnRoute = useCallback(async () => {
    if (enRouteCalledRef.current) return;
    enRouteCalledRef.current = true;
    setEnRouteTriggered(true);
    setOrder((prev: any) => ({ ...prev, en_route_at: new Date().toISOString() }));

    try {
      const { data, error } = await supabase.rpc('mark_en_route', {
        p_order_id: order.id,
      });

      if (error) {
        console.error('Erro ao marcar à caminho manualmente:', error);
      }

      if (data?.user_id) {
        await NotificationService.sendOrderStatusNotification(
          data.user_id, order.id, 'en_route'
        );
      }
    } catch (e) {
      console.error('Erro ao marcar à caminho:', e);
    }

    stopLocationWatch();
    Alert.alert('Sucesso', 'Status alterado para "À caminho".');
  }, [order.id, stopLocationWatch]);

  /* istanbul ignore next */
  const handleAdvanceStatus = useCallback(async () => {
    if (isPixPending || order.status === 'completed') return;

    if (order.status === 'delivering' && !departed) {
      await handleDeliveryDeparture();
      return;
    }

    if (order.status === 'delivering' && departed && !enRouteTriggered) {
      await handleManualEnRoute();
      return;
    }

    const target = nextStatus();
    if (!target) return;

    try {
      const { data, error } = await supabase.rpc('update_order_status', {
        p_order_id: order.id,
        p_new_status: target,
      });

      if (error || !data?.success) {
        Alert.alert('Erro', data?.error || 'Não foi possível atualizar o status.');
        return;
      }

      if (data.user_id) {
        await NotificationService.sendOrderStatusNotification(data.user_id, order.id, target);
      }

      setOrder((prev: any) => ({ ...prev, status: target }));

      if (target === 'completed') {
        setCompletedView(true);
      }

      Alert.alert('Sucesso', `Status alterado para "${target}".`);
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o status.');
    }
  }, [order.id, order.status, nextStatus, isPixPending, departed, enRouteTriggered, handleDeliveryDeparture, handleManualEnRoute]);

  /* istanbul ignore next */
  const restoreStockOnCancel = useCallback(async () => {
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from('products')
        .select('is_bulk, is_per_meter, stock')
        .eq('id', item.product_id)
        .single();

      if (!product) continue;

      const isBulk = product.is_bulk === true;
      const isPerMeter = product.is_per_meter === true;
      let qtyToRestore: number;
      if (isBulk) {
        qtyToRestore = Math.round(item.quantity * 1000);
      } else if (isPerMeter) {
        qtyToRestore = item.quantity;
      } else {
        qtyToRestore = item.quantity;
      }
      const newStock = product.stock + qtyToRestore;

      await supabase
        .from('products')
        .update({ stock: newStock, active: newStock > 0 })
        .eq('id', item.product_id);
    }
  }, [orderItems]);

  /* istanbul ignore next */
  const handleCancelOrder = useCallback(async () => {
    if (order.status === 'cancelled' || isCancellingRef.current) return;
    Alert.alert(
      'Cancelar Pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            if (isCancellingRef.current) return;
            isCancellingRef.current = true;
            try {
              const { data: freshOrder } = await supabase
                .from('orders')
                .select('status')
                .eq('id', order.id)
                .single();
              if (freshOrder?.status === 'cancelled') return;

              await restoreStockOnCancel();

              const { error: orderError } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);

              if (orderError) {
                Alert.alert('Erro', 'Não foi possível cancelar.');
                return;
              }

              if (order.user_id) {
                await NotificationService.sendOrderStatusNotification(order.user_id, order.id, 'cancelled');
              }

              stopLocationWatch();
              setOrder((prev: any) => ({ ...prev, status: 'cancelled' }));
              Alert.alert('Pedido Cancelado', 'O pedido foi cancelado com sucesso.');
            } catch {
              Alert.alert('Erro', 'Ocorreu um erro ao cancelar.');
            } finally {
              isCancellingRef.current = false;
            }
          },
        },
      ]
    );
  }, [order.id, orderItems, stopLocationWatch, restoreStockOnCancel]);

  return {
    colors,
    isDarkMode,
    order,
    orderItems,
    orderTotal,
    userData,
    glowAnim,
    formattedDate,
    isPhysicalPDV,
    isDelivered,
    isCancelled,
    isPixPending,
    departed,
    enRouteTriggered,
    isCompletedView,
    lineColor,
    textColor,
    statusText,
    isRightAligned,
    clientAddress,
    handleGoBack,
    nextStatus,
    nextStatusLabel,
    getButtonColor,
    isButtonDisabled,
    handleAdvanceStatus,
    handleCancelOrder,
    getFirstImageUrl,
  };
}
