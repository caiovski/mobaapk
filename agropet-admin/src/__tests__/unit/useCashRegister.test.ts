import React from 'react';
import { Text, View } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';
import { useCashRegister } from '../../presentation/contexts/useCashRegister';
import * as service from '../../services/cashRegisterService';

jest.mock('../../services/cashRegisterService', () => ({
  fetchByDate: jest.fn(),
  fetchHistory: jest.fn(),
  saveEntry: jest.fn(),
  updateEntry: jest.fn(),
  calculateTotal: jest.fn(),
  calculateCoinsTotal: jest.fn(),
  calculateBillsTotal: jest.fn(),
}));

jest.mock('../../utils/shopHours', () => ({
  isHoliday: jest.fn(() => false),
  getStoreHoursForDate: jest.fn((date: Date) => {
    if (date.getDay() === 0) return { isOpenToday: false, openHour: 0, closeHour: 0 };
    return { isOpenToday: true, openHour: 8, closeHour: 18 };
  }),
}));

import { isHoliday, getStoreHoursForDate } from '../../utils/shopHours';

let hookResult: any;
let hookRenderCount = 0;
function TestComponent({ date }: { date: string }) {
  const r = useCashRegister(date);
  hookRenderCount++;
  React.useEffect(() => { hookResult = r; }, [r]);
  return React.createElement(View, null, React.createElement(Text, null, 'test'));
}

const mockEntry: any = {
  id: 'entry-1', code: 'CAIXA-20250610-001', entry_type: 'opening',
  date: '2025-06-10',
  bill_200: 0, bill_100: 1, bill_50: 0, bill_20: 2, bill_10: 0, bill_5: 1, bill_2: 0,
  coin_100: 3, coin_050: 0, coin_025: 0, coin_010: 0, coin_005: 0,
  total_value: 100,
  edited: false, edited_at: null,
  created_at: '2025-06-10T10:00:00Z',
  user_id: 'user-1',
};

const mockClosingEntry: any = {
  ...mockEntry, id: 'entry-2', entry_type: 'closing',
  bill_100: 1, bill_50: 1, total_value: 150,
};

