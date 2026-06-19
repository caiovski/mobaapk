export function useCaixaCalculations(orders: any[]) {
  const completedOrders = orders.filter(o => o.status === 'completed');

  const totalCreditoGeral = completedOrders.reduce((acc, o) => acc + (o.payment_method === 'cartao_credito' ? (o.total ?? 0) : 0), 0);
  const totalDebitoGeral = completedOrders.reduce((acc, o) => acc + (o.payment_method === 'cartao_debito' ? (o.total ?? 0) : 0), 0);
  const totalPixGeral = completedOrders.reduce((acc, o) => acc + (o.payment_method === 'pix' ? (o.total ?? 0) : 0), 0);
  const totalDinheiroCaixaGeral = completedOrders.reduce((acc, o) => acc + (o.payment_method === 'dinheiro' ? (o.total ?? 0) : 0), 0);
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
