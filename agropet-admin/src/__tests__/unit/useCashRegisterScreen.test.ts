import { renderHook, act } from '@testing-library/react-native';
import { useCashRegisterScreen } from '../../presentation/screens/admin/CashRegister/CashRegisterScreen/useCashRegisterScreen';

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: { textDark: '#000' }, isDarkMode: false }),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: Record<string, any> = {};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockRouteParams }),
}));

const mockUseCashRegister = jest.fn();
jest.mock('../../presentation/contexts/useCashRegister', () => ({
  useCashRegister: (...args: any[]) => mockUseCashRegister(...args),
}));

const defaultCashRegisterReturn = {
  opening: undefined,
  closing: undefined,
  denominations: {},
  loading: false,
  history: [],
  totals: { bills: 0, coins: 0, global: 0 },
  increment: jest.fn(),
  decrement: jest.fn(),
  setDenominationQty: jest.fn(),
  isToday: true,
  isPast: false,
  isViewMode: false,
  isClosed: false,
  hasOpening: false,
  hasClosing: false,
  leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' as const },
  rightButton: undefined,
  showEncerrar: false,
  showSteppers: false,
  skipMessage: null,
  handleAction: jest.fn(),
  handleConfirmEditOpening: jest.fn(),
  handleConfirmEditClosing: jest.fn(),
  reload: jest.fn(),
};

describe('useCashRegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};
    mockUseCashRegister.mockReturnValue({ ...defaultCashRegisterReturn });
    jest.useFakeTimers().setSystemTime(new Date('2025-06-10T12:00:00Z'));
  });

  it('default selectedDate is today when no route param', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.selectedDate).toBe('2025-06-10');
  });

  it('selectedDate from route param when provided', () => {
    mockRouteParams = { date: '2025-06-09' };
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.selectedDate).toBe('2025-06-09');
  });

  it('isPast is true for past dates', () => {
    mockUseCashRegister.mockReturnValue({ ...defaultCashRegisterReturn, isPast: true });
    mockRouteParams = { date: '2025-06-09' };
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.isPast).toBe(true);
  });

  it('isPast is false for today', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.isPast).toBe(false);
  });

  it('handleHistoryPress navigates to CashRegisterHistoryScreen', () => {
    const { result } = renderHook(() => useCashRegisterScreen());

    act(() => {
      result.current.handleHistoryPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterHistoryScreen');
  });

  it('handleDateChange sets selectedDate and closes date picker', () => {
    const { result } = renderHook(() => useCashRegisterScreen());

    act(() => {
      result.current.setShowDatePicker(true);
    });
    expect(result.current.showDatePicker).toBe(true);

    act(() => {
      result.current.handleDateChange({}, new Date('2025-06-11'));
    });

    expect(result.current.showDatePicker).toBe(false);
    expect(result.current.selectedDate).toBe('2025-06-11');
  });

  it('handleDateChange without date only closes date picker', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    const prevDate = result.current.selectedDate;

    act(() => {
      result.current.setShowDatePicker(true);
    });
    expect(result.current.showDatePicker).toBe(true);

    act(() => {
      result.current.handleDateChange({}, undefined);
    });

    expect(result.current.showDatePicker).toBe(false);
    expect(result.current.selectedDate).toBe(prevDate);
  });

  it('handleEncerrar calls crHandleEncerrar and navigates', async () => {
    const mockCrHandleEncerrar = jest.fn();
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      handleEncerrar: mockCrHandleEncerrar,
    });
    const { result } = renderHook(() => useCashRegisterScreen());

    await act(async () => {
      await result.current.handleEncerrar();
    });

    expect(mockCrHandleEncerrar).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterHistoryScreen', { highlightDate: '2025-06-10' });
  });

  it('handleViewOpening navigates to CashRegisterCompareScreen with mode opening', () => {
    const { result } = renderHook(() => useCashRegisterScreen());

    act(() => {
      result.current.handleViewOpening();
    });

    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'opening' });
  });

  it('handleViewClosing navigates to CashRegisterCompareScreen with mode closing', () => {
    const { result } = renderHook(() => useCashRegisterScreen());

    act(() => {
      result.current.handleViewClosing();
    });

    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'closing' });
  });

  it('handleCompare navigates to CashRegisterCompareScreen with mode compare', () => {
    const { result } = renderHook(() => useCashRegisterScreen());

    act(() => {
      result.current.handleCompare();
    });

    expect(mockNavigate).toHaveBeenCalledWith('CashRegisterCompareScreen', { date: '2025-06-10', mode: 'compare' });
  });

  it('handleCancel calls navigation.goBack', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    act(() => {
      result.current.handleCancel();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('uses route params date when provided', () => {
    mockRouteParams = { date: '2025-06-09' };
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.selectedDate).toBe('2025-06-09');
  });
});