describe('useCashRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isHoliday as jest.Mock).mockReturnValue(false);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    (service.fetchHistory as jest.Mock).mockResolvedValue([]);
    jest.useFakeTimers().setSystemTime(new Date('2025-06-10T12:00:00Z'));
  });

  function setup(date: string) {
    hookResult = null;
    hookRenderCount = 0;
    render(React.createElement(TestComponent, { date }));
  }

  it('should load opening/closing data on mount', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
  });

  it('should populate denominations from opening when closing is absent', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.denominations?.bill_100).toBe(1));
  });

  it('should reset denominations when no opening exists', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.denominations?.bill_100).toBe(0));
  });

  it('should increment and decrement denominations', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    act(() => { hookResult.increment('bill_50'); });
    expect(hookResult.denominations.bill_50).toBe(1);
    act(() => { hookResult.decrement('bill_50'); });
    expect(hookResult.denominations.bill_50).toBe(0);
    act(() => { hookResult.decrement('bill_50'); });
    expect(hookResult.denominations.bill_50).toBe(0);
  });

  it('should handle save for opening and reload', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    (service.saveEntry as jest.Mock).mockResolvedValue(mockEntry);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    await act(async () => { await hookResult.handleSave('opening'); });
    expect(service.saveEntry).toHaveBeenCalledWith('opening', '2025-06-10', expect.any(Object));
  });

  it('should handle save for closing', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    (service.saveEntry as jest.Mock).mockResolvedValue(mockClosingEntry);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    await act(async () => { await hookResult.handleSave('closing'); });
    expect(service.saveEntry).toHaveBeenCalledWith('closing', '2025-06-10', expect.any(Object));
  });

  it('should handle update for opening (no closing)', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    (service.updateEntry as jest.Mock).mockResolvedValue({ ...mockEntry, edited: true });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    await act(async () => { await hookResult.handleUpdate(); });
    expect(service.updateEntry).toHaveBeenCalledWith('entry-1', expect.any(Object));
  });

  it('should handle update for closing', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    (service.updateEntry as jest.Mock).mockResolvedValue({ ...mockClosingEntry, edited: true });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    await act(async () => { await hookResult.handleUpdate(); });
    expect(service.updateEntry).toHaveBeenCalledWith('entry-2', expect.any(Object));
  });

  it('should calculate totals', async () => {
    (service.calculateTotal as jest.Mock).mockReturnValue(100);
    (service.calculateBillsTotal as jest.Mock).mockReturnValue(80);
    (service.calculateCoinsTotal as jest.Mock).mockReturnValue(20);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.totals?.global).toBe(100));
    expect(hookResult.totals.bills).toBe(80);
    expect(hookResult.totals.coins).toBe(20);
  });

  it('should determine isToday correctly', async () => {
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.isToday).toBe(true));
  });

  it('should determine isToday false for other dates', async () => {
    setup('2025-06-09');
    await waitFor(() => expect(hookResult?.isToday).toBe(false));
  });

  it('canClose should return false when hour is outside 17-19 (weekday)', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 12);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(false);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return true when hour is inside 17-19 (weekday)', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 18);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(true);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return true when hour is at boundary 17 (weekday)', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 17);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(true);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return false when hour is at boundary 19 (weekday)', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 19);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(false);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return true for Saturday 12-14 window', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    const origGetDay = Date.prototype.getDay;
    Date.prototype.getDay = jest.fn(() => 6);
    Date.prototype.getHours = jest.fn(() => 13);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(true);
    Date.prototype.getDay = origGetDay;
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return false for Saturday outside 12-14', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    const origGetDay = Date.prototype.getDay;
    Date.prototype.getDay = jest.fn(() => 6);
    Date.prototype.getHours = jest.fn(() => 15);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(false);
    Date.prototype.getDay = origGetDay;
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return true for holiday 12-14 window', async () => {
    (isHoliday as jest.Mock).mockReturnValue(true);
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 13);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(true);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canClose should return false on Sunday', async () => {
    const origGetDay = Date.prototype.getDay;
    Date.prototype.getDay = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canClose()).toBe(false);
    Date.prototype.getDay = origGetDay;
  });

  it('canOpen should return false on Sunday', async () => {
    const origGetDay = Date.prototype.getDay;
    Date.prototype.getDay = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canOpen()).toBe(false);
    Date.prototype.getDay = origGetDay;
  });

  it('canOpen should return true during 07:30-09:00 on weekday', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 8);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canOpen()).toBe(true);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canOpen should return true at 07:30 boundary', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 7);
    Date.prototype.getMinutes = jest.fn(() => 30);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canOpen()).toBe(true);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canOpen should return false before 07:30', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 7);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canOpen()).toBe(false);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canOpen should return false at 09:00 boundary', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    Date.prototype.getHours = jest.fn(() => 9);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canOpen()).toBe(false);
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('canOpen should return true on Saturday', async () => {
    const origGetHours = Date.prototype.getHours;
    const origGetMinutes = Date.prototype.getMinutes;
    const origGetDay = Date.prototype.getDay;
    Date.prototype.getDay = jest.fn(() => 6);
    Date.prototype.getHours = jest.fn(() => 8);
    Date.prototype.getMinutes = jest.fn(() => 0);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    expect(hookResult.canOpen()).toBe(true);
    Date.prototype.getDay = origGetDay;
    Date.prototype.getHours = origGetHours;
    Date.prototype.getMinutes = origGetMinutes;
  });

  it('should handle update when both opening and closing are undefined (implicit else)', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    (service.updateEntry as jest.Mock).mockResolvedValue(undefined);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    await act(async () => { await hookResult.handleUpdate(); });
    expect(service.updateEntry).not.toHaveBeenCalled();
  });

  it('handle fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.fetchByDate as jest.Mock).mockRejectedValue(new Error('Network error'));
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.loading).toBe(false));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
