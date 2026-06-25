import { adminApi } from '@/services/api/client'
import { normalizeAdminUserList, normalizeAdminUserProfile, type AdminUserListItem, type AdminUserProfile } from '@/types/adminUser'

export const adminUsersService = {
  async list(): Promise<AdminUserListItem[]> {
    const res = await adminApi.get<unknown>('/users')
    return normalizeAdminUserList(res.data)
  },
}

export const adminAuthService = {
  async getProfile(): Promise<AdminUserProfile> {
    const res = await adminApi.get<unknown>('/auth/profile')
    const profile = normalizeAdminUserProfile(res.data)
    if (!profile) throw new Error('Profil alınamadı')
    return profile
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await adminApi.post('/auth/change-password', { currentPassword, newPassword })
  },
}
