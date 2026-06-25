import type {
  AdminLicenseDetail,
  AdminLicenseListItem,
  AdminLicenseListParams,
} from '@/types/license'
import { normalizeAdminLicenseDetail, normalizeAdminLicenseList } from '@/types/license'
import type { ApiSuccess } from '@/types/api'
import { adminApi } from '@/services/api/client'

function unwrap<T>(payload: unknown, label: string): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const adminLicensesService = {
  async list(params?: AdminLicenseListParams): Promise<AdminLicenseListItem[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/licenses', { params })
    return normalizeAdminLicenseList(unwrap(res.data, 'adminLicenses.list'))
  },

  async getById(id: string): Promise<AdminLicenseDetail> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/licenses/${encodeURIComponent(id)}`)
    const row = normalizeAdminLicenseDetail(unwrap(res.data, 'adminLicenses.getById'))
    if (!row) throw new Error('Lisans bulunamadı')
    return row
  },

  async sendEmail(id: string, activationPassword?: string): Promise<void> {
    await adminApi.post(`/admin/licenses/${encodeURIComponent(id)}/send-email`, {
      activationPassword: activationPassword || undefined,
    })
  },
}

export type { AdminLicenseDetail, AdminLicenseListItem, AdminLicenseListParams }
