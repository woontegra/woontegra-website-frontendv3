import type { AdminOrderListItem } from '@/types/order'
import { computeDashboardStats } from '@/types/order'

export type ProductSalesRow = {
  productLabel: string
  orderCount: number
  unitsSold: number
  revenue: number
  currency: string
}

export type PaymentMethodRow = {
  method: string
  orderCount: number
  revenue: number
  currency: string
}

export type SalesReport = {
  summary: ReturnType<typeof computeDashboardStats> & {
    totalRevenue: number
    totalCurrency: string
  }
  productRows: ProductSalesRow[]
  paymentRows: PaymentMethodRow[]
}

function isPaidStatus(status: string): boolean {
  const st = status.toUpperCase()
  return st === 'PAID' || st === 'PROCESSING'
}

function paymentMethodKey(order: AdminOrderListItem): string {
  if (order.paymentProvider.toUpperCase().includes('BANK')) return 'Havale/EFT'
  if (order.paymentProvider.toUpperCase().includes('PAYTR')) return 'PayTR'
  if (order.paymentMethod?.trim()) return order.paymentMethod.trim()
  return order.paymentProvider || 'Diğer'
}

export function computeSalesReport(orders: AdminOrderListItem[], licenseRecordCount: number): SalesReport {
  const summaryBase = computeDashboardStats(orders, licenseRecordCount)

  const productMap = new Map<string, ProductSalesRow>()
  const paymentMap = new Map<string, PaymentMethodRow>()

  let totalRevenue = 0
  let totalCurrency = 'TRY'

  for (const o of orders) {
    if (!isPaidStatus(o.status)) continue

    totalRevenue += o.total
    totalCurrency = o.currency || totalCurrency

    const label = o.productSummary?.trim() || '—'
    const p = productMap.get(label) ?? {
      productLabel: label,
      orderCount: 0,
      unitsSold: 0,
      revenue: 0,
      currency: o.currency || 'TRY',
    }
    p.orderCount += 1
    p.unitsSold += o.itemCount || 1
    p.revenue += o.total
    productMap.set(label, p)

    const mk = paymentMethodKey(o)
    const pm = paymentMap.get(mk) ?? {
      method: mk,
      orderCount: 0,
      revenue: 0,
      currency: o.currency || 'TRY',
    }
    pm.orderCount += 1
    pm.revenue += o.total
    paymentMap.set(mk, pm)
  }

  const productRows = [...productMap.values()].sort((a, b) => b.revenue - a.revenue)
  const paymentRows = [...paymentMap.values()].sort((a, b) => b.revenue - a.revenue)

  return {
    summary: { ...summaryBase, totalRevenue, totalCurrency },
    productRows,
    paymentRows,
  }
}
