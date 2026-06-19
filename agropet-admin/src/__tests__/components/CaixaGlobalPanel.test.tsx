import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { CaixaGlobalPanel } from '../../presentation/screens/admin/AdminConsultSales/components/CaixaGlobalPanel';

jest.mock('../../presentation/screens/admin/AdminConsultSales/components/CaixaGlobalPanel.styles', () => ({
  styles: {
    caixaCard: { padding: 16, borderRadius: 12 },
    caixaTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
    caixaTitle: { fontSize: 14, fontWeight: 'bold' },
    caixaValue: { fontSize: 24, fontWeight: 'bold' },
    pulseContainer: { width: 40, height: 40 },
    pulseDot: { width: 12, height: 12, borderRadius: 6 },
    pulseRing: { width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
    caixaDivider: { height: 1, backgroundColor: '#ccc', marginVertical: 12 },
    caixaSubGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    caixaSubItem: { width: '50%', paddingVertical: 4 },
    caixaSubLabel: { fontSize: 12, color: '#ccc' },
    caixaSubValue: { fontSize: 14, fontWeight: 'bold' },
  },
}));

const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;
const pulseAnim = new Animated.Value(0);

const baseProps = {
  isDarkMode: false,
  saldoTotalCaixaGeral: 1000,
  totalDinheiroCaixaGeral: 500,
  pulseAnim,
  formatCurrency,
  totalCreditoGeral: 300,
  totalDebitoGeral: 200,
  totalPixGeral: 100,
};

describe('CaixaGlobalPanel', () => {
  it('renders with positive totals', () => {
    const { getByText } = render(<CaixaGlobalPanel {...baseProps} />);
    expect(getByText('R$ 1000,00')).toBeTruthy();
    expect(getByText('R$ 500,00')).toBeTruthy();
    expect(getByText('R$ 300,00')).toBeTruthy();
  });

  it('renders with negative saldoTotal', () => {
    const { getByText } = render(
      <CaixaGlobalPanel {...baseProps} saldoTotalCaixaGeral={-100} />
    );
    expect(getByText('R$ -100,00')).toBeTruthy();
  });

  it('renders with negative totalDinheiroCaixaGeral', () => {
    const { getByText } = render(
      <CaixaGlobalPanel {...baseProps} totalDinheiroCaixaGeral={-50} />
    );
    expect(getByText('R$ -50,00')).toBeTruthy();
  });

  it('renders in dark mode', () => {
    const { getByText } = render(
      <CaixaGlobalPanel {...baseProps} isDarkMode={true} />
    );
    expect(getByText('R$ 1000,00')).toBeTruthy();
  });
});
