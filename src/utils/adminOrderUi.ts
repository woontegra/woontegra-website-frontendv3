export function normalizePaymentToken(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_')
}

export function isBankTransferLikeProvider(v: unknown): boolean {
  const x = normalizePaymentToken(v)
  return (
    x === 'BANK_TRANSFER' ||
    x === 'BANK' ||
    x === 'HAVALE' ||
    x === 'EFT' ||
    x === 'HAVALE_EFT' ||
    x === 'WIRE'
  )
}

export function paymentMethodLabel(row: { paymentProvider?: string; paymentMethod?: string }): string {
  if (isBankTransferLikeProvider(row.paymentProvider) || isBankTransferLikeProvider(row.paymentMethod)) {
    return 'Havale/EFT'
  }
  const p = normalizePaymentToken(row.paymentProvider)
  if (p === 'PAYTR') return 'Kart (PayTR)'
  return row.paymentProvider || '—'
}

export type OrderStatusTone = 'default' | 'success' | 'warning' | 'danger' | 'brand'

const ORDER_STATUS: Record<string, { label: string; tone: OrderStatusTone }> = {
  PENDING: { label: 'Beklemede', tone: 'warning' },
  PROCESSING: { label: 'İşleniyor', tone: 'brand' },
  PAID: { label: 'Ödendi', tone: 'success' },
  FAILED: { label: 'Başarısız', tone: 'danger' },
  CANCELLED: { label: 'İptal', tone: 'default' },
  DELIVERED: { label: 'Teslim edildi', tone: 'success' },
}

export function orderStatusMeta(status: string): { label: string; tone: OrderStatusTone } {
  const key = normalizePaymentToken(status)
  return ORDER_STATUS[key] ?? { label: status || '—', tone: 'default' }
}

export type PaymentBadgeKind =
  | 'paid'
  | 'pending'
  | 'waiting_bank'
  | 'failed'
  | 'cancelled'
  | 'unknown'

export function resolvePaymentBadgeKind(row: {
  status: string
  paymentProvider: string
  paymentMethod?: string
  paymentStatus?: string | null
  paytrTransactionStatus?: string | null
}): PaymentBadgeKind {
  const st = normalizePaymentToken(row.status)
  const ps = normalizePaymentToken(row.paymentStatus)
  const tx = normalizePaymentToken(row.paytrTransactionStatus)
  const bank =
    isBankTransferLikeProvider(row.paymentProvider) || isBankTransferLikeProvider(row.paymentMethod)

  if (st === 'CANCELLED') return 'cancelled'
  if (bank) {
    if (st === 'PENDING' && (ps === 'WAITING_BANK_TRANSFER' || ps === 'PENDING' || ps === '')) {
      return 'waiting_bank'
    }
    if (st === 'PROCESSING' || st === 'PAID' || ps === 'SUCCESS') return 'paid'
    if (st === 'FAILED') return 'failed'
    return 'unknown'
  }
  if (st === 'FAILED' || tx === 'FAILED') return 'failed'
  if (st === 'PAID' || ps === 'SUCCESS' || tx === 'SUCCESS') return 'paid'
  if (st === 'PENDING' || ps === 'PENDING' || tx === 'PENDING') return 'pending'
  return 'unknown'
}

export function paymentBadgeLabel(kind: PaymentBadgeKind): string {
  switch (kind) {
    case 'paid':
      return 'Ödendi'
    case 'pending':
      return 'Ödeme bekliyor'
    case 'waiting_bank':
      return 'Havale onayı bekliyor'
    case 'failed':
      return 'Başarısız'
    case 'cancelled':
      return 'İptal'
    default:
      return '—'
  }
}

export function paymentBadgeTone(kind: PaymentBadgeKind): OrderStatusTone {
  switch (kind) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'waiting_bank':
      return 'warning'
    case 'failed':
      return 'danger'
    case 'cancelled':
      return 'default'
    default:
      return 'default'
  }
}

export function showHavaleConfirmButton(row: {
  status: string
  paymentProvider: string
  paymentMethod?: string
  paymentStatus?: string | null
}): boolean {
  const bank =
    isBankTransferLikeProvider(row.paymentProvider) || isBankTransferLikeProvider(row.paymentMethod)
  if (!bank) return false
  const st = normalizePaymentToken(row.status)
  const ps = normalizePaymentToken(row.paymentStatus)
  if (st !== 'PENDING') return false
  return ps === 'WAITING_BANK_TRANSFER' || ps === 'PENDING' || ps === ''
}

export function licenseStatusLabel(status: string): string {
  const s = normalizePaymentToken(status)
  if (s === 'ACTIVE') return 'Aktif'
  if (s === 'DISABLED') return 'Pasif'
  if (s === 'EXPIRED') return 'Süresi dolmuş'
  return status
}

export function licenseStatusTone(status: string): OrderStatusTone {
  const s = normalizePaymentToken(status)
  if (s === 'ACTIVE') return 'success'
  if (s === 'DISABLED') return 'default'
  if (s === 'EXPIRED') return 'danger'
  return 'default'
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('tr-TR')
}
