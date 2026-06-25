import { useCallback, useEffect, useState } from 'react'
import {
  getCustomerProfile,
  getCustomerToken,
  isCustomerAuthenticated,
  isCustomerToken,
  isJwtExpired,
  type CustomerProfile,
} from '@/lib/customerAuth'

export function useCustomerSession() {
  const [authed, setAuthed] = useState(() => isCustomerAuthenticated())
  const [profile, setProfile] = useState<CustomerProfile | null>(() =>
    isCustomerAuthenticated() ? getCustomerProfile() : null,
  )

  const refresh = useCallback(() => {
    const token = getCustomerToken()
    const ok = !!(token && !isJwtExpired(token) && isCustomerToken(token))
    setAuthed(ok)
    setProfile(ok ? getCustomerProfile() : null)
  }, [])

  useEffect(() => {
    refresh()
    const on = () => refresh()
    window.addEventListener('woontegra-customer-auth', on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener('woontegra-customer-auth', on)
      window.removeEventListener('storage', on)
    }
  }, [refresh])

  return { authed, profile, refresh }
}
