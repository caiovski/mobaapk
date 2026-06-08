import { useState, useEffect, useRef, useCallback } from 'react';
import MapView from 'react-native-maps';
import { supabase } from '../../../../data/datasources/supabase/client';

export function getSpeechBubbleText(status: string | undefined, deliveringAt: string | null | undefined): string | null {
  if (!status || status === 'completed' || status === 'cancelled') return null;
  if (status === 'confirmed') return 'Seu pedido foi confirmado, logo logo entrará em preparação!';
  if (status === 'preparing') return 'No momento, seu pedido está sendo preparado!';
  if (status === 'delivering') {
    if (deliveringAt) return 'Saímos para entrega e estamos à caminho, caro cliente.';
    return 'Seu pedido está sendo preparado e sairá da entrega logo logo!';
  }
  return null;
}

export function useMapDirections(
  mapRef: React.RefObject<MapView>,
  clientLocation: { latitude: number; longitude: number } | null,
  storeLocation: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  trackingOrderId: string | null,
  navigation: any,
) {
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [remainingRoute, setRemainingRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [carPosition, setCarPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);
  const [showCar, setShowCar] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | undefined>(undefined);
  const [deliveringAt, setDeliveringAt] = useState<string | null | undefined>(undefined);

  const hasFitRouteRef = useRef(false);
  const prevPosRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const orderCompletedRef = useRef(false);

  const handleGoBackFromTracking = useCallback(() => {
    setRouteCoordinates([]);
    setRemainingRoute([]);
    setCarPosition(null);
    setIsTracking(false);
    setHasArrived(false);
    setShowCar(false);
    setOrderStatus(undefined);
    setDeliveringAt(undefined);
    hasFitRouteRef.current = false;
    orderCompletedRef.current = false;
    prevPosRef.current = null;
    navigation.setParams({ trackingOrderId: null });
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const unsubBlur = navigation.addListener('blur', () => {
      setRouteCoordinates([]);
      setRemainingRoute([]);
      setCarPosition(null);
      setIsTracking(false);
      setHasArrived(false);
      setShowCar(false);
      setOrderStatus(undefined);
      setDeliveringAt(undefined);
      hasFitRouteRef.current = false;
      orderCompletedRef.current = false;
      prevPosRef.current = null;
      navigation.setParams({ trackingOrderId: null });
    });
    return unsubBlur;
  }, [navigation]);

  useEffect(() => {
    if (!trackingOrderId || !clientLocation) return;

    const fetchRouteAndSubscribe = async () => {
      try {
        const origin = `${storeLocation.longitude},${storeLocation.latitude}`;
        const destination = `${clientLocation.longitude},${clientLocation.latitude}`;

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => ({
              latitude: coord[1],
              longitude: coord[0],
            })
          );
          setRouteCoordinates(coords);
          setRemainingRoute(coords);

          if (mapRef.current && coords.length > 0 && !hasFitRouteRef.current) {
            hasFitRouteRef.current = true;
            setTimeout(() => {
              mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
                animated: true,
              });
            }, 1000);
          }
        }
      } catch (e) {
        console.log('Erro ao buscar rota OSRM:', e);
      }

      const { data: firstGps } = await supabase
        .from('delivery_tracking')
        .select('lat, lng, created_at')
        .eq('order_id', trackingOrderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (firstGps && firstGps.lat != null && firstGps.lng != null) {
        const pos = { latitude: firstGps.lat, longitude: firstGps.lng };
        setCarPosition(pos);
        setShowCar(true);
        setIsTracking(true);
        prevPosRef.current = pos;
      } else {
        setCarPosition({ latitude: storeLocation.latitude, longitude: storeLocation.longitude });
        setShowCar(true);
      }

      const { data: orderData } = await supabase
        .from('orders')
        .select('status, delivering_at')
        .eq('id', trackingOrderId)
        .single();

      if (orderData) {
        setOrderStatus(orderData.status);
        setDeliveringAt(orderData.delivering_at);

        if (orderData.status === 'completed') {
          orderCompletedRef.current = true;
          setHasArrived(true);
          setIsTracking(false);
        }
      }

      const channel = supabase
        .channel(`map_delivery_tracking_${trackingOrderId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'delivery_tracking', filter: `order_id=eq.${trackingOrderId}` },
          (payload: any) => {
            const { lat, lng } = payload.new;
            if (lat == null || lng == null) return;

            const newPos = { latitude: lat, longitude: lng };

            if (prevPosRef.current) {
              const prevLng = prevPosRef.current.longitude;
              if (newPos.longitude !== prevLng) {
                setFacingRight(newPos.longitude > prevLng);
              }
            }

            prevPosRef.current = newPos;
            setCarPosition(newPos);
            setShowCar(true);
            setIsTracking(true);
            setHasArrived(false);
            orderCompletedRef.current = false;

            setRemainingRoute((prev) => {
              if (prev.length === 0) return prev;
              const closestIdx = findClosestPointIndex(newPos, prev);
              return prev.slice(closestIdx);
            });
          }
        )
        .subscribe();

      const orderChannel = supabase
        .channel(`map_order_status_${trackingOrderId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${trackingOrderId}` },
          (payload: any) => {
            const newOrder = payload.new as any;
            if (newOrder?.status) setOrderStatus(newOrder.status);
            if (newOrder?.delivering_at !== undefined) setDeliveringAt(newOrder.delivering_at);

            if (newOrder?.status === 'completed' && !orderCompletedRef.current) {
              orderCompletedRef.current = true;
              setHasArrived(true);
              setIsTracking(false);
              setTimeout(() => setShowCar(false), 60000);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(orderChannel);
      };
    };

    fetchRouteAndSubscribe();

    return () => {
      hasFitRouteRef.current = false;
    };
  }, [trackingOrderId, clientLocation, storeLocation]);

  const hasDeparted = orderStatus === 'delivering' && !!deliveringAt;

  const speechBubble = !hasArrived ? getSpeechBubbleText(orderStatus, deliveringAt) : null;

  return {
    routeCoordinates,
    remainingRoute,
    carPosition,
    isTracking,
    facingRight,
    hasArrived,
    showCar,
    handleGoBackFromTracking,
    speechBubble,
    orderStatus,
    deliveringAt,
    hasDeparted,
  };
}

function findClosestPointIndex(
  pos: { latitude: number; longitude: number },
  coords: { latitude: number; longitude: number }[]
): number {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < coords.length; i++) {
    const dlat = pos.latitude - coords[i].latitude;
    const dlng = pos.longitude - coords[i].longitude;
    const dist = dlat * dlat + dlng * dlng;
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  return minIdx;
}
