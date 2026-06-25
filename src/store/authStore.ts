import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types/auth'

type AuthState = {
  adminToken: string | null
  adminUser: AuthUser | null
  setAdminSession: (token: string, user: AuthUser) => void
  clearAdminSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      adminUser: null,
      setAdminSession: (token, user) => set({ adminToken: token, adminUser: user }),
      clearAdminSession: () => set({ adminToken: null, adminUser: null }),
    }),
    {
      name: 'woontegra-v3-admin-auth',
      partialize: (s) => ({
        adminToken: s.adminToken,
        adminUser: s.adminUser,
      }),
    },
  ),
)
