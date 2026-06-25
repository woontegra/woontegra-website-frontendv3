export function formatMoney(amount: number, currency = 'TRY'): string {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function hasCompareDiscount(price: number, compareAtPrice: number | null | undefined): boolean {
  return compareAtPrice != null && compareAtPrice > price
}
