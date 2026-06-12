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
  entries: [],
  loading: false,
  handleView: jest.fn(),
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
    expect(queryByText('Nenhum registro de abertura encontrado.')).toBeNull();
  });

  it('should render empty state when no entries', () => {
    mockHook.mockReturnValue({ ...baseHookReturn, loading: false, entries: [] } as any);

    const { getByText, queryByText } = render(React.createElement(CashRegisterHistoryScreen));

    expect(getByText('Nenhum registro de abertura encontrado.')).toBeTruthy();
  });

  it('should render list of history entries', () => {
    const mockEntries = [
      { id: '1', code: 'CAIXA-20250610-001', date: '2025-06-10' },
      { id: '2', code: 'CAIXA-20250611-002', date: '2025-06-11' },
    ];
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      entries: mockEntries,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterHistoryScreen));

    expect(getByText('CAIXA-20250610-001')).toBeTruthy();
    expect(getByText('CAIXA-20250611-002')).toBeTruthy();
  });

  it('should call handleView when Ver button is pressed on an entry', () => {
    const handleView = jest.fn();
    const mockEntries = [
      { id: '1', code: 'CAIXA-20250610-001', date: '2025-06-10' },
    ];
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      entries: mockEntries,
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
    const mockEntries = [
      { id: '1', code: 'CAIXA-20250610-001', date: '2025-06-10' },
    ];
    mockHook.mockReturnValue({
      ...baseHookReturn,
      loading: false,
      entries: mockEntries,
      isDarkMode: true,
    } as any);

    const { getByText } = render(React.createElement(CashRegisterHistoryScreen));

    expect(getByText('CAIXA-20250610-001')).toBeTruthy();
  });
});
