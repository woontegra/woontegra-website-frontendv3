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

export type LicenseStatus = 'ACTIVE' | 'DISABLED' | 'EXPIRED'
export type LicenseSource = 'MANUAL' | 'WEBSITE_ORDER'

export type AdminLicenseListItem = {
  id: string
  licenseKey: string
  customerName: string | null
  customerEmail: string
  customerPhone: string | null
  productName: string
  productCode: string | null
  source: LicenseSource
  orderId: string | null
  orderNo: string | null
  status: LicenseStatus
  maxDevices: number
  startsAt: string | null
  expiresAt: string | null
  notes: string | null
  activatedDevicesCount: number
  createdAt: string
  updatedAt: string
}

export type AdminLicenseListParams = {
  source?: string
  status?: string
  email?: string
  productCode?: string
  q?: string
}

export type AdminLicenseActivation = {
  id: string
  deviceHash: string
  deviceName: string | null
  platform: string | null
  appVersion: string | null
  firstActivatedAt: string
  lastValidatedAt: string | null
  status: string
}

export type AdminLicenseDetail = AdminLicenseListItem & {
  activations: AdminLicenseActivation[]
}

export function normalizeAdminLicenseListItem(raw: unknown): AdminLicenseListItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null

  const sourceRaw = toString(row.source, 'MANUAL').toUpperCase()
  const statusRaw = toString(row.status, 'ACTIVE').toUpperCase()

  return {
    id,
    licenseKey: toString(row.licenseKey),
    customerName: toNullableString(row.customerName),
    customerEmail: toString(row.customerEmail),
    customerPhone: toNullableString(row.customerPhone),
    productName: toString(row.productName),
    productCode: toNullableString(row.productCode),
    source: sourceRaw === 'WEBSITE_ORDER' ? 'WEBSITE_ORDER' : 'MANUAL',
    orderId: toNullableString(row.orderId),
    orderNo: toNullableString(row.orderNo),
    status:
      statusRaw === 'DISABLED' ? 'DISABLED' : statusRaw === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
    maxDevices: toNumber(row.maxDevices, 1),
    startsAt: toNullableString(row.startsAt),
    expiresAt: toNullableString(row.expiresAt),
    notes: toNullableString(row.notes),
    activatedDevicesCount: toNumber(row.activatedDevicesCount),
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
  }
}

export function normalizeAdminLicenseList(raw: unknown): AdminLicenseListItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAdminLicenseListItem).filter((x): x is AdminLicenseListItem => x !== null)
}

function normalizeActivation(raw: unknown, index: number): AdminLicenseActivation | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id, `activation-${index}`)
  return {
    id,
    deviceHash: toString(row.deviceHash),
    deviceName: toNullableString(row.deviceName),
    platform: toNullableString(row.platform),
    appVersion: toNullableString(row.appVersion),
    firstActivatedAt: toString(row.firstActivatedAt),
    lastValidatedAt: toNullableString(row.lastValidatedAt),
    status: toString(row.status, 'ACTIVE'),
  }
}

export function normalizeAdminLicenseDetail(raw: unknown): AdminLicenseDetail | null {
  const base = normalizeAdminLicenseListItem(raw)
  if (!base) return null
  const row = raw as Record<string, unknown>
  const activations = Array.isArray(row.activations)
    ? row.activations.map(normalizeActivation).filter((x): x is AdminLicenseActivation => x !== null)
    : []
  return { ...base, activations }
}

export function licensePeriodLabel(startsAt: string | null, expiresAt: string | null): string {
  if (!startsAt && !expiresAt) return '—'
  const fmt = (v: string | null) => {
    if (!v) return '—'
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(d)
  }
  return `${fmt(startsAt)} → ${fmt(expiresAt)}`
}

export function countLicenseRecords(items: AdminLicenseListItem[]): number {
  return items.length
}

export function activationStatusLabel(
  activatedCount: number,
  maxDevices: number,
  status: LicenseStatus,
): string {
  if (status === 'EXPIRED') return 'Süresi dolmuş'
  if (status === 'DISABLED') return 'Pasif'
  if (activatedCount > 0) return `${activatedCount}/${maxDevices} cihaz aktif`
  return 'Aktivasyon bekliyor'
}

export function licenseRecordScopeLabel(source: LicenseSource): string {
  return source === 'WEBSITE_ORDER'
    ? 'Website kayıtlı (indirme modeli)'
    : 'Yerel kayıt (merkezi server dışı)'
}
