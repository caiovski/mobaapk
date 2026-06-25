export function useCaixaCalculations(orders: any[], splits?: any[]) {
  const completedOrders = orders.filter(o => o.status === 'completed');
  const completedIds = new Set(completedOrders.map(o => o.id));
  const multiploSplits = (splits || []).filter(s => completedIds.has(s.order_id));

  const sumSplits = (method: string) =>
    multiploSplits.filter(s => s.method === method).reduce((acc, s) => acc + (s.amount || 0), 0);

  const regularOrders = completedOrders.filter(o => o.payment_method !== 'multiplo');

  const totalCreditoGeral = regularOrders.reduce((acc, o) => acc + (o.payment_method === 'cartao_credito' ? (o.total ?? 0) : 0), 0) + sumSplits('cartao_credito');
  const totalDebitoGeral = regularOrders.reduce((acc, o) => acc + (o.payment_method === 'cartao_debito' ? (o.total ?? 0) : 0), 0) + sumSplits('cartao_debito');
  const totalPixGeral = regularOrders.reduce((acc, o) => acc + (o.payment_method === 'pix' ? (o.total ?? 0) : 0), 0) + sumSplits('pix');
  const totalDinheiroCaixaGeral = regularOrders.reduce((acc, o) => acc + (o.payment_method === 'dinheiro' ? (o.total ?? 0) : 0), 0) + sumSplits('dinheiro');
  const saldoTotalCaixaGeral = totalCreditoGeral + totalDebitoGeral + totalPixGeral + totalDinheiroCaixaGeral;

  const formatCurrency = (val: number) => {
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
  };

  return {
    totalCreditoGeral,
    totalDebitoGeral,
    totalPixGeral,
    totalDinheiroCaixaGeral,
    saldoTotalCaixaGeral,
    formatCurrency,
  };
}
