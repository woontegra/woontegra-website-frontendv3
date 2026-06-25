import type { ProductType } from '@/types/product'
import { formatMoney } from '@/utils/formatMoney'

export function saasTotalForYears(unitPrice: number, years: number): number {
  const y = Math.min(10, Math.max(1, Math.floor(Number(years)) || 1))
  return unitPrice * y
}

export function productPricePeriodSuffix(productType: ProductType): string {
  switch (productType) {
    case 'DOWNLOAD':
      return '/ tek seferlik'
    case 'SAAS':
    case 'SERVICE':
      return '/ yıllık'
    default:
      return ''
  }
}

export function formatProductDisplayPrice(
  price: number,
  currency: string,
  productType: ProductType,
  webYears = 1,
): { main: string; period: string; hint: string | null } {
  const isWeb = productType === 'SAAS' || productType === 'SERVICE'
  if (isWeb && webYears > 1) {
    const total = saasTotalForYears(price, webYears)
    return {
      main: formatMoney(total, currency),
      period: `/ ${webYears} yıl`,
      hint: `${formatMoney(price, currency)} / yıl × ${webYears} yıl`,
    }
  }
  return {
    main: formatMoney(price, currency),
    period: productPricePeriodSuffix(productType),
    hint: null,
  }
}
