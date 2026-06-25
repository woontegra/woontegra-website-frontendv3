import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, RefreshCw, Save, Send } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { emailSettingsService } from '@/services/api/emailSettings'
import { getErrorMessage } from '@/services/api/client'
import { DEFAULT_SMTP_SETTINGS, POST_SALES_EMAIL_FLOW, type SmtpSettings } from '@/types/emailSettings'
import { cn } from '@/utils/cn'

export function AdminEmailSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SmtpSettings>(DEFAULT_SMTP_SETTINGS)
  const [passwordInput, setPasswordInput] = useState('')
  const [testTo, setTestTo] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testMessage, setTestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'emailSettings', 'smtp'],
    queryFn: () => emailSettingsService.getSmtp(),
  })

  useEffect(() => {
    if (data) {
      setForm(data)
      setTestTo((prev) => prev.trim() || data.contactEmail.trim())
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const patch: Record<string, unknown> = {
        smtpHost: form.smtpHost.trim(),
        smtpPort: form.smtpPort.trim() || '587',
        smtpSecure: form.smtpSecure,
        smtpUser: form.smtpUser.trim(),
      }
      if (passwordInput.trim()) patch.smtpPassword = passwordInput.trim()
      return emailSettingsService.updateSmtp(patch)
    },
    onSuccess: (next) => {
      setForm(next)
      setPasswordInput('')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'emailSettings'] })
      setSaveMessage({ type: 'success', text: 'SMTP ayarları kaydedildi.' })
    },
    onError: (err) => {
      setSaveMessage({ type: 'error', text: getErrorMessage(err, 'Kayıt başarısız') })
    },
  })

  const testMutation = useMutation({
    mutationFn: () => {
      const pwd = passwordInput.trim()
      if (!pwd && !form.smtpPasswordConfigured) {
        throw new Error('Test için SMTP şifresi girin veya önce kaydedin.')
      }
      if (!form.smtpHost.trim() || !form.smtpPort.trim() || !form.smtpUser.trim()) {
        throw new Error('SMTP host, port ve kullanıcı zorunludur.')
      }
      return emailSettingsService.sendTestEmail({
        to: testTo.trim() || form.smtpUser.trim(),
        smtpHost: form.smtpHost.trim(),
        smtpPort: form.smtpPort.trim(),
        smtpSecure: form.smtpSecure,
        smtpUser: form.smtpUser.trim(),
        smtpPassword: pwd,
      })
    },
    onSuccess: (msg) => {
      setTestMessage({ type: 'success', text: msg })
    },
    onError: (err) => {
      setTestMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Test e-postası gönderilemedi',
      })
    },
  })

  const patchBool = (key: 'smtpSecure', value: boolean) => setForm((p) => ({ ...p, [key]: value }))
  const patchStr = (key: keyof SmtpSettings, value: string) => setForm((p) => ({ ...p, [key]: value }))

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="E-posta ayarları"
        description="SMTP yapılandırması, test gönderimi ve satış sonrası e-posta akışı."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        }
      />

      <Card className="border-sky-200 bg-sky-50/50">
        <CardBody className="space-y-2 text-sm text-sky-950">
          <p className="font-medium">Üretim e-postaları hakkında</p>
          <p>
            Satış sonrası müşteri e-postaları backend <code className="rounded bg-white/80 px-1">mail.service</code>{' '}
            üzerinden gönderilir (Gmail / <code className="rounded bg-white/80 px-1">GMAIL_APP_PASSWORD</code> env).
            Aşağıdaki SMTP alanları <code className="rounded bg-white/80 px-1">PATCH /api/settings</code> ile kaydedilir
            ve <code className="rounded bg-white/80 px-1">POST /api/settings/test-email</code> testinde kullanılır.
          </p>
          <p className="text-xs text-sky-800">
            Gönderen adı/e-posta için ayrı backend alanı yok; test e-postasında gönderen olarak SMTP kullanıcısı
            kullanılır. Üretim maillerinde sabit &quot;Woontegra&quot; / info@woontegra.com from adresi kullanılır.
          </p>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="SMTP ayarları yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-800">{getErrorMessage(error, 'Ayarlar yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Card>
            <CardBody className="space-y-5">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-semibold text-slate-900">SMTP yapılandırması</h2>
              </div>
              <p className="text-xs text-slate-500">
                GET/PATCH <code className="rounded bg-slate-100 px-1">/api/settings/admin</code> ·{' '}
                <code className="rounded bg-slate-100 px-1">/api/settings</code>
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="SMTP host"
                  value={form.smtpHost}
                  onChange={(e) => patchStr('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
                <Input
                  label="SMTP port"
                  value={form.smtpPort}
                  onChange={(e) => patchStr('smtpPort', e.target.value)}
                  placeholder="587"
                />
                <Input
                  label="SMTP kullanıcı (gönderen e-posta)"
                  type="email"
                  value={form.smtpUser}
                  onChange={(e) => patchStr('smtpUser', e.target.value)}
                  placeholder="info@woontegra.com"
                  className="sm:col-span-2"
                />
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">SMTP şifre</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={
                      form.smtpPasswordConfigured
                        ? `Kayıtlı (${form.smtpPasswordPreview || '••••••'}) — değiştirmek için yazın`
                        : 'SMTP şifresi'
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  {form.smtpPasswordConfigured ? (
                    <p className="text-xs text-slate-500">Şifre sunucuda saklanır; test için tekrar girmeniz gerekebilir.</p>
                  ) : null}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.smtpSecure}
                  onChange={(e) => patchBool('smtpSecure', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm text-slate-700">Güvenli bağlantı (TLS/SSL — smtpSecure)</span>
              </label>

              {saveMessage ? (
                <p className={cn('text-sm', saveMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600')}>
                  {saveMessage.text}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  onClick={() => {
                    setSaveMessage(null)
                    void saveMutation.mutateAsync()
                  }}
                  disabled={saveMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Test e-postası</h2>
              <p className="text-xs text-slate-500">
                POST <code className="rounded bg-slate-100 px-1">/api/settings/test-email</code> — payload: to,
                smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword
              </p>
              <Input
                label="Test alıcı e-posta"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder={form.smtpUser || 'alici@ornek.com'}
              />
              {testMessage ? (
                <Card className={cn('border', testMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50')}>
                  <CardBody>
                    <p className={cn('text-sm', testMessage.type === 'success' ? 'text-emerald-800' : 'text-red-800')}>
                      {testMessage.text}
                    </p>
                  </CardBody>
                </Card>
              ) : null}
              <Button
                variant="secondary"
                onClick={() => {
                  setTestMessage(null)
                  void testMutation.mutateAsync()
                }}
                disabled={testMutation.isPending}
              >
                <Send className="h-4 w-4" />
                {testMutation.isPending ? 'Gönderiliyor…' : 'Test e-postası gönder'}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Satış sonrası e-posta akışı</h2>
              <p className="text-sm text-slate-600">
                Backend mail servislerine göre gerçek akış. Olmayan adımlar &quot;aktif değil&quot; olarak işaretlenir.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {POST_SALES_EMAIL_FLOW.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl border p-4',
                      item.active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50',
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <Badge tone={item.active ? 'brand' : 'default'}>{item.active ? 'Aktif' : 'Yok / atlanır'}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      <span className="font-medium">Tetikleyici:</span> {item.trigger}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">{item.backendRef}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">E-posta şablonları</h2>
              <p className="text-sm text-slate-600">
                E-posta şablonları bu sürümde backend üzerinden yönetilmiyor. Şablon metinleri{' '}
                <code className="rounded bg-slate-100 px-1">mail.service.ts</code> içinde sabittir; admin şablon
                düzenleme endpointi yoktur.
              </p>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  )
}
