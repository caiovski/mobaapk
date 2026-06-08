import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../data/datasources/supabase/client';
import { DEFAULT_STORE_LOCATION } from '../Map/constants';

export function useDeliveryMinimap(orderId: string | null, status: string, hasDeliveryDeparted: boolean) {
  const [storeLocation, setStoreLocation] = useState(DEFAULT_STORE_LOCATION);
  const [clientLocation, setClientLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [carPosition, setCarPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasGpsData, setHasGpsData] = useState(false);

  const getSpeechBubble = useCallback((): string | null => {
    if (!status || status === 'completed' || status === 'cancelled') return null;
    if (status === 'confirmed') return 'Seu pedido foi confirmado, logo logo entrará em preparação!';
    if (status === 'preparing') return 'No momento, seu pedido está sendo preparado!';
    if (status === 'delivering') {
      if (hasDeliveryDeparted) return 'Saímos para entrega e estamos à caminho, caro cliente.';
      return 'Seu pedido está sendo preparado e sairá da entrega logo logo!';
    }
    return null;
  }, [status, hasDeliveryDeparted]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const { data, error } = await supabase
          .from('agropet_store_location')
          .select('latitude, longitude')
          .eq('id', 1)
          .single();
        if (data && !error) {
          setStoreLocation((prev: any) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
          }));
        }
      } catch (e) {
        console.log('Erro ao buscar localização da loja no minimapa:', e);
      }
    };
    fetchStore();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    if (storeLocation && !hasGpsData && !carPosition && status && status !== 'completed' && status !== 'cancelled') {
      setCarPosition({ latitude: storeLocation.latitude, longitude: storeLocation.longitude });
    }
  }, [storeLocation, hasGpsData, carPosition, orderId, status]);

  useEffect(() => {
    if (!orderId) return;

    const fetchInitialGps = async () => {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('lat, lng, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data && !error) {
        setCarPosition({ latitude: data.lat, longitude: data.lng });
        setHasGpsData(true);
      }
    };
    fetchInitialGps();

    const channel = supabase
      .channel(`minimap_delivery_tracking_${orderId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'delivery_tracking', filter: `order_id=eq.${orderId}` },
        (payload: any) => {
          const { lat, lng } = payload.new;
          if (lat != null && lng != null) {
            setCarPosition({ latitude: lat, longitude: lng });
            setHasGpsData(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('users(lat, lng)')
        .eq('id', orderId)
        .single();
      if (data?.users && !error) {
        const u: any = data.users;
        if (u.lat && u.lng) {
          setClientLocation({ latitude: u.lat, longitude: u.lng });
        }
      }
    };
    fetchClient();
  }, [orderId]);

  return {
    storeLocation,
    clientLocation,
    carPosition,
    hasGpsData,
    speechBubble: hasGpsData ? null : getSpeechBubble(),
  };
}
