import { renderHook, act } from '@testing-library/react-native';
import { useCashRegisterScreen } from '../../presentation/screens/admin/CashRegister/CashRegisterScreen/useCashRegisterScreen';

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: { textDark: '#000' }, isDarkMode: false }),
}));

const mockNavigate = jest.fn();
let mockRouteParams: Record<string, any> = {};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
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
  isEditing: false,
  setIsEditing: jest.fn(),
  totals: { bills: 0, coins: 0, global: 0 },
  increment: jest.fn(),
  decrement: jest.fn(),
  handleSave: jest.fn(),
  handleUpdate: jest.fn(),
  canClose: jest.fn().mockReturnValue(false),
  isToday: true,
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

  it('getSectionTitle returns "Abertura do Caixa" for today', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.getSectionTitle()).toBe('Abertura do Caixa');
  });

  it('getSectionTitle returns "Caixa - DD-MM-YYYY" for other dates', () => {
    mockRouteParams = { date: '2025-06-09' };
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.getSectionTitle()).toBe('Caixa - 09-06-2025');
  });

  it('isPast is true for past dates', () => {
    mockRouteParams = { date: '2025-06-09' };
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.isPast).toBe(true);
  });

  it('isPast is false for today', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.isPast).toBe(false);
  });

  it('canEdit returns false when isPast', () => {
    mockRouteParams = { date: '2025-06-09' };
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(false);
  });

  it('canEdit returns true when no opening exists', () => {
    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit returns false when opening exists and not editing (line 31)', () => {
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      opening: { id: '1' },
      isEditing: false,
    });

    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(false);
  });

  it('canEdit returns false when closing exists and edited (line 32)', () => {
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      opening: undefined,
      closing: { id: '1', edited: true },
    });

    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(false);
  });

  it('canEdit returns true when opening exists, not edited, and isEditing (line 33)', () => {
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      opening: { id: '1', edited: false },
      closing: undefined,
      isEditing: true,
    });

    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit returns true when closing exists, not edited, and isEditing (line 34)', () => {
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      opening: undefined,
      closing: { id: '1', edited: false },
      isEditing: true,
    });

    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit returns true when no opening and not isPast (line 35 fallthrough)', () => {
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      opening: undefined,
    });

    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(true);
  });

  it('canEdit returns true via isEditing branch on line 35 when opening exists and edited', () => {
    mockUseCashRegister.mockReturnValue({
      ...defaultCashRegisterReturn,
      opening: { id: '1', edited: true },
      closing: undefined,
      isEditing: true,
    });

    const { result } = renderHook(() => useCashRegisterScreen());
    expect(result.current.canEdit).toBe(true);
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
});
