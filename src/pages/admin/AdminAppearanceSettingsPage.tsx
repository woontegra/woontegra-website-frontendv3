import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { SettingsMediaField } from '@/components/admin/SettingsMediaField'
import { siteSettingsService } from '@/services/api/siteSettings'
import { getErrorMessage } from '@/services/api/client'
import { DEFAULT_ADMIN_SITE_SETTINGS, type AdminSiteSettings } from '@/types/siteSettings'
import { cn } from '@/utils/cn'

export function AdminAppearanceSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AdminSiteSettings>(DEFAULT_ADMIN_SITE_SETTINGS)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'siteSettings', 'appearance'],
    queryFn: () => siteSettingsService.getAdmin(),
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const { logoUpdatedAt: _, ...payload } = form
      return siteSettingsService.update({
        siteName: payload.siteName,
        logo: payload.logo,
        favicon: payload.favicon,
      })
    },
    onSuccess: (next) => {
      setForm(next)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'siteSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['public', 'siteSettings'] })
      setMessage({ type: 'success', text: 'Görünüm ayarları kaydedildi.' })
    },
    onError: (err) => {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Kayıt başarısız') })
    },
  })

  if (isLoading) return <LoadingState label="Görünüm ayarları yükleniyor…" />

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Görünüm ayarları"
        description="Logo, favicon ve site adı — PATCH /api/settings"
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        }
      />

      <Card className="border-slate-200 bg-slate-50/50">
        <CardBody className="text-sm text-slate-700">
          Tema builder veya header/footer layout editörü backend'de yok. Renk alanları (primaryColor) site ayarlarında
          saklanır ancak V3 public tema motoru sınırlıdır. Tüm site ayarları için{' '}
          <Link to="/admin/ayarlar" className="font-medium text-brand-700 hover:underline">
            Site Ayarları
          </Link>
          .
        </CardBody>
      </Card>

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Ayarlar yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {message ? (
        <p className={cn('text-sm', message.type === 'success' ? 'text-emerald-700' : 'text-red-600')}>{message.text}</p>
      ) : null}

      <Card>
        <CardBody className="space-y-6">
          <Input label="Site adı" value={form.siteName} onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))} />
          <SettingsMediaField
            label="Logo"
            value={form.logo}
            logoUpdatedAt={form.logoUpdatedAt}
            onChange={(url) => setForm((p) => ({ ...p, logo: url }))}
            hint="Header ve footer'da görünür."
            sizeSpec="siteLogo"
          />
          <SettingsMediaField
            label="Favicon"
            value={form.favicon}
            onChange={(url) => setForm((p) => ({ ...p, favicon: url }))}
            sizeSpec="favicon"
          />
        </CardBody>
      </Card>
    </div>
  )
}
