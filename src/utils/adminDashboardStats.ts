import type { ContactMessage } from '@/services/api/contactMessagesAdmin'
import type { AdminLicenseListItem } from '@/types/license'
import {
  computeDashboardStats,
  type AdminOrderListItem,
  type DashboardSalesStats,
} from '@/types/order'
import type { AdminProduct } from '@/types/product'
import type { AdminSiteSettings } from '@/types/siteSettings'
import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'
import { resolvePaymentBadgeKind } from '@/utils/adminOrderUi'

export type DaySalesRow = {
  dateKey: string
  label: string
  revenue: number
  orderCount: number
  currency: string
}

export type TopProductRow = {
  name: string
  quantity: number
  revenue: number
  currency: string
}

export type DashboardAlert = {
  id: string
  tone: 'warning' | 'danger' | 'info'
  message: string
  href?: string
}

export type AdminDashboardData = {
  baseStats: DashboardSalesStats
  todayRevenue: number
  todayCurrency: string
  todayOrderCount: number
  avgOrderValue: number
  avgOrderCurrency: string
  activeLicenses: number
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  unreadMessages: number
  last7Days: DaySalesRow[]
  maxDayRevenue: number
  recentOrders: AdminOrderListItem[]
  paymentPendingOrders: AdminOrderListItem[]
  bankPendingOrders: AdminOrderListItem[]
  todayOrders: AdminOrderListItem[]
  topProducts: TopProductRow[]
  noPriceProducts: AdminProduct[]
  activeNotForSaleProducts: AdminProduct[]
  paidAwaitingLicense: AdminOrderListItem[]
  ordersWithLicenseCount: number
  licenseByOrderId: Map<string, AdminLicenseListItem[]>
  recentMessages: ContactMessage[]
  alerts: DashboardAlert[]
}

function isPaidOrder(order: AdminOrderListItem): boolean {
  const st = order.status.toUpperCase()
  return st === 'PAID' || st === 'PROCESSING'
}

function orderDateKey(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isToday(iso: string, now: Date): boolean {
  return orderDateKey(iso) === orderDateKey(now.toISOString())
}

function dayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }).format(dt)
}

function buildLast7Days(now: Date): string[] {
  const keys: string[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    keys.push(orderDateKey(d.toISOString()))
  }
  return keys
}

function sortOrdersDesc(orders: AdminOrderListItem[]): AdminOrderListItem[] {
  return [...orders].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
  })
}

function buildTopProducts(orders: AdminOrderListItem[]): TopProductRow[] {
  const map = new Map<string, TopProductRow>()
  for (const o of orders) {
    if (!isPaidOrder(o)) continue
    const name = o.productSummary.trim() || 'Ürün'
    const key = name.toLowerCase()
    const prev = map.get(key) ?? { name, quantity: 0, revenue: 0, currency: o.currency || 'TRY' }
    prev.quantity += Math.max(1, o.itemCount)
    prev.revenue += o.total
    prev.currency = o.currency || prev.currency
    map.set(key, prev)
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity).slice(0, 5)
}

function isLogoUnset(settings: AdminSiteSettings | null | undefined): boolean {
  if (!settings) return false
  const logo = settings.logo?.trim() ?? ''
  if (!logo) return true
  if (logo === DEFAULT_HEADER_LOGO_PATH && !settings.logoUpdatedAt?.trim()) return true
  return false
}

