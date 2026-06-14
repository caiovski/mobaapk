import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { useCashRegisterHistoryScreen } from '../../presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/useCashRegisterHistoryScreen';

jest.mock('../../presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/useCashRegisterHistoryScreen', () => ({
  useCashRegisterHistoryScreen: jest.fn(),
}));

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

jest.mock('../../presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/CashRegisterHistoryScreen.styles', () => ({
  styles: {
    mainContainer: {},
    listContent: {},
    card: {},
    codeText: {},
    dateText: {},
    viewBtn: {},
    viewBtnText: {},
    emptyText: {},
  },
}));

import CashRegisterHistoryScreen from '../../presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/CashRegisterHistoryScreen';

const mockHook = useCashRegisterHistoryScreen as jest.MockedFunction<typeof useCashRegisterHistoryScreen>;

const baseHookReturn = {
  isDarkMode: false,
  navigation: { navigate: jest.fn() },
  dates: [],
  loading: false,
  handleView: jest.fn(),
  highlightDate: undefined,
};

describe('CashRegisterHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading indicator when loading=true', () => {
    mockHook.mockReturnValue({ ...baseHookReturn, loading: true } as any);

    const { queryByText, UNSAFE_getAllByType } = render(React.createElement(CashRegisterHistoryScreen));
    const { ActivityIndicator } = require('react-native');

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    expect(queryByText('Nenhum registro de caixa encontrado.')).toBeNull();
  });

  it('should render empty state when no dates', () => {
    mockHook.mockReturnValue({ ...baseHookReturn, loading: false } as any);

    const { getByText } = render(React.createElement(CashRegisterHistoryScreen));

    expect(getByText('Nenhum registro de caixa encontrado.')).toBeTruthy();
  });

  it('should render list of history entries with codes', () => {
    const mockDates = [
      { date: '2025-06-10', hasOpening: true, hasClosing: true, openingCode: 'CAIXA-10062025-001', closingCode: 'CAIXA-10062025-002' },
      { date: '2025-06-11', hasOpening: true, hasClosing: false, openingCode: 'CAIXA-11062025-001' },
    ];
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      dates: mockDates,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterHistoryScreen));

    expect(getByText('CAIXA-10062025-002')).toBeTruthy();
    expect(getByText('CAIXA-11062025-001')).toBeTruthy();
  });

  it('should call handleView when Ver button is pressed on an entry', () => {
    const handleView = jest.fn();
    const mockDates = [
      { date: '2025-06-10', hasOpening: true, hasClosing: true, closingCode: 'CAIXA-10062025-002' },
    ];
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      dates: mockDates,
      handleView,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterHistoryScreen));

    fireEvent.press(getByText('Ver'));
    expect(handleView).toHaveBeenCalledWith('2025-06-10');
  });

  it('should render loading indicator in dark mode', () => {
    mockHook.mockReturnValue({ ...baseHookReturn, loading: true, isDarkMode: true } as any);

    const { UNSAFE_getAllByType } = render(React.createElement(CashRegisterHistoryScreen));
    const { ActivityIndicator } = require('react-native');

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('should render entries list in dark mode', () => {
    const mockDates = [
      { date: '2025-06-10', hasOpening: true, hasClosing: true, closingCode: 'CAIXA-10062025-001' },
    ];
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      dates: mockDates,
      isDarkMode: true,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterHistoryScreen));

    expect(getByText('CAIXA-10062025-001')).toBeTruthy();
  });
});
