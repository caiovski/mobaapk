export function formatStock(stock: number, isBulk: boolean): string {
  if (isBulk) {
    const kg = stock / 1000;
    return kg.toLocaleString('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }) + ' Kg';
  }
  return `${stock} ${stock === 1 ? 'unidade' : 'unidades'}`;
}
