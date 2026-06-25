import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/api/auth'
import { getErrorMessage } from '@/services/api/client'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const adminToken = useAuthStore((s) => s.adminToken)
  const setAdminSession = useAuthStore((s) => s.setAdminSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (adminToken) return <Navigate to="/admin" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authService.adminLogin(email, password)
      if (!res.success || !res.token) throw new Error('Giriş başarısız')
      if (res.user.role !== 'admin' && res.user.role !== 'superadmin') {
        throw new Error('Bu alan yalnızca Woontegra yöneticileri içindir')
      }
      setAdminSession(res.token, res.user)
      navigate('/admin')
    } catch (err) {
      setError(getErrorMessage(err, 'Giriş başarısız'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardBody>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Yönetici e-posta"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Şifre"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Yönetici Girişi'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
