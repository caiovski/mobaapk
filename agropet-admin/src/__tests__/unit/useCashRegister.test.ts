import React from 'react';
import { Text, View } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';
import { useCashRegister } from '../../presentation/contexts/useCashRegister';
import * as service from '../../services/cashRegisterService';

jest.mock('../../utils/cashRegisterHours', () => ({
  canOpenCashRegister: jest.fn(() => true),
  canCloseCashRegister: jest.fn(() => true),
  getAutoCloseTime: jest.fn(() => 1440),
}));

jest.mock('../../services/cashRegisterService', () => ({
  fetchByDate: jest.fn(),
  fetchHistory: jest.fn(),
  saveEntry: jest.fn(),
  updateEntry: jest.fn(),
  markDayAsClosed: jest.fn(),
  calculateTotal: jest.fn(() => 0),
  calculateCoinsTotal: jest.fn(() => 0),
  calculateBillsTotal: jest.fn(() => 0),
}));

let hookResult: any;
let hookRenderCount = 0;
function TestComponent({ date }: { date: string }) {
  const r = useCashRegister(date);
  hookRenderCount++;
  React.useEffect(() => { hookResult = r; }, [r]);
  return React.createElement(View, null, React.createElement(Text, null, 'test'));
}

const mockEntry: any = {
  id: 'entry-1', code: 'CAIXA-10062025-001', entry_type: 'opening',
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

  it('should handle confirmOpening via handleAction', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    (service.saveEntry as jest.Mock).mockResolvedValue(mockEntry);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    hookResult.handleAction('startOpening');
    await act(async () => { await hookResult.handleAction('confirmOpening'); });
    expect(service.saveEntry).toHaveBeenCalledWith('opening', '2025-06-10', expect.any(Object));
  });

  it('should handle confirmClosing via handleAction', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    (service.saveEntry as jest.Mock).mockResolvedValue(mockClosingEntry);

    const closedEntry = { ...mockClosingEntry, closed: true };
    const closedOpening = { ...mockEntry, closed: true };

    (service.fetchByDate as jest.Mock).mockResolvedValueOnce({ opening: mockEntry, closing: undefined });
    (service.fetchByDate as jest.Mock).mockResolvedValueOnce({ opening: mockEntry, closing: mockClosingEntry });

    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    hookResult.handleAction('startClosing');
    await act(async () => { await hookResult.handleAction('confirmClosing'); });
    expect(service.saveEntry).toHaveBeenCalledWith('closing', '2025-06-10', expect.any(Object));
  });

  it('should calculate totals', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.totals).toBeDefined());
  });

  it('should determine isToday correctly', async () => {
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.isToday).toBe(true));
  });

  it('should determine isToday false for other dates', async () => {
    setup('2025-06-09');
    await waitFor(() => expect(hookResult?.isToday).toBe(false));
  });

  it('should show leftButton with enabled false when no opening and outside hours', async () => {
    const { canOpenCashRegister } = require('../../utils/cashRegisterHours');
    (canOpenCashRegister as jest.Mock).mockReturnValue(false);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.leftButton).toBeTruthy());
    expect(hookResult.leftButton.enabled).toBe(false);
  });

  it('should show leftButton with enabled true when no opening and within hours', async () => {
    const { canOpenCashRegister } = require('../../utils/cashRegisterHours');
    (canOpenCashRegister as jest.Mock).mockReturnValue(true);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.leftButton).toBeTruthy());
    expect(hookResult.leftButton.enabled).toBe(true);
  });

  it('should show rightButton with enabled true when opening exists and within close hours', async () => {
    const { canCloseCashRegister } = require('../../utils/cashRegisterHours');
    (canCloseCashRegister as jest.Mock).mockReturnValue(true);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => {
      expect(hookResult?.rightButton?.enabled).toBe(true);
    });
  });

  it('should show showEncerrar when opening and closing exist and not closed', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.showEncerrar).toBe(true));
  });

  it('should call markDayAsClosed when handleEncerrar is called', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    (service.markDayAsClosed as jest.Mock).mockResolvedValue(undefined);
    (service.fetchHistory as jest.Mock).mockResolvedValue([]);
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    await act(async () => { await hookResult.handleEncerrar(); });
    expect(service.markDayAsClosed).toHaveBeenCalledWith('entry-1', 'entry-2', false);
  });

  it('isViewMode should be true for past dates', async () => {
    setup('2025-06-09');
    await waitFor(() => expect(hookResult?.isViewMode).toBe(true));
  });

  it('isViewMode should be false for today without closed entry', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.isViewMode).toBe(false));
  });

  it('handle fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.fetchByDate as jest.Mock).mockRejectedValue(new Error('Network error'));
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.loading).toBe(false));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should setDenominationQty correctly', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    act(() => { hookResult.setDenominationQty('bill_100', 5); });
    expect(hookResult.denominations.bill_100).toBe(5);
    act(() => { hookResult.setDenominationQty('bill_100', -1); });
    expect(hookResult.denominations.bill_100).toBe(0);
  });

  it('should show skipMessage for past dates without opening', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-09');
    await waitFor(() => expect(hookResult?.skipMessage).toBeTruthy());
  });

  it('should return hasOpening false when no opening', async () => {
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.hasOpening).toBe(false));
  });

  it('should return hasOpening true when opening exists', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.hasOpening).toBe(true));
  });

  it('should handle editOpening via handleAction and setIsEditingOpening', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    act(() => { hookResult.handleAction('editOpening'); });
    expect(hookResult.denominations.bill_100).toBe(1);
    expect(hookResult.denominations.coin_100).toBe(3);
  });

  it('should handle editClosing via handleAction and setIsEditingClosing', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.closing?.id).toBe('entry-2'));
    act(() => { hookResult.handleAction('editClosing'); });
    expect(hookResult.denominations.bill_100).toBe(1);
    expect(hookResult.denominations.bill_50).toBe(1);
  });

  it('should handle confirmEditOpening via handleAction when opening exists', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    (service.updateEntry as jest.Mock).mockResolvedValue({ ...mockEntry, edited: true });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    hookResult.handleAction('editOpening');
    act(() => { hookResult.setDenominationQty('bill_100', 3); });
    await act(async () => { await hookResult.handleAction('confirmOpening'); });
    expect(service.updateEntry).toHaveBeenCalledWith('entry-1', expect.objectContaining({ bill_100: 3 }));
  });

  it('should handle confirmEditClosing via handleAction when closing exists', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    (service.updateEntry as jest.Mock).mockResolvedValue({ ...mockClosingEntry, edited: true });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.closing?.id).toBe('entry-2'));
    hookResult.handleAction('editClosing');
    act(() => { hookResult.setDenominationQty('bill_50', 2); });
    await act(async () => { await hookResult.handleAction('confirmClosing'); });
    expect(service.updateEntry).toHaveBeenCalledWith('entry-2', expect.objectContaining({ bill_50: 2 }));
  });

  it('should check autoClose when opening exists without closing', async () => {
    const { getAutoCloseTime } = require('../../utils/cashRegisterHours');
    (getAutoCloseTime as jest.Mock).mockReturnValue(0);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    (service.saveEntry as jest.Mock).mockResolvedValue(mockClosingEntry);
    (service.markDayAsClosed as jest.Mock).mockResolvedValue(undefined);
    setup('2025-06-10');
    await waitFor(() => expect(service.fetchByDate).toHaveBeenCalled());
    expect(service.saveEntry).toHaveBeenCalledWith('closing', '2025-06-10', expect.any(Object), 'Você esqueceu de fechar o caixa! Por essa razão, os valores foram salvos automaticamente.');
  });

  it('should check autoClose when closing exists but not closed', async () => {
    const { getAutoCloseTime } = require('../../utils/cashRegisterHours');
    (getAutoCloseTime as jest.Mock).mockReturnValue(0);
    const unclosedClosing = { ...mockClosingEntry, closed: false };
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: unclosedClosing });
    (service.markDayAsClosed as jest.Mock).mockResolvedValue(undefined);
    setup('2025-06-10');
    await waitFor(() => expect(service.fetchByDate).toHaveBeenCalled());
    expect(service.markDayAsClosed).toHaveBeenCalledWith('entry-1', 'entry-2', true, 'Você esqueceu de encerrar o caixa! Os valores foram salvos automaticamente.');
  });

  it('should not autoClose when before autoCloseTime', async () => {
    const { getAutoCloseTime } = require('../../utils/cashRegisterHours');
    (getAutoCloseTime as jest.Mock).mockReturnValue(1440);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(service.fetchByDate).toHaveBeenCalled());
    expect(service.saveEntry).not.toHaveBeenCalledWith('closing', '2025-06-10', expect.any(Object), expect.any(String));
  });

  it('should show rightButton with enabled false when opening exists and outside close hours', async () => {
    const { canCloseCashRegister } = require('../../utils/cashRegisterHours');
    (canCloseCashRegister as jest.Mock).mockReturnValue(false);
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => {
      expect(hookResult?.rightButton?.enabled).toBe(false);
    });
  });

  it('leftButton should be "Caixa aberto" when opening is already edited', async () => {
    const editedEntry = { ...mockEntry, edited: true };
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: editedEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => {
      expect(hookResult?.leftButton?.label).toBe('Caixa aberto');
      expect(hookResult?.leftButton?.enabled).toBe(false);
    });
  });

  it('rightButton should be "Fechamento salvo" when closing is already edited', async () => {
    const editedClosing = { ...mockClosingEntry, edited: true };
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: editedClosing });
    setup('2025-06-10');
    await waitFor(() => {
      expect(hookResult?.rightButton?.label).toBe('Fechamento salvo');
      expect(hookResult?.rightButton?.enabled).toBe(false);
    });
  });

  it('should populate empty denominations when both opening and closing exist', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    setup('2025-06-10');
    await waitFor(() => {
      expect(hookResult?.denominations?.bill_100).toBe(0);
      expect(hookResult?.denominations?.coin_100).toBe(0);
    });
  });

  it('handleStartClosing should pre-fill denominations from opening', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    act(() => { hookResult.handleAction('startClosing'); });
    expect(hookResult.denominations.bill_100).toBe(1);
    expect(hookResult.denominations.coin_100).toBe(3);
    expect(hookResult.showSteppers).toBe(true);
  });

  it('should show showSteppers during opening editing', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    act(() => { hookResult.handleAction('startOpening'); });
    await waitFor(() => expect(hookResult.showSteppers).toBe(true));
  });

  it('handleConfirmOpening should log error on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.saveEntry as jest.Mock).mockRejectedValue(new Error('Save failed'));
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    hookResult.handleAction('startOpening');
    await act(async () => { await hookResult.handleAction('confirmOpening'); });
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao salvar abertura:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handleConfirmEditOpening should log error on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.updateEntry as jest.Mock).mockRejectedValue(new Error('Update failed'));
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    hookResult.handleAction('editOpening');
    await act(async () => { await hookResult.handleAction('confirmOpening'); });
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao editar abertura:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handleConfirmClosing should log error on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.saveEntry as jest.Mock).mockRejectedValue(new Error('Close failed'));
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    hookResult.handleAction('startClosing');
    await act(async () => { await hookResult.handleAction('confirmClosing'); });
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao salvar fechamento:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handleConfirmEditClosing should log error on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    (service.updateEntry as jest.Mock).mockRejectedValue(new Error('Edit close failed'));
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.closing?.id).toBe('entry-2'));
    hookResult.handleAction('editClosing');
    await act(async () => { await hookResult.handleAction('confirmClosing'); });
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao editar fechamento:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handleEncerrar should log error on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: mockEntry, closing: mockClosingEntry });
    (service.markDayAsClosed as jest.Mock).mockRejectedValue(new Error('Encerrar failed'));
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    await act(async () => { await hookResult.handleEncerrar(); });
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao encerrar caixa:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handleAction editOpening should do nothing when no opening', async () => {
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    act(() => { hookResult.handleAction('editOpening'); });
    expect(hookResult.denominations.bill_100).toBe(0);
  });

  it('handleAction editClosing should do nothing when no closing', async () => {
    const editedEntry = { ...mockEntry, edited: true };
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: editedEntry, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult?.opening?.id).toBe('entry-1'));
    const denomBefore = { ...hookResult.denominations };
    act(() => { hookResult.handleAction('editClosing'); });
    expect(hookResult.showSteppers).toBe(false);
    expect(hookResult.denominations).toEqual(denomBefore);
  });

  it('handleEncerrar should do nothing when no opening or closing', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (service.fetchByDate as jest.Mock).mockResolvedValue({ opening: undefined, closing: undefined });
    setup('2025-06-10');
    await waitFor(() => expect(hookResult).toBeTruthy());
    await act(async () => { await hookResult.handleEncerrar(); });
    expect(service.markDayAsClosed).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
