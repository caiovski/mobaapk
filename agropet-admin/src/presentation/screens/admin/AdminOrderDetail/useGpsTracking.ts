import { useEffect } from 'react';
import { startGpsTracking, stopGpsTracking } from '../../../../services/gpsTrackingService';

export function useGpsTracking(order: any, departed: boolean) {
  useEffect(() => {
    if (departed && order?.status === 'delivering' && order?.id) {
      startGpsTracking(order.id);
    }
  }, [departed]);

  useEffect(() => {
    if (order?.status === 'completed' || order?.status === 'cancelled') {
      stopGpsTracking();
    }
  }, [order?.status]);

  useEffect(() => {
    return () => stopGpsTracking();
  }, []);
}
