import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { paymentSettingsService } from '@/services/api/paymentSettings'
import { paymentsService } from '@/services/api/payments'
import { getErrorMessage } from '@/services/api/client'
import { PAYTR_SECRET_MASK, type AdminPaytrSettings } from '@/types/paymentSettings'
import { cn } from '@/utils/cn'

const DEFAULT_PAYTR_CALLBACK = 'https://woontegra.com/api/payments/paytr/callback'

type TabId = 'paytr' | 'bank' | 'iyzico'

export function AdminPaymentSettingsPage() {
  const [tab, setTab] = useState<TabId>('paytr')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [testMode, setTestMode] = useState(true)
  const [debugOn, setDebugOn] = useState(true)
  const [merchantId, setMerchantId] = useState('')
  const [merchantKey, setMerchantKey] = useState('')
  const [merchantSalt, setMerchantSalt] = useState('')
  const [callbackUrl, setCallbackUrl] = useState('')
  const [successUrl, setSuccessUrl] = useState('')
  const [failUrl, setFailUrl] = useState('')
  const [dto, setDto] = useState<AdminPaytrSettings | null>(null)

  const paytrQuery = useQuery({
    queryKey: ['admin', 'paymentSettings', 'paytr'],
    queryFn: () => paymentSettingsService.getPaytr(),
  })

  const bankQuery = useQuery({
    queryKey: ['public', 'bankTransferDisplay'],
    queryFn: () => paymentsService.getBankTransferDisplay(),
  })

  useEffect(() => {
    const d = paytrQuery.data
    if (!d) return
    setDto(d)
    setIsActive(d.isActive)
    setTestMode(d.testMode)
    setDebugOn(d.debugOn)
    setMerchantId(d.merchantId)
    setMerchantKey('')
    setMerchantSalt('')
    setCallbackUrl(d.callbackUrl ?? '')
    setSuccessUrl(d.successUrl ?? '')
    setFailUrl(d.failUrl ?? '')
  }, [paytrQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        isActive,
        testMode,
        debugOn,
        merchantId,
        callbackUrl: callbackUrl.trim() || null,
        successUrl: successUrl.trim() || null,
        failUrl: failUrl.trim() || null,
      }
      if (merchantKey.trim()) body.merchantKey = merchantKey.trim()
      if (merchantSalt.trim()) body.merchantSalt = merchantSalt.trim()
      return paymentSettingsService.patchPaytr(body)
    },
    onSuccess: (next) => {
      setDto(next)
      setMerchantKey('')
      setMerchantSalt('')
      setMessage({ type: 'success', text: 'PayTR ayarları kaydedildi.' })
    },
    onError: (err) => {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Kayıt başarısız') })
    },
  })

  const displayCallbackUrl = useMemo(() => {
    const t = callbackUrl.trim()
    return t || DEFAULT_PAYTR_CALLBACK
  }, [callbackUrl])

  const copyCallback = async () => {
    try {
      await navigator.clipboard.writeText(displayCallbackUrl)
      setMessage({ type: 'success', text: 'Callback URL kopyalandı.' })
    } catch {
      setMessage({ type: 'error', text: 'URL kopyalanamadı.' })
    }
  }

  if (paytrQuery.isLoading && !dto) {
    return <LoadingState label="Ödeme ayarları yükleniyor…" />
  }

  const bank = bankQuery.data

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Ödeme ayarları"
        description="PayTR ve Havale/EFT yapılandırması — mevcut checkout akışı korunur."
      />

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

      {paytrQuery.isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(paytrQuery.error, 'PayTR ayarları yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {(
          [
            { id: 'paytr' as const, label: 'PayTR' },
            { id: 'bank' as const, label: 'Havale/EFT' },
            { id: 'iyzico' as const, label: 'Iyzico' },
          ] as const
        ).map((t) => (
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

      {tab === 'paytr' ? (
        <div className="space-y-4">
          <Card className="border-sky-100 bg-sky-50/40">
            <CardBody className="text-sm text-sky-950">
              PayTR ödeme başlatma mevcut checkout akışında kullanılır (<code>/api/payments/paytr/start</code>).
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">PayTR bildirim (callback) URL</h2>
              <p className="text-xs text-slate-600">
                Yol:{' '}
                <code className="rounded bg-slate-100 px-1">{dto?.callbackPath ?? '/api/payments/paytr/callback'}</code>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs"
                  value={displayCallbackUrl}
                />
                <Button type="button" variant="secondary" onClick={() => void copyCallback()}>
                  Kopyala
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                PayTR aktif (veritabanı ayarlarını kullan)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
                Test modu
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={debugOn} onChange={(e) => setDebugOn(e.target.checked)} />
                Debug log
              </label>

              <Input label="Merchant ID" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
              <Input
                label="Merchant Key"
                type="password"
                autoComplete="new-password"
                placeholder={dto?.merchantKeyMasked ? PAYTR_SECRET_MASK : 'Yeni değer (boş = değişmez)'}
                value={merchantKey}
                onChange={(e) => setMerchantKey(e.target.value)}
              />
              <Input
                label="Merchant Salt"
                type="password"
                autoComplete="new-password"
                placeholder={dto?.merchantSaltMasked ? PAYTR_SECRET_MASK : 'Yeni değer (boş = değişmez)'}
                value={merchantSalt}
                onChange={(e) => setMerchantSalt(e.target.value)}
              />
              <Input
                label="Callback URL (opsiyonel, DB)"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                placeholder={DEFAULT_PAYTR_CALLBACK}
              />
              <Input
                label="Başarı URL (opsiyonel)"
                value={successUrl}
                onChange={(e) => setSuccessUrl(e.target.value)}
                placeholder="https://…/odeme/basarili"
              />
              <Input
                label="Başarısız URL (opsiyonel)"
                value={failUrl}
                onChange={(e) => setFailUrl(e.target.value)}
                placeholder="https://…/odeme/basarisiz"
              />

              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Kaydediliyor…' : 'PayTR kaydet'}
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'bank' ? (
        <div className="space-y-4">
          <Card className="border-amber-100 bg-amber-50/50">
            <CardBody className="text-sm text-amber-950">
              Havale/EFT bilgileri checkout ve ödeme başarı ekranında{' '}
              <code className="rounded bg-amber-100 px-1">GET /api/payments/bank-transfer-display</code> ile okunur.
              Website backend&apos;de admin düzenleme endpointi bulunamadı; bilgiler salt okunur gösterilir.
            </CardBody>
          </Card>

          {bankQuery.isLoading ? <LoadingState label="Havale bilgileri yükleniyor…" /> : null}

          {bankQuery.isError ? (
            <Card className="border-red-200 bg-red-50">
              <CardBody>
                <p className="text-sm text-red-700">{getErrorMessage(bankQuery.error, 'Havale bilgisi alınamadı')}</p>
              </CardBody>
            </Card>
          ) : null}

          {bank ? (
            <Card>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Public havale durumu</h2>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      bank.bankTransferEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {bank.bankTransferEnabled ? 'Aktif (yayında)' : 'Pasif / yapılandırılmamış'}
                  </span>
                </div>

                {bank.bankTransferEnabled ? (
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Banka adı</dt>
                      <dd className="font-medium text-slate-900">{bank.bankName ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Hesap sahibi</dt>
                      <dd className="font-medium text-slate-900">{bank.accountHolder ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">IBAN</dt>
                      <dd className="font-mono text-xs text-slate-900">{bank.iban ?? '—'}</dd>
                    </div>
                    {bank.branchName ? (
                      <div>
                        <dt className="text-slate-500">Şube</dt>
                        <dd className="text-slate-900">{bank.branchName}</dd>
                      </div>
                    ) : null}
                    {bank.accountNumber ? (
                      <div>
                        <dt className="text-slate-500">Hesap no</dt>
                        <dd className="text-slate-900">{bank.accountNumber}</dd>
                      </div>
                    ) : null}
                    {bank.referenceNote ? (
                      <div className="sm:col-span-2">
                        <dt className="text-slate-500">Açıklama / not</dt>
                        <dd className="text-slate-900">{bank.referenceNote}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-slate-500">Para birimi</dt>
                      <dd className="text-slate-900">{bank.currency ?? 'TRY'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-slate-600">
                    Havale/EFT seçeneği şu an müşteriye kapalı (isPublished=false veya zorunlu alanlar eksik).
                  </p>
                )}
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === 'iyzico' ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-700">
              Website backend&apos;de Iyzico ödeme akışı veya admin ayar endpointi bulunmadı. Aktif ödeme yöntemi
              olarak gösterilmez.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
