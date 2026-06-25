import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { AdminMissingEndpointCard } from '@/components/admin/AdminMissingEndpointCard'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminAuthService, adminUsersService } from '@/services/api/adminUsers'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/services/api/client'
import { cn } from '@/utils/cn'

export function AdminUserSettingsPage() {
  const sessionUser = useAuthStore((s) => s.adminUser)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const profileQuery = useQuery({
    queryKey: ['admin', 'auth', 'profile'],
    queryFn: () => adminAuthService.getProfile(),
  })

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminUsersService.list(),
  })

  const changePasswordMutation = useMutation({
    mutationFn: () => adminAuthService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Şifreniz güncellendi.' })
    },
    onError: (err) => {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Şifre güncellenemedi') })
    },
  })

  const profile = profileQuery.data ?? sessionUser
  const users = usersQuery.data ?? []

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalıdır.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' })
      return
    }
    changePasswordMutation.mutate()
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Kullanıcı ayarları" description="Oturum profili ve şifre — /api/auth/profile, change-password" />

      {profileQuery.isLoading ? <LoadingState label="Profil yükleniyor…" /> : null}

      {profile ? (
        <Card>
          <CardBody className="space-y-2 text-sm">
            <h2 className="font-semibold text-slate-900">Mevcut oturum</h2>
            <p>
              <span className="text-slate-500">E-posta:</span> {profile.email}
            </p>
            <p>
              <span className="text-slate-500">Rol:</span> {profile.role}
            </p>
            <p className="text-xs text-slate-500">GET /api/auth/profile</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody>
          <form className="max-w-md space-y-4" onSubmit={onChangePassword}>
            <h2 className="text-sm font-semibold text-slate-900">Şifre değiştir</h2>
            <Input
              label="Mevcut şifre"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Yeni şifre"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Yeni şifre (tekrar)"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {message ? (
              <p className={cn('text-sm', message.type === 'success' ? 'text-emerald-700' : 'text-red-600')}>
                {message.text}
              </p>
            ) : null}
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? 'Güncelleniyor…' : 'Şifreyi güncelle'}
            </Button>
            <p className="text-xs text-slate-500">POST /api/auth/change-password</p>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Admin kullanıcı listesi</h2>
          <p className="text-xs text-slate-500">GET /api/users (adminOnly)</p>

          {usersQuery.isLoading ? <LoadingState label="Kullanıcılar…" /> : null}

          {users.length === 0 ? (
            <AdminMissingEndpointCard
              title="Kullanıcı listesi boş veya servis placeholder"
              endpointHint="GET /api/users — users.service.ts şu an boş dizi döndürüyor"
              description="Backend usersService henüz veritabanından kullanıcı listelemiyor. Profil ve şifre değiştirme aktif; çoklu admin yönetimi backend geliştirmesi gerektirir."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>E-posta</TH>
                    <TH>Rol</TH>
                  </TR>
                </THead>
                <TBody>
                  {users.map((u) => (
                    <TR key={u.id}>
                      <TD>{u.email}</TD>
                      <TD>{u.role}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
