import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

jest.mock('../../presentation/screens/admin/CashRegister/CashRegisterScreen/components/GlowButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    GlowButton: ({ label, backgroundColor, enabled, onPress }: any) =>
      React.createElement(View, null,
        React.createElement(TouchableOpacity, { testID: `glow-${label}`, disabled: !enabled, onPress },
          React.createElement(Text, null, label),
        ),
      ),
  };
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
    cancelBtn: {},
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
  colors: { textDark: '#000' },
  navigation: { goBack: jest.fn(), navigate: jest.fn() },
  selectedDate: new Date().toISOString().split('T')[0],
  showDatePicker: false,
  setShowDatePicker: jest.fn(),
  quantityInputMode: false,
  setQuantityInputMode: jest.fn(),
  isPast: false,
  handleHistoryPress: jest.fn(),
  handleDateChange: jest.fn(),
  handleViewOpening: jest.fn(),
  handleViewClosing: jest.fn(),
  handleCompare: jest.fn(),
  handleCancel: jest.fn(),
  handleEncerrar: jest.fn(),
  opening: undefined,
  closing: undefined,
  denominations: { ...defaultDenominations },
  loading: false,
  history: [],
  totals: { bills: 0, coins: 0, global: 0 },
  increment: jest.fn(),
  decrement: jest.fn(),
  setDenominationQty: jest.fn(),
  isToday: true,
  isViewMode: false,
  isClosed: false,
  hasOpening: false,
  hasClosing: false,
  showSteppers: false,
  showEncerrar: false,
  skipMessage: null,
  leftButton: null as { label: string; color: string; enabled: boolean; action: string } | null,
  rightButton: null as { label: string; color: string; enabled: boolean; action: string } | null,
  handleAction: jest.fn(),
  handleConfirmEditOpening: jest.fn(),
  handleConfirmEditClosing: jest.fn(),
  reload: jest.fn(),
};

describe('CashRegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading indicator when loading=true', () => {
    mockHook.mockReturnValue({ ...baseHookReturn, loading: true } as any);

    const { UNSAFE_getAllByType } = render(React.createElement(CashRegisterScreen));
    const { ActivityIndicator } = require('react-native');

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('should render empty state with Abrir caixa and Cancelar when no opening', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      isViewMode: false,
      leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' },
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Abrir caixa')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('should render denominations and totals', () => {
    const mockTotals = { bills: 500, coins: 10, global: 510 };
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', code: 'CAIXA-001', date: '2025-06-10' },
      denominations: { ...defaultDenominations, bill_100: 5, coin_100: 10 },
      totals: mockTotals,
      hasOpening: true,
      isViewMode: true,
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
      showSteppers: true,
      leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' },
      increment,
      decrement,
    } as any);

    const { getByTestId } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByTestId('inc-R$ 200'));
    expect(increment).toHaveBeenCalledWith('bill_200');

    fireEvent.press(getByTestId('dec-R$ 200'));
    expect(decrement).toHaveBeenCalledWith('bill_200');
  });

  it('should call handleAction when leftButton glow is pressed', () => {
    const handleAction = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' },
      handleAction,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Abrir caixa'));
    expect(handleAction).toHaveBeenCalledWith('startOpening');
  });

  it('should call handleAction when rightButton glow is pressed', () => {
    const handleAction = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      hasOpening: true,
      rightButton: { label: 'Confirmar fechamento', color: '#F97D01', enabled: true, action: 'confirmClosing' },
      handleAction,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Confirmar fechamento'));
    expect(handleAction).toHaveBeenCalledWith('confirmClosing');
  });

  it('should show Comparar when both opening and closing exist in view mode', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1', edited: false },
      closing: { id: '2', edited: false },
      hasOpening: true,
      hasClosing: true,
      isViewMode: true,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Ver abertura')).toBeTruthy();
    expect(getByText('Ver fechamento')).toBeTruthy();
    expect(getByText('Comparar')).toBeTruthy();
    expect(getByText('Voltar')).toBeTruthy();
  });

  it('should show only Ver abertura when isPast and no closing', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      isPast: true,
      opening: { id: '1' },
      closing: undefined,
      hasOpening: true,
      hasClosing: false,
      isViewMode: true,
    } as any);

    const { getByText, queryByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Ver abertura')).toBeTruthy();
    expect(queryByText('Ver fechamento')).toBeNull();
    expect(queryByText('Comparar')).toBeNull();
  });

  it('should render Encerrar caixa button when showEncerrar is true', () => {
    const mockHandleEncerrar = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      showEncerrar: true,
      hasOpening: true,
      opening: { id: '1' },
      leftButton: { label: 'Confirmar abertura', color: '#339914', enabled: true, action: 'confirmOpening' },
      handleEncerrar: mockHandleEncerrar,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Encerrar caixa'));
    expect(mockHandleEncerrar).toHaveBeenCalled();
  });

  it('should call handleCancel when Cancelar is pressed', () => {
    const handleCancel = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' },
      handleCancel,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Cancelar'));
    expect(handleCancel).toHaveBeenCalled();
  });

  it('should call handleCancel when Voltar is pressed in view mode', () => {
    const handleCancel = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1' },
      hasOpening: true,
      isViewMode: true,
      handleCancel,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Voltar'));
    expect(handleCancel).toHaveBeenCalled();
  });

  it('should render with dark mode colors when isDarkMode is true', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      isDarkMode: true,
      loading: false,
      opening: undefined,
      leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' },
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Abrir caixa')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('should render DateTimePicker when showDatePicker is true', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      showDatePicker: true,
      loading: false,
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

  it('should show skipMessage when present', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1' },
      closing: { id: '2' },
      hasOpening: true,
      hasClosing: true,
      isViewMode: true,
      skipMessage: 'Você esqueceu de fechar o caixa!',
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Você esqueceu de fechar o caixa!')).toBeTruthy();
  });

  it('should show Ativar digitação switch when showSteppers is true', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: undefined,
      showSteppers: true,
      leftButton: { label: 'Abrir caixa', color: '#339914', enabled: true, action: 'startOpening' },
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    expect(getByText('Ativar digitação')).toBeTruthy();
  });

  it('should call handleViewOpening when Ver abertura is pressed', () => {
    const handleViewOpening = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1' },
      hasOpening: true,
      isViewMode: true,
      handleViewOpening,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Ver abertura'));
    expect(handleViewOpening).toHaveBeenCalled();
  });

  it('should call handleCompare when Comparar is pressed', () => {
    const handleCompare = jest.fn();
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      opening: { id: '1' },
      closing: { id: '2' },
      hasOpening: true,
      hasClosing: true,
      isViewMode: true,
      handleCompare,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterScreen));

    fireEvent.press(getByText('Comparar'));
    expect(handleCompare).toHaveBeenCalled();
  });
});