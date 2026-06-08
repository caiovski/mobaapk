import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Keyboard } from 'react-native';
import MapView from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useTheme } from '../../../contexts/ThemeContext';

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

export function findClosestPointIndex(
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

export const DEFAULT_STORE_LOCATION = {
  latitude: -21.9765, longitude: -45.3469,
  latitudeDelta: 0.005, longitudeDelta: 0.005,
};

export const isNightTime = () => { const h = new Date().getHours(); return h >= 18 || h < 6; };

export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export function useAdminMapScreen() {
  const mapRef = useRef<MapView>(null);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();

  const [storeLocation, setStoreLocation] = useState(DEFAULT_STORE_LOCATION);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<any>(null);
  const [trackedClient, setTrackedClient] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [remainingRoute, setRemainingRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [carPosition, setCarPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);
  const [showCar, setShowCar] = useState(true);
  const [deliveryRadius, setDeliveryRadius] = useState(17);
  const [orderStatus, setOrderStatus] = useState<string | undefined>(undefined);
  const [deliveringAt, setDeliveringAt] = useState<string | null | undefined>(undefined);

  const prevPosRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const orderIdRef = useRef<string | null>(null);

  const fetchStoreLocation = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('agropet_store_location').select('latitude, longitude').eq('id', 1).single();
      if (data && !error) setStoreLocation({ ...DEFAULT_STORE_LOCATION, latitude: data.latitude, longitude: data.longitude });
    } catch (e) { /* ignore */ }
  }, []);

  const fetchRadius = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('delivery_radius_km').maybeSingle();
      setDeliveryRadius(data && !error && data.delivery_radius_km !== null ? data.delivery_radius_km : 17);
    } catch (e) { setDeliveryRadius(17); }
  }, []);

  useEffect(() => { fetchStoreLocation(); fetchRadius(); }, [fetchStoreLocation, fetchRadius]);

  /* istanbul ignore next */
  const animateCarTo = (
    startCoord: { latitude: number; longitude: number },
    endCoord: { latitude: number; longitude: number },
    duration: number, onFinished?: () => void
  ) => {
    if (onFinished) onFinished();
  };

  const fetchLocations = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      const queryWithCity = `${query}, Lambari, Minas Gerais, Brasil`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCity)}&limit=5&countrycodes=br`,
        { headers: { 'User-Agent': 'AgropetAppAdmin/1.0', 'Accept-Language': 'pt-BR,pt;q=0.9' } }
      );
      const text = await response.text();
      try { setSuggestions(JSON.parse(text)); } catch (e) { console.error('JSON error:', text); }
    } catch (error) { console.error('Erro ao buscar local', error); }
    finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim().length > 2) fetchLocations(searchQuery); else setSuggestions([]);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, fetchLocations]);

  /* istanbul ignore next */
  const handleSelectLocation = (loc: any) => {
    Keyboard.dismiss(); setSearchQuery(''); setSuggestions([]);
    const lat = parseFloat(loc.lat), lon = parseFloat(loc.lon);
    const name = loc.name || loc.display_name.split(',')[0];
    setSearchedLocation({ latitude: lat, longitude: lon, title: name, description: loc.display_name });
    if (mapRef.current) mapRef.current.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  useEffect(() => {
    let currentStoreLoc = storeLocation;
    let trackingChannel: any = null;
    let orderChannel: any = null;

    const loadAndTrack = async () => {
      fetchRadius();
      try {
        const { data, error } = await supabase.from('agropet_store_location').select('latitude, longitude').eq('id', 1).single();
        if (data && !error) { currentStoreLoc = { ...DEFAULT_STORE_LOCATION, latitude: data.latitude, longitude: data.longitude }; setStoreLocation(currentStoreLoc); }
      } catch (e) { console.log('Error loading store location on focus:', e); }

      const params = route.params;
      if (params?.clientLocation) {
        const clientLoc = params.clientLocation;
        setTrackedClient(clientLoc);
        /* istanbul ignore next */ if (mapRef.current) mapRef.current.animateToRegion({ latitude: clientLoc.latitude, longitude: clientLoc.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 1000);

        try {
          const origin = `${currentStoreLoc.longitude},${currentStoreLoc.latitude}`;
          const destination = `${clientLoc.longitude},${clientLoc.latitude}`;
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((coord: any) => ({ latitude: coord[1], longitude: coord[0] }));
            setRouteCoordinates(coords);
            setRemainingRoute(coords);
          }
        } catch (err) { console.error('Erro ao buscar rota:', err); }

        const orderId = clientLoc.orderId;
        if (orderId) {
          orderIdRef.current = orderId;

          const { data: firstGps } = await supabase
            .from('delivery_tracking')
            .select('lat, lng, created_at')
            .eq('order_id', orderId)
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
            setCarPosition({ latitude: currentStoreLoc.latitude, longitude: currentStoreLoc.longitude });
          }

          const { data: orderData } = await supabase
            .from('orders')
            .select('status, delivering_at')
            .eq('id', orderId)
            .single();

          if (orderData) {
            setOrderStatus(orderData.status);
            setDeliveringAt(orderData.delivering_at);
          }

          if (orderData?.status === 'completed') {
            setHasArrived(true);
            setIsTracking(false);
          }

          trackingChannel = supabase
            .channel(`admin_map_tracking_${orderId}`)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'delivery_tracking', filter: `order_id=eq.${orderId}` },
              (payload: any) => {
                const { lat, lng } = payload.new;
                if (lat == null || lng == null) return;
                const newPos = { latitude: lat, longitude: lng };
                if (prevPosRef.current && newPos.longitude !== prevPosRef.current.longitude) {
                  setFacingRight(newPos.longitude > prevPosRef.current.longitude);
                }
                prevPosRef.current = newPos;
                setCarPosition(newPos);
                setShowCar(true);
                setIsTracking(true);
                setHasArrived(false);
                setRemainingRoute((prev) => {
                  /* istanbul ignore next */
                  if (prev.length === 0) return prev;
                  const closestIdx = findClosestPointIndex(newPos, prev);
                  return prev.slice(closestIdx);
                });
              }
            )
            .subscribe();

          orderChannel = supabase
            .channel(`admin_map_order_${orderId}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
              (payload: any) => {
                const newOrder = payload.new as any;
                if (newOrder?.status) setOrderStatus(newOrder.status);
                if (newOrder?.delivering_at !== undefined) setDeliveringAt(newOrder.delivering_at);

                if (newOrder?.status === 'completed') {
                  setHasArrived(true);
                  setIsTracking(false);
                  /* istanbul ignore next */
                  setTimeout(() => setShowCar(false), 60000);
                }
              }
            )
            .subscribe();
        }
      } else {
        setTrackedClient(null);
      }
    };

    loadAndTrack();

    return () => {
      if (trackingChannel) supabase.removeChannel(trackingChannel);
      if (orderChannel) supabase.removeChannel(orderChannel);
      orderIdRef.current = null;
    };
  }, [route.params?.clientLocation, fetchRadius]);

  useEffect(() => {
    const unsubBlur = navigation.addListener('blur', () => {
      setTrackedClient(null); setRouteCoordinates([]); setRemainingRoute([]); setCarPosition(null);
      setIsTracking(false); setHasArrived(false); setShowCar(true);
      prevPosRef.current = null;
      orderIdRef.current = null;
      navigation.setParams({ clientLocation: null });
    });
    return unsubBlur;
  }, [navigation]);

  const handleGoBackFromTracking = useCallback(() => {
    setTrackedClient(null); setRouteCoordinates([]); setRemainingRoute([]); setCarPosition(null);
    setIsTracking(false); setHasArrived(false); setShowCar(true);
    prevPosRef.current = null;
    orderIdRef.current = null;
    navigation.setParams({ clientLocation: null });
    navigation.goBack();
  }, [navigation]);

  /* istanbul ignore next */
  const handleMarkerDragEnd = async (e: any) => {
    if (!isEditingLocation) return;
    const nc = e.nativeEvent.coordinate;
    try {
      const { error } = await supabase.from('agropet_store_location').upsert({ id: 1, latitude: nc.latitude, longitude: nc.longitude });
      if (!error) { setStoreLocation({ ...storeLocation, latitude: nc.latitude, longitude: nc.longitude }); setIsEditingLocation(false); Alert.alert('Sucesso', 'Localização da loja atualizada com sucesso!'); }
      else Alert.alert('Erro', 'Falha ao salvar a nova localização.');
    } catch (err) { Alert.alert('Erro', 'Erro de conexão.'); }
  };

  /* istanbul ignore next */
  const handleSetStoreLocation = () => {
    if (isEditingLocation) { setIsEditingLocation(false); return; }
    Alert.alert('Mudar Localização', 'Tem certeza que deseja mudar a localização da loja?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quero mudar', onPress: () => { setIsEditingLocation(true); Alert.alert('Modo Edição', 'Segure e arraste o pino vermelho no mapa para o novo local!'); } }
    ]);
  };

  const speechBubble = !hasArrived ? getSpeechBubbleText(orderStatus, deliveringAt) : null;
  const hasDeparted = (orderStatus === 'delivering' && !!deliveringAt) || orderStatus === 'completed';

  return {
    colors, isDarkMode, navigation, mapRef, route,
    storeLocation, isEditingLocation, searchQuery, setSearchQuery,
    suggestions, isSearching, searchedLocation,
    trackedClient, routeCoordinates, remainingRoute,
    carPosition, isTracking, facingRight, hasArrived, showCar, deliveryRadius,
    orderStatus, deliveringAt, hasDeparted,
    speechBubble,
    handleSelectLocation, handleGoBackFromTracking, handleMarkerDragEnd, handleSetStoreLocation,
    setIsEditingLocation, animateCarTo,
  };
}
