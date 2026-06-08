import React from 'react';
import { render } from '@testing-library/react-native';
import { useGpsTracking } from '../../../presentation/screens/admin/AdminOrderDetail/useGpsTracking';

const mockStartGpsTracking = jest.fn();
const mockStopGpsTracking = jest.fn();

jest.mock('../../../services/gpsTrackingService', () => ({
  startGpsTracking: (...args: any[]) => mockStartGpsTracking(...args),
  stopGpsTracking: () => mockStopGpsTracking(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

let hookResult: { order: any; departed: boolean } | null;

function Test({ order, departed, rerender }: any) {
  useGpsTracking(order, departed);
  React.useEffect(() => {
    hookResult = { order, departed };
    if (rerender) rerender();
  }, [order, departed]);
  return null;
}

describe('useGpsTracking', () => {
  it('should start tracking when departed and delivering', () => {
    hookResult = null;
    render(React.createElement(Test, { order: { id: 'order-1', status: 'delivering' }, departed: true }));
    expect(mockStartGpsTracking).toHaveBeenCalledWith('order-1');
  });

  it('should NOT start tracking when not departed', () => {
    hookResult = null;
    render(React.createElement(Test, { order: { id: 'order-1', status: 'delivering' }, departed: false }));
    expect(mockStartGpsTracking).not.toHaveBeenCalled();
  });

  it('should NOT start tracking when status is not delivering', () => {
    hookResult = null;
    render(React.createElement(Test, { order: { id: 'order-1', status: 'preparing' }, departed: true }));
    expect(mockStartGpsTracking).not.toHaveBeenCalled();
  });

  it('should stop tracking when completed', () => {
    hookResult = null;
    const { rerender } = render(React.createElement(Test, { order: { id: 'order-1', status: 'delivering' }, departed: true }));
    expect(mockStartGpsTracking).toHaveBeenCalled();

    rerender(React.createElement(Test, { order: { id: 'order-1', status: 'completed' }, departed: true }));
    expect(mockStopGpsTracking).toHaveBeenCalled();
  });

  it('should stop tracking when cancelled', () => {
    hookResult = null;
    const { rerender } = render(React.createElement(Test, { order: { id: 'order-1', status: 'delivering' }, departed: true }));
    expect(mockStartGpsTracking).toHaveBeenCalled();

    rerender(React.createElement(Test, { order: { id: 'order-1', status: 'cancelled' }, departed: true }));
    expect(mockStopGpsTracking).toHaveBeenCalled();
  });

  it('should stop tracking on unmount', () => {
    hookResult = null;
    const { unmount } = render(React.createElement(Test, { order: { id: 'order-1', status: 'delivering' }, departed: true }));
    expect(mockStartGpsTracking).toHaveBeenCalled();
    mockStopGpsTracking.mockClear();

    unmount();
    expect(mockStopGpsTracking).toHaveBeenCalled();
  });
});