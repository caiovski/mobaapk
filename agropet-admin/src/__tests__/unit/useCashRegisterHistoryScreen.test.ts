import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useCashRegisterHistoryScreen } from '../../presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/useCashRegisterHistoryScreen';
import { fetchHistory } from '../../services/cashRegisterService';

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: { textDark: '#000' }, isDarkMode: false }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockEntries: any[] = [
  { id: '1', code: 'CAIXA-20250610-001', date: '2025-06-10', entry_type: 'opening' },
  { id: '2', code: 'CAIXA-20250611-002', date: '2025-06-11', entry_type: 'opening' },
];

jest.mock('../../services/cashRegisterService', () => ({
  fetchHistory: jest.fn(),
}));

describe('useCashRegisterHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchHistory as jest.Mock).mockResolvedValue(mockEntries);
  });

  it('calls fetchHistory on mount and sets entries', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    expect(fetchHistory).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.entries).toEqual(mockEntries);
    });
    expect(result.current.loading).toBe(false);
  });

  it('handleView navigates to CashRegisterScreen with the date', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    await waitFor(() => expect(result.current.entries).toEqual(mockEntries));

    act(() => {
      result.current.handleView('2025-06-10');
    });

    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterScreen', { date: '2025-06-10' });
  });

  it('handles fetchHistory error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('Network error');
    (fetchHistory as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar histórico:', testError);
    expect(result.current.entries).toEqual([]);

    consoleSpy.mockRestore();
  });
});
