import * as Location from 'expo-location';
import { supabase } from '../data/datasources/supabase/client';

let locationSub: Location.LocationSubscription | null = null;
let currentOrderId: string | null = null;
let lastInsertTime = 0;
const MIN_INTERVAL_MS = 5000;

export async function startGpsTracking(orderId: string) {
  if (locationSub) return;
  currentOrderId = orderId;
  lastInsertTime = 0;

  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return;

  const bg = await Location.requestBackgroundPermissionsAsync();

  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 1,
    },
    async (loc) => {
      if (!currentOrderId) return;
      const now = Date.now();
      if (now - lastInsertTime < MIN_INTERVAL_MS) return;
      lastInsertTime = now;
      try {
        await supabase.from('delivery_tracking').insert({
          order_id: currentOrderId,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (e) {
        console.error('Erro ao inserir localização:', e);
      }
    }
  );
  locationSub = sub;
}

export function stopGpsTracking() {
  if (locationSub) {
    locationSub.remove();
    locationSub = null;
  }
  currentOrderId = null;
  lastInsertTime = 0;
}
