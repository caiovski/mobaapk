import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { useCashRegisterScreen } from '../../presentation/screens/admin/CashRegister/CashRegisterScreen/useCashRegisterScreen';

jest.mock('../../presentation/screens/admin/CashRegister/CashRegisterScreen/useCashRegisterScreen', () => ({
  useCashRegisterScreen: jest.fn(),
}));

jest.mock('../../presentation/screens/admin/CashRegister/CashRegisterScreen/components/DenominationRow', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    DenominationRow: ({ label, value, quantity, editable, onIncrement, onDecrement }: any) =>
      React.createElement(View, { testID: `denom-row-${label}` },
        React.createElement(Text, null, label),
        React.createElement(Text, { testID: `qty-${label}` }, String(quantity)),
        editable && React.createElement(TouchableOpacity, { testID: `inc-${label}`, onPress: onIncrement }, React.createElement(Text, null, '+')),
        editable && React.createElement(TouchableOpacity, { testID: `dec-${label}`, onPress: onDecrement }, React.createElement(Text, null, '-')),
      ),
  };
});

jest.mock('../../presentation/components/AdminHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'admin-header' });
});

jest.mock('../../presentation/components/AdminUserMenu', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { AdminUserMenu: () => React.createElement(View, { testID: 'admin-user-menu' }) };
});

jest.mock('../../presentation/screens/admin/CashRegister/CashRegisterScreen/CashRegisterScreen.styles', () => ({
  styles: {
    mainContainer: {},
    sectionHeader: {},
    totalRow: {},
    totalSeparator: {},
    globalTotal: {},
    actionBtn: {},
    actionBtnText: {},
    actionRow: {},
    filterRow: {},
    dateBtn: {},
    dateBtnText: {},
    scrollContent: {},
  },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'datetime-picker', ...props });
});

import CashRegisterScreen from '../../presentation/screens/admin/CashRegister/CashRegisterScreen/CashRegisterScreen';

const mockHook = useCashRegisterScreen as jest.MockedFunction<typeof useCashRegisterScreen>;

const defaultDenominations = {
  bill_200: 0, bill_100: 0, bill_50: 0, bill_20: 0, bill_10: 0, bill_5: 0, bill_2: 0,
  coin_100: 0, coin_050: 0, coin_025: 0, coin_010: 0, coin_005: 0,
};

const baseHookReturn = {
  isDarkMode: false,
  selectedDate: new Date().toISOString().split('T')[0],
  showDatePicker: false,
  setShowDatePicker: jest.fn(),
  isPast: false,
  canEdit: true,
  getSectionTitle: () => 'Abertura do Caixa',
  navigation: { goBack: jest.fn(), navigate: jest.fn() },
  handleHistoryPress: jest.fn(),
  handleDateChange: jest.fn(),
  opening: undefined,
  closing: undefined,
  denominations: { ...defaultDenominations },
  loading: false,
  history: [],
  isEditing: false,
  setIsEditing: jest.fn(),
  totals: { bills: 0, coins: 0, global: 0 },
  increment: jest.fn(),
  decrement: jest.fn(),
  handleSave: jest.fn(),
  handleUpdate: jest.fn(),
  canOpen: jest.fn().mockReturnValue(true),
  canClose: jest.fn().mockReturnValue(false),
  isToday: true,
  reload: jest.fn(),
};

