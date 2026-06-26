function toString(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v).trim() || fallback
}

function toNullableString(v: unknown): string | null {
  const s = toString(v)
  return s || null
}

function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function toBool(v: unknown, fallback = false): boolean {
  if (v === true || v === false) return v
  if (v === 'true') return true
  if (v === 'false') return false
  return fallback
}

export type AdminOrderListItem = {
  id: string
  orderNo: string
  customerName: string
  customerEmail: string
  productSummary: string
  itemCount: number
  total: number
  currency: string
  status: string
  paymentProvider: string
  paymentMethod?: string
  paymentStatus: string | null
  paytrTransactionStatus?: string | null
  hasPaytrTransactionRecord?: boolean
  adminNote?: string | null
  paidAt?: string | null
  paymentConfirmedAt?: string | null
  createdAt: string
}

export type AdminOrderListParams = {
  status?: string
  email?: string
  orderNo?: string
  customerQuery?: string
  paymentProvider?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
}

export type AdminOrderItem = {
  id: string
  productId: string | null
  productName: string
  productSlug: string | null
  unitPrice: number
  quantity: number
  total: number
  downloadUrl: string | null
  licenseRequired?: boolean
  licenseServerUnitsNotified?: number
  licenseServerLastError?: string | null
}

export type AdminPaymentTransaction = {
  id: string
  merchantOid: string
  status: string
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type AdminOrderLicense = {
  id: string
  licenseKey: string
  status: string
  productName: string
  customerEmail: string
  maxDevices: number
  activatedDevicesCount: number
  lastValidatedAt: string | null
  expiresAt: string | null
}

export type AdminOrderDetail = {
  id: string
  orderNo: string
  status: string
  orderStatusLabel?: string
  paymentProvider: string
  paymentMethod?: string
  paymentStatus?: string | null
  paymentStatusLabel?: string
  paytrTransactionStatus?: string | null
  subtotal: number
  total: number
  currency: string
  paidAt: string | null
  bankTransferPaymentDate: string | null
  bankTransferAdminNote: string | null
  bankTransferReference: string | null
  paymentConfirmedAt: string | null
  paymentConfirmedByEmail: string | null
  downloadEmailSentAt: string | null
  digitalDeliveryEmailAlert?: string | null
  createdAt: string
  updatedAt: string
  adminNote?: string | null
  customer: {
    customerName: string
    customerEmail: string
    customerPhone: string | null
    billingType: string | null
    taxOffice: string | null
    taxNumber: string | null
    companyName: string | null
  }
  items: AdminOrderItem[]
  paymentTransactions: AdminPaymentTransaction[]
  licenses?: AdminOrderLicense[]
}

export type AdminOrderUpdateBody = {
  status?: string
  paymentTransactionStatus?: string
  adminNote?: string | null
}

export type AdminOrderLicensePatchBody = {
  status?: 'ACTIVE' | 'DISABLED'
  resetActivations?: boolean
  maxDevices?: number
}

export function normalizeAdminOrderListItem(raw: unknown): AdminOrderListItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null
  return {
    id,
    orderNo: toString(row.orderNo),
    customerName: toString(row.customerName),
    customerEmail: toString(row.customerEmail),
    productSummary: toString(row.productSummary, '—'),
    itemCount: toNumber(row.itemCount, 1),
    total: toNumber(row.total),
    currency: toString(row.currency, 'TRY') || 'TRY',
    status: toString(row.status, 'PENDING'),
    paymentProvider: toString(row.paymentProvider),
    paymentMethod: row.paymentMethod == null ? undefined : toString(row.paymentMethod),
    paymentStatus: row.paymentStatus == null ? null : toString(row.paymentStatus),
    paytrTransactionStatus:
      row.paytrTransactionStatus == null ? undefined : toString(row.paytrTransactionStatus),
    hasPaytrTransactionRecord: toBool(row.hasPaytrTransactionRecord, false),
    adminNote: toNullableString(row.adminNote),
    paidAt: toNullableString(row.paidAt),
    paymentConfirmedAt: toNullableString(row.paymentConfirmedAt),
    createdAt: toString(row.createdAt),
  }
}

export function normalizeAdminOrderList(raw: unknown): AdminOrderListItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAdminOrderListItem).filter((x): x is AdminOrderListItem => x !== null)
}

function normalizeOrderItem(raw: unknown, index: number): AdminOrderItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    id: toString(row.id, `item-${index}`),
    productId: row.productId == null ? null : toString(row.productId),
    productName: toString(row.productName),
    productSlug: row.productSlug == null ? null : toString(row.productSlug),
    unitPrice: toNumber(row.unitPrice),
    quantity: toNumber(row.quantity, 1),
    total: toNumber(row.total),
    downloadUrl: row.downloadUrl == null ? null : toString(row.downloadUrl),
    licenseRequired: toBool(row.licenseRequired, false),
    licenseServerUnitsNotified:
      typeof row.licenseServerUnitsNotified === 'number' ? row.licenseServerUnitsNotified : undefined,
    licenseServerLastError: row.licenseServerLastError == null ? null : toString(row.licenseServerLastError),
  }
}

function normalizePaymentTx(raw: unknown, index: number): AdminPaymentTransaction | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    id: toString(row.id, `tx-${index}`),
    merchantOid: toString(row.merchantOid),
    status: toString(row.status),
    amount: toNumber(row.amount),
    currency: toString(row.currency, 'TRY') || 'TRY',
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
  }
}

