import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { SettingsMediaField } from '@/components/admin/SettingsMediaField'
import { LogoWidthField } from '@/components/admin/LogoWidthField'
import { siteSettingsService } from '@/services/api/siteSettings'
import { getErrorMessage } from '@/services/api/client'
import { DEFAULT_ADMIN_SITE_SETTINGS, type AdminSiteSettings } from '@/types/siteSettings'
import { clampNavbarLogoWidth } from '@/lib/logoSize'
import { cn } from '@/utils/cn'

type TabId = 'general' | 'brand' | 'contact' | 'seo' | 'maintenance'

const tabs: { id: TabId; label: string }[] = [
  { id: 'general', label: 'Genel' },
  { id: 'brand', label: 'Logo & Favicon' },
  { id: 'contact', label: 'İletişim' },
  { id: 'seo', label: 'SEO' },
  { id: 'maintenance', label: 'Bakım' },
]

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

export function AdminSiteSettingsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<TabId>('general')
  const [form, setForm] = useState<AdminSiteSettings>(DEFAULT_ADMIN_SITE_SETTINGS)
  const [keywordInput, setKeywordInput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'siteSettings'],
    queryFn: () => siteSettingsService.getAdmin(),
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<AdminSiteSettings>) => siteSettingsService.update(patch),
    onSuccess: (next) => {
      setForm(next)
      void queryClient.invalidateQueries({ queryKey: ['public', 'siteSettings'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'siteSettings'] })
      setMessage({ type: 'success', text: 'Kaydedildi.' })
    },
    onError: (err) => {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Kayıt başarısız') })
    },
  })

  const patch = <K extends keyof AdminSiteSettings>(key: K, value: AdminSiteSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  const onSave = () => {
    const { logoUpdatedAt: _, ...payload } = form
    saveMutation.mutate({
      ...payload,
      navbarLogoWidth: clampNavbarLogoWidth(form.navbarLogoWidth),
    })
  }

  const addKeyword = () => {
    const k = keywordInput.trim()
    if (!k || form.defaultKeywords.includes(k)) return
    patch('defaultKeywords', [...form.defaultKeywords, k])
    setKeywordInput('')
  }

  if (isLoading) return <LoadingState label="Site ayarları yükleniyor…" />

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Site ayarları"
        description="Genel site bilgileri, logo, iletişim ve SEO — GET/PATCH /api/settings"
        actions={
          <Button onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        }
      />

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Ayarlar yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {message ? (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800',
          )}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' ? (
        <Card>
          <CardBody className="space-y-4">
            <Input label="Site adı" value={form.siteName} onChange={(e) => patch('siteName', e.target.value)} />
            <Textarea
              label="Site açıklaması"
              value={form.siteDescription}
              onChange={(v) => patch('siteDescription', v)}
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Sosyal medya linkleri ve footer açıklaması backend&apos;de ayrı alan olarak tanımlı değil; bu adımda
              bağlanmadı.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'brand' ? (
        <Card>
          <CardBody className="space-y-6">
            <SettingsMediaField
              label="Logo"
              value={form.logo}
              logoUpdatedAt={form.logoUpdatedAt}
              onChange={(url) => patch('logo', url)}
              hint="Header'da kullanılır. Medya kütüphanesinden seçin."
            />
            <LogoWidthField
              value={form.navbarLogoWidth}
              logoUrl={form.logo}
              logoUpdatedAt={form.logoUpdatedAt}
              onChange={(width) => patch('navbarLogoWidth', width)}
            />
            <SettingsMediaField
              label="Favicon"
              value={form.favicon}
              onChange={(url) => patch('favicon', url)}
              hint="Tarayıcı sekmesi ikonu."
            />
          </CardBody>
        </Card>
      ) : null}

      {tab === 'contact' ? (
        <Card>
          <CardBody className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              value={form.contactEmail}
              onChange={(e) => patch('contactEmail', e.target.value)}
            />
            <Input label="Telefon" value={form.contactPhone} onChange={(e) => patch('contactPhone', e.target.value)} />
            <Input
              label="WhatsApp (ülke kodu ile, örn. 90532…)"
              value={form.contactWhatsApp}
              onChange={(e) => patch('contactWhatsApp', e.target.value)}
            />
            <Textarea
              label="Adres"
              value={form.contactAddress}
              onChange={(v) => patch('contactAddress', v)}
              rows={2}
            />
            <Textarea
              label="Google Maps embed (opsiyonel)"
              value={form.googleMapsEmbed}
              onChange={(v) => patch('googleMapsEmbed', v)}
              rows={2}
              placeholder="iframe veya embed kodu"
            />
          </CardBody>
        </Card>
      ) : null}

      {tab === 'seo' ? (
        <Card>
          <CardBody className="space-y-4">
            <Input
              label="SEO varsayılan başlık"
              value={form.defaultTitle}
              onChange={(e) => patch('defaultTitle', e.target.value)}
            />
            <Textarea
              label="SEO varsayılan açıklama"
              value={form.defaultDescription}
              onChange={(v) => patch('defaultDescription', v)}
              rows={3}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Anahtar kelimeler</label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Kelime ekle"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addKeyword()
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addKeyword}>
                  Ekle
                </Button>
              </div>
              {form.defaultKeywords.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {form.defaultKeywords.map((k) => (
                    <li
                      key={k}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                    >
                      {k}
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => patch('defaultKeywords', form.defaultKeywords.filter((x) => x !== k))}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'maintenance' ? (
        <Card>
          <CardBody className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => patch('maintenanceMode', e.target.checked)}
                className="rounded border-slate-300"
              />
              Bakım modu aktif
            </label>
            {form.maintenanceMode ? (
              <Textarea
                label="Bakım mesajı"
                value={form.maintenanceMessage}
                onChange={(v) => patch('maintenanceMessage', v)}
                rows={3}
              />
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
