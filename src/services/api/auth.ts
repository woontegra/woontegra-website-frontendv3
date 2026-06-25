import { adminApi, publicApi } from '@/services/api/client'
import type { AdminLoginResponse } from '@/types/auth'

export const authService = {
  async adminLogin(email: string, password: string) {
    const res = await publicApi.post<AdminLoginResponse>('/auth/login', { email, password })
    return res.data
  },

  async adminProfile() {
    const res = await adminApi.get('/auth/profile')
    return res.data
  },
}
