import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { supabase } from '../../data/datasources/supabase/client';
import AdminDashboardScreen from '../../presentation/screens/admin/AdminDashboard';

const mockCashFlowRows = [
  { id: '1', amount: 50, description: 'Sangria Manual de Caixa', type: 'sangria', payment_method: 'dinheiro', created_at: '2026-05-26T10:00:00Z', created_by: null },
  { id: '2', amount: 100, description: 'Suprimento Manual de Troco', type: 'suprimento', payment_method: 'dinheiro', created_at: '2026-05-26T10:05:00Z', created_by: null },
];

jest.mock('../../services/cashFlowService', () => {
  const rows = [
    { id: '1', amount: 50, description: 'Sangria Manual de Caixa', type: 'sangria', payment_method: 'dinheiro', created_at: '2026-05-26T10:00:00Z', created_by: null },
    { id: '2', amount: 100, description: 'Suprimento Manual de Troco', type: 'suprimento', payment_method: 'dinheiro', created_at: '2026-05-26T10:05:00Z', created_by: null },
  ];
  return {
    fetchCashFlow: jest.fn().mockResolvedValue(rows),
    insertCashFlow: jest.fn().mockResolvedValue({}),
  };
});

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockResolvedValue({ data: [{ total: 100, payment_method: 'dinheiro' }], error: null }),
        };
      }
      if (table === 'products') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
      };
    }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn().mockReturnValue(jest.fn()),
    getParent: jest.fn().mockReturnValue({
      setOptions: jest.fn(),
    }),
  }),
  useFocusEffect: (cb: () => void) => {
    const react = require('react');
    react.useEffect(() => { cb(); }, []);
  },
}));

jest.mock('../../presentation/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      white: '#FFFFFF',
      background: '#0B0D19',
      primary: '#FF0000',
      text: '#FFFFFF',
      border: '#2C2D3A',
      card: '#16192B',
      headerBackground: '#16192B',
      textDark: '#FFFFFF',
    },
    isDarkMode: true,
  }),
}));

jest.mock('../../presentation/contexts/useCategories', () => {
  const mockHook = () => ({ categories: [], allCategories: [], loading: false });
  return { useCategories: mockHook, CategoriesProvider: ({ children }: any) => { const React = require('react'); const { View } = require('react-native'); return React.createElement(View, null, children); } };
});

jest.mock('../../presentation/components/AdminHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn().mockImplementation(() => <View />);
});

jest.mock('../../presentation/components/AdminUserMenu', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AdminUserMenu: jest.fn().mockImplementation(() => <View />),
  };
});

jest.mock('../../presentation/screens/admin/AdminDashboard/useAdminDashboardPdv', () => {
  const { Animated } = require('react-native');
  const mockAnim = new Animated.Value(0);
  return {
    useAdminDashboardPdv: () => ({
      isPDVMode: false, pdvSelectMode: false, pdvProducts: [], pdvSearchText: '', pdvActiveCategories: [],
      pdvCart: {}, showCheckoutModal: false, dropdownExpanded: false, checkoutPaymentMethod: 'dinheiro',
      pdvLoading: false, dismissedProductIds: new Set(), cancelOpacity: mockAnim, pulseAnim: mockAnim,
      quantityInputMode: false, switchAnim: mockAnim, bulkInputUnit: {},
      setIsPDVMode: jest.fn(), setPdvSelectMode: jest.fn(), setPdvProducts: jest.fn(),
      setPdvSearchText: jest.fn(), setPdvActiveCategories: jest.fn(), setPdvCart: jest.fn(), setPdvSortOption: jest.fn(),
      setShowCheckoutModal: jest.fn(), setDropdownExpanded: jest.fn(), setCheckoutPaymentMethod: jest.fn(),
      setPdvLoading: jest.fn(), setDismissedProductIds: jest.fn(), dismissAlert: jest.fn(),
      togglePdvCart: jest.fn(), updatePdvCartQty: jest.fn(), setPdvCartQty: jest.fn(),
      handleConfirmPdvSale: jest.fn(),
    }),
  };
});

describe('AdminDashboard - Cash Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar transações do cash_flow via Supabase', async () => {
    const { findByText, queryByText, debug } = render(<AdminDashboardScreen />);

    await findByText('Fluxo de Caixa no Período', {}, { timeout: 5000 });

    expect(await findByText('Sangria Manual de Caixa', {}, { timeout: 3000 })).toBeTruthy();
    expect(await findByText('Suprimento Manual de Troco', {}, { timeout: 1000 })).toBeTruthy();

    expect(queryByText('Venda PDV')).toBeNull();
    expect(queryByText('Venda PDV (Cancelada)')).toBeNull();
  });
});
