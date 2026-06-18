export function formatOrderItemQuantity(
  quantity: number,
  isBulk: boolean,
  isPerMeter: boolean
): string {
  if (isBulk) {
    if (quantity >= 1) {
      return quantity.toLocaleString('pt-BR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }) + ' Kg'
    }
    const grams = Math.round(quantity * 1000)
    return `${grams}g`
  }
  if (isPerMeter) {
    const isInteger = Number.isInteger(quantity)
    return quantity.toLocaleString('pt-BR', {
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: isInteger ? 0 : 2,
    }) + ' m'
  }
  return String(quantity)
}

export function formatOrderItemUnitPrice(
  price: number,
  isBulk: boolean,
  isPerMeter: boolean
): string {
  const formatted = price.toFixed(2).replace('.', ',')
  if (isBulk) return `R$ ${formatted}/Kg`
  if (isPerMeter) return `R$ ${formatted}/m`
  return `R$ ${formatted} un.`
}
