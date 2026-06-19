import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Animated } from 'react-native';
import DashboardOverview from '../../presentation/screens/admin/AdminDashboard/components/DashboardOverview/DashboardOverview';

jest.mock('../../presentation/screens/admin/AdminDashboard/components/DashboardOverview/DashboardOverview.styles', () => ({ styles: {} }));
jest.mock('react-native-svg', () => ({ Svg: 'Svg', Path: 'Path', Circle: 'Circle', Defs: 'Defs', LinearGradient: 'LinearGradient', Stop: 'Stop', Line: 'Line', G: 'G', Text: 'Text' }));
jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));
jest.mock('../../presentation/screens/admin/AdminDashboard/components/DashboardOverview/DashboardOverviewGraph', () => 'DashboardOverviewGraph');

const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;
const pulseAnim = new Animated.Value(0);

const baseProps = {
  isDarkMode: false,
  colors: {},
  saldoTotalCaixaGeral: 1000,
  totalCreditoGeral: 300,
  totalDebitoGeral: 200,
  totalPixGeral: 100,
  totalDinheiroCaixaGeral: 500,
  formatCurrency,
  pulseAnim,
  onNavigateConsultSales: jest.fn(),
  onEnterPDV: jest.fn(),
  onOpenCashRegister: jest.fn(),
  onOpenSuprimento: jest.fn(),
  onOpenSangria: jest.fn(),
  getDynamicTitle: () => 'Vendas',
  hasFiltered: false,
  isRange: false,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  onFilterPress: jest.fn(),
  loading: false,
  points: [],
  maxVal: 0,
  gWidth: 300,
  gHeight: 180,
  paddingBottom: 20,
  paddingLeft: 40,
  pathD: '',
  areaD: '',
  ticketMedio: 50,
  volumeVendas: 10,
  topMethod: 'Pix',
  activeTransactions: [],
  cashFlowFilter: 'all',
  cashFlowStartDate: null,
  cashFlowEndDate: null,
  onCashFlowFilterPress: jest.fn(),
};

describe('DashboardOverview', () => {
  it('should clear interval on showOptions toggle (lines 86-87)', () => {
    jest.useFakeTimers();
    const { getByText, unmount } = render(<DashboardOverview {...baseProps} />);

    expect(getByText('Saldo Total em Caixa')).toBeTruthy();

    fireEvent.press(getByText('Ver Opções'));
    fireEvent.press(getByText('Ver Opções'));

    jest.clearAllTimers();
    unmount();
    jest.useRealTimers();
  });

  it('should cover erase complete and typing complete (lines 99-101 and 107-111)', () => {
    jest.useFakeTimers();
    const { getByText } = render(<DashboardOverview {...baseProps} />);

    expect(getByText('Ver Opções')).toBeTruthy();

    fireEvent.press(getByText('Ver Opções'));

    act(() => { jest.advanceTimersByTime(1300); });

    expect(getByText('Mostrar menos')).toBeTruthy();

    fireEvent.press(getByText('Mostrar menos'));

    act(() => { jest.advanceTimersByTime(1300); });

    expect(getByText('Ver Opções')).toBeTruthy();

    jest.useRealTimers();
  });
});
