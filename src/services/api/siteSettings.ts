import { adminApi, publicApi } from '@/services/api/client'
import {
  normalizeAdminSiteSettings,
  normalizePublicSiteSettings,
  type AdminSiteSettings,
  type PublicSiteSettings,
  type SiteSettingsPatch,
} from '@/types/siteSettings'

export const siteSettingsService = {
  async getPublic(): Promise<PublicSiteSettings> {
    const res = await publicApi.get<unknown>('/settings')
    return normalizePublicSiteSettings(res.data)
  },

  async getAdmin(): Promise<AdminSiteSettings> {
    const res = await adminApi.get<unknown>('/settings/admin')
    return normalizeAdminSiteSettings(res.data)
  },

  async update(patch: SiteSettingsPatch): Promise<AdminSiteSettings> {
    const res = await adminApi.patch<unknown>('/settings', patch)
    return normalizeAdminSiteSettings(res.data)
  },
}
