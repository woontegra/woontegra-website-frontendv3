import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { getApiBaseUrl } from '@/utils/env'

function createClient(withAdminAuth: boolean): AxiosInstance {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  })

  client.interceptors.request.use((config) => {
    if (withAdminAuth) {
      const { adminToken } = useAuthStore.getState()
      if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError<{ message?: string }>) => {
      if (withAdminAuth && error.response?.status === 401) {
        useAuthStore.getState().clearAdminSession()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/giris')) {
          window.location.assign('/giris')
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const publicApi = createClient(false)
export const adminApi = createClient(true)

export function getErrorMessage(error: unknown, fallback = 'İşlem başarısız'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
