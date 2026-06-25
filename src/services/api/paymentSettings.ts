import type { ApiSuccess } from '@/types/api'
import { adminApi } from '@/services/api/client'
import {
  normalizeAdminPaytrSettings,
  type AdminPaytrSettings,
  type PatchPaytrSettings,
} from '@/types/paymentSettings'

function unwrapPaytr(payload: unknown): AdminPaytrSettings {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return normalizeAdminPaytrSettings((payload as ApiSuccess<unknown>).data)
  }
  return normalizeAdminPaytrSettings(payload)
}

export const paymentSettingsService = {
  async getPaytr(): Promise<AdminPaytrSettings> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/payment-settings/paytr')
    return unwrapPaytr(res.data)
  },

  async patchPaytr(body: PatchPaytrSettings): Promise<AdminPaytrSettings> {
    const res = await adminApi.patch<ApiSuccess<unknown>>('/admin/payment-settings/paytr', body)
    return unwrapPaytr(res.data)
  },
}
