import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAdminDashboardPdv } from '../../presentation/screens/admin/AdminDashboard/useAdminDashboardPdv';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = { 'admin_pdv_sort_option': 'most_stock' };
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; return Promise.resolve(undefined); }),
    removeItem: jest.fn((key: string) => { delete store[key]; return Promise.resolve(undefined); }),
  };
});

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({ colors: {}, isDarkMode: false }),
}));

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    setOptions: jest.fn(),
    getParent: jest.fn(() => ({ setOptions: jest.fn() })),
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useRef: (init: any) => actual.useRef(init),
  };
});

let hookResult: any;
function TestComponent() {
  const r = useAdminDashboardPdv();
  React.useEffect(() => { hookResult = r; }, [r]);
  return React.createElement(View, null, React.createElement(Text, null, 'test'));
}

describe('useAdminDashboardPdv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hookResult = null;
  });

  it('should load sort option from AsyncStorage on mount', async () => {
    render(React.createElement(TestComponent));
    await waitFor(() => {
      expect(hookResult?.pdvSortOption).toBe('most_stock');
    });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('admin_pdv_sort_option');
  });

  it('should call setItem on handleSortChange', async () => {
    render(React.createElement(TestComponent));
    await waitFor(() => { expect(hookResult).toBeDefined(); });
    await act(async () => {
      hookResult.handleSortChange('most_stock');
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('admin_pdv_sort_option', 'most_stock');
    expect(hookResult.pdvSortOption).toBe('most_stock');
  });

  it('should setPdvMultiValue update correct method', () => {
    render(React.createElement(TestComponent));
    act(() => {
      hookResult.setPdvMultiValue('dinheiro', '50');
    });
    expect(hookResult.pdvMultiValues).toEqual({ dinheiro: '50', cartao_credito: '', cartao_debito: '', pix: '' });
  });

  it('should setPdvMultiValue update multiple methods', () => {
    render(React.createElement(TestComponent));
    act(() => {
      hookResult.setPdvMultiValue('dinheiro', '30');
      hookResult.setPdvMultiValue('pix', '70');
    });
    expect(hookResult.pdvMultiValues.dinheiro).toBe('30');
    expect(hookResult.pdvMultiValues.pix).toBe('70');
  });
});