function normalizeOrderLicense(raw: unknown, index: number): AdminOrderLicense | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    id: toString(row.id, `lic-${index}`),
    licenseKey: toString(row.licenseKey),
    status: toString(row.status),
    productName: toString(row.productName),
    customerEmail: toString(row.customerEmail),
    maxDevices: toNumber(row.maxDevices, 1),
    activatedDevicesCount: toNumber(row.activatedDevicesCount),
    lastValidatedAt: toNullableString(row.lastValidatedAt),
    expiresAt: toNullableString(row.expiresAt),
  }
}

export function normalizeAdminOrderDetail(raw: unknown): AdminOrderDetail | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null

  const customerRaw = (row.customer as Record<string, unknown>) ?? {}
  const itemsRaw = Array.isArray(row.items) ? row.items : []
  const txRaw = Array.isArray(row.paymentTransactions) ? row.paymentTransactions : []
  const licRaw = Array.isArray(row.licenses) ? row.licenses : []

  return {
    id,
    orderNo: toString(row.orderNo),
    status: toString(row.status, 'PENDING'),
    orderStatusLabel: row.orderStatusLabel == null ? undefined : toString(row.orderStatusLabel),
    paymentProvider: toString(row.paymentProvider),
    paymentMethod: row.paymentMethod == null ? undefined : toString(row.paymentMethod),
    paymentStatus: row.paymentStatus == null ? null : toString(row.paymentStatus),
    paymentStatusLabel: row.paymentStatusLabel == null ? undefined : toString(row.paymentStatusLabel),
    paytrTransactionStatus:
      row.paytrTransactionStatus == null ? undefined : toString(row.paytrTransactionStatus),
    subtotal: toNumber(row.subtotal),
    total: toNumber(row.total),
    currency: toString(row.currency, 'TRY') || 'TRY',
    paidAt: toNullableString(row.paidAt),
    bankTransferPaymentDate: toNullableString(row.bankTransferPaymentDate),
    bankTransferAdminNote: toNullableString(row.bankTransferAdminNote),
    bankTransferReference: toNullableString(row.bankTransferReference),
    paymentConfirmedAt: toNullableString(row.paymentConfirmedAt),
    paymentConfirmedByEmail: toNullableString(row.paymentConfirmedByEmail),
    downloadEmailSentAt: toNullableString(row.downloadEmailSentAt),
    digitalDeliveryEmailAlert: toNullableString(row.digitalDeliveryEmailAlert),
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
    adminNote: toNullableString(row.adminNote),
    customer: {
      customerName: toString(customerRaw.customerName),
      customerEmail: toString(customerRaw.customerEmail),
      customerPhone: toNullableString(customerRaw.customerPhone),
      billingType: toNullableString(customerRaw.billingType),
      taxOffice: toNullableString(customerRaw.taxOffice),
      taxNumber: toNullableString(customerRaw.taxNumber),
      companyName: toNullableString(customerRaw.companyName),
    },
    items: itemsRaw
      .map(normalizeOrderItem)
      .filter((x): x is AdminOrderItem => x !== null),
    paymentTransactions: txRaw
      .map(normalizePaymentTx)
      .filter((x): x is AdminPaymentTransaction => x !== null),
    licenses: licRaw
      .map(normalizeOrderLicense)
      .filter((x): x is AdminOrderLicense => x !== null),
  }
}

export type AdminPaymentRow = {
  orderId: string
  orderNo: string
  customerName: string
  customerEmail: string
  total: number
  currency: string
  paymentProvider: string
  paymentMethod?: string
  paymentStatus: string | null
  paytrTransactionStatus?: string | null
  orderStatus: string
  merchantOid?: string
  transactionStatus?: string
  paidAt?: string | null
  createdAt: string
}

export function ordersToPaymentRows(orders: AdminOrderListItem[]): AdminPaymentRow[] {
  return orders.map((o) => ({
    orderId: o.id,
    orderNo: o.orderNo,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    total: o.total,
    currency: o.currency,
    paymentProvider: o.paymentProvider,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    paytrTransactionStatus: o.paytrTransactionStatus,
    orderStatus: o.status,
    paidAt: o.paidAt,
    createdAt: o.createdAt,
  }))
}

export type DashboardSalesStats = {
  totalOrders: number
  pendingPayment: number
  paidOrders: number
  bankTransferPending: number
  licenseRecords: number
  monthlyRevenue: number
  monthlyCurrency: string
}

export function computeDashboardStats(
  orders: AdminOrderListItem[],
  licenseRecordCount: number,
): DashboardSalesStats {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let pendingPayment = 0
  let paidOrders = 0
  let bankTransferPending = 0
  let monthlyRevenue = 0
  let monthlyCurrency = 'TRY'

  for (const o of orders) {
    const st = o.status.toUpperCase()
    if (st === 'PENDING') pendingPayment += 1
    if (st === 'PAID' || st === 'PROCESSING') paidOrders += 1

    const ps = (o.paymentStatus ?? '').toUpperCase()
    const bank =
      o.paymentProvider.toUpperCase().includes('BANK') ||
      o.paymentMethod?.toUpperCase().includes('BANK') ||
      ps === 'WAITING_BANK_TRANSFER'
    if (st === 'PENDING' && bank) bankTransferPending += 1

    if ((st === 'PAID' || st === 'PROCESSING') && o.createdAt) {
      const created = new Date(o.createdAt)
      if (created >= monthStart) {
        monthlyRevenue += o.total
        monthlyCurrency = o.currency || monthlyCurrency
      }
    }
  }

  return {
    totalOrders: orders.length,
    pendingPayment,
    paidOrders,
    bankTransferPending,
    licenseRecords: licenseRecordCount,
    monthlyRevenue,
    monthlyCurrency,
  }
}
