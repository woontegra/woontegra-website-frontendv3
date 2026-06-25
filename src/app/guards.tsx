import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function AdminGuard() {
  const token = useAuthStore((s) => s.adminToken)
  if (!token) return <Navigate to="/giris" replace />
  return <Outlet />
}