export function buildAdminDashboardData(input: {
  orders: AdminOrderListItem[]
  licenses: AdminLicenseListItem[]
  products: AdminProduct[]
  messages: ContactMessage[]
  siteSettings?: AdminSiteSettings | null
}): AdminDashboardData {
  const { orders, licenses, products, messages, siteSettings } = input
  const now = new Date()
  const baseStats = computeDashboardStats(orders, licenses.length)

  let todayRevenue = 0
  let todayCurrency = 'TRY'
  let todayOrderCount = 0
  let paidRevenueTotal = 0
  let paidOrderCount = 0
  let avgOrderCurrency = 'TRY'

  for (const o of orders) {
    if (isToday(o.createdAt, now)) {
      todayOrderCount += 1
      if (isPaidOrder(o)) {
        todayRevenue += o.total
        todayCurrency = o.currency || todayCurrency
      }
    }
    if (isPaidOrder(o)) {
      paidRevenueTotal += o.total
      paidOrderCount += 1
      avgOrderCurrency = o.currency || avgOrderCurrency
    }
  }

  const avgOrderValue = paidOrderCount > 0 ? paidRevenueTotal / paidOrderCount : 0

  const dayKeys = buildLast7Days(now)
  const dayMap = new Map<string, DaySalesRow>(
    dayKeys.map((dateKey) => [dateKey, { dateKey, label: dayLabel(dateKey), revenue: 0, orderCount: 0, currency: 'TRY' }]),
  )

  for (const o of orders) {
    const key = orderDateKey(o.createdAt)
    const row = dayMap.get(key)
    if (!row) continue
    row.orderCount += 1
    if (isPaidOrder(o)) {
      row.revenue += o.total
      row.currency = o.currency || row.currency
    }
  }

  const last7Days = dayKeys.map((k) => dayMap.get(k)!)
  const maxDayRevenue = Math.max(...last7Days.map((d) => d.revenue), 1)

  const sorted = sortOrdersDesc(orders)
  const paymentPendingOrders = sorted.filter((o) => resolvePaymentBadgeKind(o) === 'pending')
  const bankPendingOrders = sorted.filter((o) => resolvePaymentBadgeKind(o) === 'waiting_bank')
  const todayOrders = sorted.filter((o) => isToday(o.createdAt, now))

  const licenseByOrderId = new Map<string, AdminLicenseListItem[]>()
  for (const lic of licenses) {
    if (!lic.orderId) continue
    const list = licenseByOrderId.get(lic.orderId) ?? []
    list.push(lic)
    licenseByOrderId.set(lic.orderId, list)
  }

  const paidAwaitingLicense = sorted.filter((o) => isPaidOrder(o) && !licenseByOrderId.has(o.id))
  const ordersWithLicenseCount = sorted.filter((o) => licenseByOrderId.has(o.id)).length

  const activeLicenses = licenses.filter((l) => l.status === 'ACTIVE').length
  const activeProducts = products.filter((p) => p.isActive !== false).length
  const inactiveProducts = products.length - activeProducts
  const noPriceProducts = products.filter((p) => p.isActive !== false && (!p.price || p.price <= 0))
  const activeNotForSaleProducts = products.filter((p) => p.isActive !== false && p.purchaseEnabled === false)
  const unreadMessages = messages.filter((m) => !m.read).length

  const alerts: DashboardAlert[] = []

  for (const p of noPriceProducts.slice(0, 3)) {
    alerts.push({
      id: `no-price-${p.id}`,
      tone: 'warning',
      message: `Fiyatsız ürün: ${p.name}`,
      href: `/admin/urunler/${encodeURIComponent(p.id)}/duzenle`,
    })
  }
  if (noPriceProducts.length > 3) {
    alerts.push({
      id: 'no-price-more',
      tone: 'warning',
      message: `${noPriceProducts.length - 3} ürün daha fiyatlandırılmamış`,
      href: '/admin/urunler',
    })
  }

  for (const p of activeNotForSaleProducts.slice(0, 2)) {
    alerts.push({
      id: `not-for-sale-${p.id}`,
      tone: 'info',
      message: `Aktif ama satışa kapalı: ${p.name}`,
      href: `/admin/urunler/${encodeURIComponent(p.id)}/duzenle`,
    })
  }

  if (baseStats.bankTransferPending > 0) {
    alerts.push({
      id: 'bank-pending',
      tone: 'warning',
      message: `${baseStats.bankTransferPending} havale onayı bekleyen sipariş`,
      href: '/admin/odemeler',
    })
  }

  if (unreadMessages > 0) {
    alerts.push({
      id: 'unread-messages',
      tone: 'danger',
      message: `${unreadMessages} okunmamış müşteri talebi`,
      href: '/admin/musteri-talepleri',
    })
  }

  if (paidAwaitingLicense.length > 0) {
    alerts.push({
      id: 'license-pending',
      tone: 'warning',
      message: `${paidAwaitingLicense.length} ödenmiş sipariş merkezi lisans kaydı bekliyor`,
      href: '/admin/lisanslar',
    })
  }

  if (isLogoUnset(siteSettings)) {
    alerts.push({
      id: 'logo-missing',
      tone: 'info',
      message: 'Site logosu varsayılan; medya veya görünüm ayarlarını kontrol edin',
      href: '/admin/gorunum-ayarlari',
    })
  }

  const recentMessages = sortMessagesDesc(messages).slice(0, 5)

  return {
    baseStats,
    todayRevenue,
    todayCurrency,
    todayOrderCount,
    avgOrderValue,
    avgOrderCurrency,
    activeLicenses,
    totalProducts: products.length,
    activeProducts,
    inactiveProducts,
    unreadMessages,
    last7Days,
    maxDayRevenue,
    recentOrders: sorted.slice(0, 8),
    paymentPendingOrders: paymentPendingOrders.slice(0, 5),
    bankPendingOrders: bankPendingOrders.slice(0, 5),
    todayOrders: todayOrders.slice(0, 5),
    topProducts: buildTopProducts(orders),
    noPriceProducts,
    activeNotForSaleProducts,
    paidAwaitingLicense: paidAwaitingLicense.slice(0, 5),
    ordersWithLicenseCount,
    licenseByOrderId,
    recentMessages,
    alerts,
  }
}

function sortMessagesDesc(messages: ContactMessage[]): ContactMessage[] {
  return [...messages].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
  })
}

export function truncateText(text: string, max = 72): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}
