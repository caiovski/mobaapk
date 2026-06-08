import * as Location from 'expo-location';
import { supabase } from '../../../data/datasources/supabase/client';

jest.mock('../../../services/gpsTrackingService', () => {
  const actual = jest.requireActual('../../../services/gpsTrackingService');
  return actual;
});

let mockInsert: jest.Mock;
let mockWatchCallback: ((loc: any) => void) | null;
const mockRemove = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockWatchCallback = null;

  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (Location.watchPositionAsync as jest.Mock).mockImplementation(async (_opts: any, cb: any) => {
    mockWatchCallback = cb;
    return { remove: mockRemove };
  });

  mockInsert = jest.fn().mockResolvedValue(undefined);
  (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
});

afterEach(() => {
  const { stopGpsTracking } = require('../../../services/gpsTrackingService');
  stopGpsTracking();
});

describe('gpsTrackingService', () => {
  it('should start GPS tracking and insert location', async () => {
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-123');
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.requestBackgroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.watchPositionAsync).toHaveBeenCalled();

    mockWatchCallback!({
      coords: { latitude: -21.9765, longitude: -45.3469 },
    });

    expect(mockInsert).toHaveBeenCalledWith({
      order_id: 'order-123',
      lat: -21.9765,
      lng: -45.3469,
    });
  });

  it('should handle insert error gracefully', async () => {
    mockInsert.mockRejectedValue(new Error('insert failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-123');

    await mockWatchCallback!({ coords: { latitude: -21.9765, longitude: -45.3469 } });

    expect(consoleSpy).toHaveBeenCalledWith('Erro ao inserir localização:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should not start if already tracking', async () => {
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-1');
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
    await startGpsTracking('order-2');
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('should not start if foreground permission denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-123');
    expect(Location.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('should stop tracking and cleanup', async () => {
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-123');
    const { stopGpsTracking } = require('../../../services/gpsTrackingService');
    stopGpsTracking();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('should not throw when stopping without subscription', () => {
    const { stopGpsTracking } = require('../../../services/gpsTrackingService');
    expect(() => stopGpsTracking()).not.toThrow();
  });

  it('should throttle inserts within MIN_INTERVAL_MS', async () => {
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-123');

    mockWatchCallback!({ coords: { latitude: -21.9765, longitude: -45.3469 } });
    expect(mockInsert).toHaveBeenCalledTimes(1);

    mockWatchCallback!({ coords: { latitude: -22.0, longitude: -45.5 } });
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('should skip insert if currentOrderId is null', async () => {
    const { startGpsTracking } = require('../../../services/gpsTrackingService');
    await startGpsTracking('order-123');
    const { stopGpsTracking } = require('../../../services/gpsTrackingService');
    stopGpsTracking();

    mockWatchCallback!({ coords: { latitude: -21.9765, longitude: -45.3469 } });
    expect(mockInsert).not.toHaveBeenCalled();
  });
});