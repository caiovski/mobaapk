export function formatStock(stock: number, isBulk: boolean, isPerMeter?: boolean): string {
  if (isBulk) {
    const kg = stock / 1000;
    return kg.toLocaleString('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }) + ' Kg';
  }
  if (isPerMeter) {
    return `${stock} m`;
  }
  return `${stock} ${stock === 1 ? 'unidade' : 'unidades'}`;
}
