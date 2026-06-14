import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useCashRegisterHistoryScreen } from '../../presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/useCashRegisterHistoryScreen';

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: { textDark: '#000' }, isDarkMode: false }),
}));

const mockNavigate = jest.fn();
let mockRouteParams: Record<string, any> = {};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: mockRouteParams }),
}));

const mockEntries: any[] = [
  { id: '1', code: 'CAIXA-10062025-001', date: '2025-06-10', entry_type: 'opening' },
  { id: '2', code: 'CAIXA-11062025-002', date: '2025-06-11', entry_type: 'opening' },
  { id: '3', code: 'CAIXA-11062025-003', date: '2025-06-11', entry_type: 'closing' },
  { id: '4', code: 'CAIXA-12062025-004', date: '2025-06-12', entry_type: 'opening' },
];

let mockResolve: (value: any) => void;
let mockReject: (value: any) => void;

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockImplementation(() => new Promise((resolve, reject) => {
        mockResolve = resolve;
        mockReject = reject;
      })),
    })),
  },
}));

describe('useCashRegisterHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};
    mockResolve = jest.fn();
    mockReject = jest.fn();
  });

  it('queries supabase on mount and sets dates', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    await waitFor(() => {
      expect(result.current.dates).toBeDefined();
    });
  });

  it('aggregates entries into date summaries correctly', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    act(() => {
      mockResolve({ data: mockEntries, error: null });
    });

    await waitFor(() => {
      expect(result.current.dates.length).toBe(3);
    });

    const date10 = result.current.dates.find((d: any) => d.date === '2025-06-10');
    expect(date10.hasOpening).toBe(true);
    expect(date10.hasClosing).toBe(false);
    expect(date10.openingCode).toBe('CAIXA-10062025-001');

    const date11 = result.current.dates.find((d: any) => d.date === '2025-06-11');
    expect(date11.hasOpening).toBe(true);
    expect(date11.hasClosing).toBe(true);
    expect(date11.closingCode).toBe('CAIXA-11062025-003');

    const date12 = result.current.dates.find((d: any) => d.date === '2025-06-12');
    expect(date12.hasOpening).toBe(true);
    expect(date12.hasClosing).toBe(false);
  });

  it('sorts dates in descending order', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    act(() => {
      mockResolve({ data: mockEntries, error: null });
    });

    await waitFor(() => {
      expect(result.current.dates[0].date).toBe('2025-06-12');
      expect(result.current.dates[1].date).toBe('2025-06-11');
      expect(result.current.dates[2].date).toBe('2025-06-10');
    });
  });

  it('handleView navigates to CashRegisterCompareScreen with date and mode closing', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    act(() => {
      mockResolve({ data: mockEntries, error: null });
    });

    await waitFor(() => {
      expect(result.current.dates).toBeDefined();
    });

    act(() => {
      result.current.handleView('2025-06-10');
    });

    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'closing' });
  });

  it('returns highlightDate from route params', async () => {
    mockRouteParams = { highlightDate: '2025-06-10' };
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    act(() => {
      mockResolve({ data: [], error: null });
    });

    await waitFor(() => {
      expect(result.current.highlightDate).toBe('2025-06-10');
    });
  });

  it('handles error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    act(() => {
      mockReject(new Error('Load error'));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles onRefresh correctly', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    act(() => {
      mockResolve({ data: mockEntries, error: null });
    });

    await waitFor(() => {
      expect(result.current.dates.length).toBe(3);
    });

    act(() => {
      result.current.onRefresh();
    });

    expect(result.current.refreshing).toBe(true);
  });

  it('sets loading true initially then false after data loads', async () => {
    const { result } = renderHook(() => useCashRegisterHistoryScreen());

    expect(result.current.loading).toBe(true);

    act(() => {
      mockResolve({ data: mockEntries, error: null });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
