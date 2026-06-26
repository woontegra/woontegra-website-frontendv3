import type { ApiSuccess } from '@/types/api'
import { adminApi, getErrorMessage } from '@/services/api/client'

export type LicenseProgram = {
  appCode: string
  name: string
  isActive: boolean
  defaultLicenseDays: number
  defaultMaxDevices: number
  description?: string | null
}

export type LicenseProgramCreateInput = {
  appCode: string
  name: string
  description?: string | null
  defaultLicenseDays?: number
  defaultMaxDevices?: number
  isActive?: boolean
}

function unwrapData<T>(payload: unknown, label: string): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  if (Array.isArray(payload)) return payload
  throw new Error(`${label}: geçersiz API yanıtı`)
}

function normalizeProgram(row: unknown): LicenseProgram | null {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  if (typeof r.appCode !== 'string' || typeof r.name !== 'string') return null
  return {
    appCode: r.appCode,
    name: r.name,
    isActive: r.isActive === true,
    defaultLicenseDays:
      typeof r.defaultLicenseDays === 'number' && r.defaultLicenseDays > 0 ? r.defaultLicenseDays : 365,
    defaultMaxDevices:
      typeof r.defaultMaxDevices === 'number' && r.defaultMaxDevices > 0 ? r.defaultMaxDevices : 1,
    description: typeof r.description === 'string' ? r.description : null,
  }
}

export const adminLicenseProgramsService = {
  async list(activeOnly = false): Promise<LicenseProgram[]> {
    const res = await adminApi.get<ApiSuccess<LicenseProgram[]>>('/admin/license-programs', {
      params: activeOnly ? { activeOnly: 'true' } : undefined,
    })
    const raw = unwrapData(res.data, 'adminLicensePrograms.list')
    if (!Array.isArray(raw)) return []
    return raw.map(normalizeProgram).filter((p): p is LicenseProgram => p !== null)
  },

  async getByAppCode(appCode: string): Promise<LicenseProgram | null> {
    try {
      const res = await adminApi.get<ApiSuccess<LicenseProgram>>(
        `/admin/license-programs/${encodeURIComponent(appCode.trim().toUpperCase())}`,
      )
      return normalizeProgram(unwrapData(res.data, 'adminLicensePrograms.getByAppCode'))
    } catch {
      return null
    }
  },

  async create(input: LicenseProgramCreateInput): Promise<LicenseProgram> {
    const res = await adminApi.post<ApiSuccess<LicenseProgram>>('/admin/license-programs', {
      ...input,
      appCode: input.appCode.trim().toUpperCase(),
    })
    const row = normalizeProgram(unwrapData(res.data, 'adminLicensePrograms.create'))
    if (!row) throw new Error('Lisans programı oluşturulamadı')
    return row
  },
}

export { getErrorMessage }