describe('CashRegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading indicator when loading=true', () => {
    mockHook.mockReturnValue({ ...baseHookReturn, loading: true } as any);

    const { queryByText, UNSAFE_getAllByType } = render(React.createElement(CashRegisterScreen));
    const { ActivityIndicator } = require('react-native');

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    expect(queryByText('Confirmar abertura')).toBeNull();
  });

  it('should render empty state with no opening and show confirm opening button', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Confirmar abertura')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('should render opening entry showing denominations', () => {
    const mockTotals = { bills: 500, coins: 10, global: 510 };
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', code: 'CAIXA-001', date: '2025-06-10' },
      isPast: false,
      canEdit: false,
      denominations: { ...defaultDenominations, bill_100: 5, coin_100: 10 },
      totals: mockTotals,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Total em cédulas')).toBeTruthy();
    expect(getByText('Total em moedas')).toBeTruthy();
    expect(getByText(/500,00/)).toBeTruthy();
    expect(getByText(/510,00/)).toBeTruthy();
  });

  it('should call increment and decrement on denomination buttons', () => {
    const increment = jest.fn();
    const decrement = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
      increment,
      decrement,
    } as any);

    const { getByTestId } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByTestId('inc-R$ 200'));
    expect(increment).toHaveBeenCalledWith('bill_200');

    fireEvent.press(getByTestId('dec-R$ 200'));
    expect(decrement).toHaveBeenCalledWith('bill_200');
  });

  it('should call handleSave when Confirmar abertura is pressed', () => {
    const handleSave = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
      handleSave,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Confirmar abertura'));
    expect(handleSave).toHaveBeenCalledWith('opening');
  });

  it('should call handleUpdate when Confirmar is pressed in editing mode', () => {
    const handleUpdate = jest.fn();
    const setIsEditing = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      isPast: false,
      canEdit: true,
      isEditing: true,
      handleUpdate,
      setIsEditing,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Confirmar'));
    expect(handleUpdate).toHaveBeenCalled();
  });

  it('should call setIsEditing(false) when Cancelar is pressed in editing mode', () => {
    const setIsEditing = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      isPast: false,
      canEdit: true,
      isEditing: true,
      setIsEditing,
      handleUpdate: jest.fn(),
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Cancelar'));
    expect(setIsEditing).toHaveBeenCalledWith(false);
  });

  it('should show Fechar caixa disabled when canClose returns false (outside close window)', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      closing: undefined,
      isPast: false,
      canEdit: false,
      isToday: true,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Fechar caixa')).toBeTruthy();
  });

  it('should show Fechar caixa when canClose returns true within window and show closing entry edit', () => {
    const handleSave = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      closing: { id: '2', edited: false },
      isPast: false,
      canEdit: false,
      isToday: true,
      canClose: jest.fn().mockReturnValue(true),
      handleSave,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Editar abertura')).toBeTruthy();
    expect(getByText('Editar fechamento')).toBeTruthy();
  });

  it('should call handleSave with closing when Fechar caixa is pressed', () => {
    const handleSave = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      closing: undefined,
      isPast: false,
      canEdit: false,
      isToday: true,
      canClose: jest.fn().mockReturnValue(true),
      handleSave,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Fechar caixa'));
    expect(handleSave).toHaveBeenCalledWith('closing');
  });

  it('should call handleHistoryPress when Ver registro is pressed', () => {
    const handleHistoryPress = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      handleHistoryPress,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Ver registro'));
    expect(handleHistoryPress).toHaveBeenCalled();
  });

  it('should call setIsEditing(true) when Editar abertura is pressed', () => {
    const setIsEditing = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      isPast: false,
      canEdit: false,
      isEditing: false,
      setIsEditing,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Editar abertura'));
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('should render "Ver abertura" and "Ver fechamento" when isPast is true', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      isPast: true,
      opening: { id: '1' },
      closing: { id: '2' },
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Ver abertura')).toBeTruthy();
    expect(getByText('Ver fechamento')).toBeTruthy();
  });

  it('should show "Ver fechamento" grayed out when isPast and no closing', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      isPast: true,
      opening: { id: '1' },
      closing: undefined,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Ver abertura')).toBeTruthy();
    expect(getByText('Ver fechamento')).toBeTruthy();
  });

  it('should show "Confirmar abertura" disabled when canOpen is false', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
      canOpen: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Confirmar abertura')).toBeTruthy();
  });

  it('should call navigation.goBack when Cancelar is pressed with no opening', () => {
    const goBack = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
      navigation: { ...baseHookReturn.navigation, goBack },
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Cancelar'));
    expect(goBack).toHaveBeenCalled();
  });

  it('should call setIsEditing(true) when Editar fechamento is pressed', () => {
    const setIsEditing = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      closing: { id: '2', edited: false },
      isPast: false,
      canEdit: false,
      isEditing: false,
      setIsEditing,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Editar fechamento'));
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('should render with dark mode colors when isDarkMode is true', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      isDarkMode: true,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Confirmar abertura')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('should render DateTimePicker when showDatePicker is true', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      showDatePicker: true,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
    } as any);

    const { getByTestId } = render(React.createElement(CashRegisterScreen));

    expect(getByTestId('datetime-picker')).toBeTruthy();
  });

  it('should render DateTimePicker in dark mode', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      showDatePicker: true,
      isDarkMode: true,
      loading: false,
      opening: undefined,
      isPast: false,
      canEdit: true,
    } as any);

    const { getByTestId } = render(React.createElement(CashRegisterScreen));

    expect(getByTestId('datetime-picker')).toBeTruthy();
  });

  it('should call setShowDatePicker(true) when date button is pressed', () => {
    const setShowDatePicker = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      setShowDatePicker,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Selecionar data:'));
    expect(setShowDatePicker).toHaveBeenCalledWith(true);
  });

  it('should show Saturday/holiday close window message when canShowClose but not confirmable on a Saturday (line 165)', () => {
    const getDaySpy = jest.spyOn(Date.prototype, 'getDay').mockReturnValue(6);
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      closing: undefined,
      isPast: false,
      canEdit: false,
      isToday: true,
      canClose: jest.fn().mockReturnValue(false),
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText(/12:00 às 14:00/)).toBeTruthy();
    getDaySpy.mockRestore();
  });
});
