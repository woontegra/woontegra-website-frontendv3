function str(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function nullableStr(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s || null
}

export type AdminPaytrSettings = {
  provider: string
  isActive: boolean
  testMode: boolean
  merchantId: string
  merchantKeyMasked: string
  merchantSaltMasked: string
  callbackUrl: string | null
  successUrl: string | null
  failUrl: string | null
  debugOn: boolean
  callbackPath: string
}

export type PatchPaytrSettings = Partial<{
  isActive: boolean
  testMode: boolean
  debugOn: boolean
  merchantId: string
  merchantKey: string
  merchantSalt: string
  callbackUrl: string | null
  successUrl: string | null
  failUrl: string | null
}>

export const PAYTR_SECRET_MASK = '••••••••••••••••'

export function normalizeAdminPaytrSettings(raw: unknown): AdminPaytrSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    provider: str(o.provider, 'PAYTR'),
    isActive: bool(o.isActive),
    testMode: bool(o.testMode, true),
    merchantId: str(o.merchantId),
    merchantKeyMasked: str(o.merchantKeyMasked),
    merchantSaltMasked: str(o.merchantSaltMasked),
    callbackUrl: nullableStr(o.callbackUrl),
    successUrl: nullableStr(o.successUrl),
    failUrl: nullableStr(o.failUrl),
    debugOn: bool(o.debugOn, true),
    callbackPath: str(o.callbackPath, '/api/payments/paytr/callback'),
  }
}
