import { useCaixaCalculations } from '../../presentation/screens/admin/AdminConsultSales/hooks/useCaixaCalculations';

describe('useCaixaCalculations', () => {
  it('should calculate totals from completed orders only', () => {
    const orders = [
      { payment_method: 'cartao_credito', total: 100, status: 'completed' },
      { payment_method: 'cartao_debito', total: 200, status: 'completed' },
      { payment_method: 'pix', total: 150, status: 'completed' },
      { payment_method: 'dinheiro', total: 50, status: 'completed' },
      { payment_method: 'dinheiro', total: 30, status: 'cancelled' },
    ];

    const result = useCaixaCalculations(orders);

    expect(result.totalCreditoGeral).toBe(100);
    expect(result.totalDebitoGeral).toBe(200);
    expect(result.totalPixGeral).toBe(150);
    expect(result.totalDinheiroCaixaGeral).toBe(50);
    expect(result.saldoTotalCaixaGeral).toBe(500);
  });

  it('should exclude cancelled orders from totals', () => {
    const orders = [
      { payment_method: 'cartao_credito', total: 100, status: 'completed' },
      { payment_method: 'cartao_credito', total: 50, status: 'cancelled' },
    ];

    const result = useCaixaCalculations(orders);

    expect(result.totalCreditoGeral).toBe(100);
  });

  it('should handle orders with null or undefined total across all payment methods', () => {
    const orders = [
      { payment_method: 'cartao_credito', total: null, status: 'completed' },
      { payment_method: 'cartao_debito', total: undefined, status: 'completed' },
      { payment_method: 'pix', total: null, status: 'completed' },
      { payment_method: 'dinheiro', total: null, status: 'completed' },
    ];

    const result = useCaixaCalculations(orders);

    expect(result.totalCreditoGeral).toBe(0);
    expect(result.totalDebitoGeral).toBe(0);
    expect(result.totalPixGeral).toBe(0);
    expect(result.totalDinheiroCaixaGeral).toBe(0);
    expect(result.saldoTotalCaixaGeral).toBe(0);
  });

  it('should handle orders with valid totals for all payment types', () => {
    const orders = [
      { payment_method: 'cartao_credito', total: 100, status: 'completed' },
      { payment_method: 'cartao_debito', total: 50, status: 'completed' },
      { payment_method: 'pix', total: 75, status: 'completed' },
      { payment_method: 'dinheiro', total: 25, status: 'completed' },
    ];

    const result = useCaixaCalculations(orders);

    expect(result.totalCreditoGeral).toBe(100);
    expect(result.totalDebitoGeral).toBe(50);
    expect(result.totalPixGeral).toBe(75);
    expect(result.totalDinheiroCaixaGeral).toBe(25);
    expect(result.saldoTotalCaixaGeral).toBe(250);
  });

  it('should handle empty orders array', () => {
    const result = useCaixaCalculations([]);

    expect(result.totalCreditoGeral).toBe(0);
    expect(result.totalDebitoGeral).toBe(0);
    expect(result.totalPixGeral).toBe(0);
    expect(result.totalDinheiroCaixaGeral).toBe(0);
    expect(result.saldoTotalCaixaGeral).toBe(0);
  });

  it('should include multiplo splits in totals when splits are provided', () => {
    const orders = [
      { id: 'm1', payment_method: 'multiplo', total: 100, status: 'completed' },
      { id: 'm2', payment_method: 'multiplo', total: 50, status: 'completed' },
    ];
    const splits = [
      { order_id: 'm1', method: 'dinheiro', amount: 60 },
      { order_id: 'm1', method: 'cartao_credito', amount: 40 },
      { order_id: 'm2', method: 'pix', amount: 30 },
      { order_id: 'm2', method: 'cartao_debito', amount: 20 },
    ];

    const result = useCaixaCalculations(orders as any, splits as any);

    expect(result.totalDinheiroCaixaGeral).toBe(60);
    expect(result.totalCreditoGeral).toBe(40);
    expect(result.totalPixGeral).toBe(30);
    expect(result.totalDebitoGeral).toBe(20);
    expect(result.saldoTotalCaixaGeral).toBe(150);
  });

  it('should handle splits with null or undefined amounts', () => {
    const orders = [
      { id: 'm3', payment_method: 'multiplo', total: 100, status: 'completed' },
    ];
    const splits = [
      { order_id: 'm3', method: 'dinheiro', amount: null },
      { order_id: 'm3', method: 'cartao_credito', amount: undefined },
      { order_id: 'm3', method: 'pix', amount: 50 },
    ];

    const result = useCaixaCalculations(orders as any, splits as any);

    expect(result.totalDinheiroCaixaGeral).toBe(0);
    expect(result.totalCreditoGeral).toBe(0);
    expect(result.totalPixGeral).toBe(50);
  });

  it('should exclude splits of cancelled orders', () => {
    const orders = [
      { id: 'c1', payment_method: 'multiplo', total: 100, status: 'cancelled' },
    ];
    const splits = [
      { order_id: 'c1', method: 'dinheiro', amount: 100 },
    ];

    const result = useCaixaCalculations(orders as any, splits as any);

    expect(result.totalDinheiroCaixaGeral).toBe(0);
    expect(result.saldoTotalCaixaGeral).toBe(0);
  });

  it('should format currency correctly', () => {
    const result = useCaixaCalculations([]);
    expect(result.formatCurrency(1234.5)).toBe('R$ 1234,50');
    expect(result.formatCurrency(0)).toBe('R$ 0,00');
    expect(result.formatCurrency(99.99)).toBe('R$ 99,99');
  });
});
