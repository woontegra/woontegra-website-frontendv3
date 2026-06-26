import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { CentralLicenseInfoBanner } from '@/components/admin/CentralLicenseInfoBanner'
import { CENTRAL_LICENSE_PENDING_ADMIN } from '@/constants/centralLicenseServer'
import { adminOrdersService } from '@/services/api/adminOrders'
import { getErrorMessage } from '@/services/api/client'
import { formatMoney } from '@/utils/formatMoney'
import {
  formatDateTime,
  isBankTransferLikeProvider,
  licenseStatusLabel,
  licenseStatusTone,
  orderStatusMeta,
  paymentBadgeLabel,
  paymentBadgeTone,
  paymentMethodLabel,
  resolvePaymentBadgeKind,
  showHavaleConfirmButton,
} from '@/utils/adminOrderUi'
import { isSaasOrderDeliveryUrl } from '@/utils/productPurchase'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export function AdminOrderDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [statusDraft, setStatusDraft] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [bankOpen, setBankOpen] = useState(false)
  const [bankDate, setBankDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [bankNote, setBankNote] = useState('')
  const [bankRef, setBankRef] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => adminOrdersService.getById(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (!data) return
    setStatusDraft(data.status)
    setAdminNote(data.adminNote ?? '')
  }, [data])

  const updateMutation = useMutation({
    mutationFn: () =>
      adminOrdersService.update(id, {
        status: statusDraft || undefined,
        adminNote: adminNote.trim() || null,
      }),
    onSuccess: () => {
      setToast('Sipariş güncellendi.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const bankMutation = useMutation({
    mutationFn: () =>
      adminOrdersService.confirmBankTransfer(id, {
        paymentDate: bankDate,
        bankNote: bankNote.trim(),
        reference: bankRef.trim() || undefined,
      }),
    onSuccess: () => {
      setBankOpen(false)
      setToast('Havale/EFT ödemesi onaylandı.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders', id] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const retryDeliveryMutation = useMutation({
    mutationFn: () => adminOrdersService.retryDelivery(id),
    onSuccess: () => {
      setToast('Lisans teslimatı yeniden denendi.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders', id] })
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  if (!id) {
    return <EmptyState title="Geçersiz sipariş" description="Sipariş kimliği bulunamadı." />
  }

  if (isLoading) return <LoadingState label="Sipariş yükleniyor…" />

  if (isError || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardBody>
          <p className="text-sm text-red-700">{getErrorMessage(error, 'Sipariş yüklenemedi')}</p>
          <Link to="/admin/siparisler" className="mt-3 inline-block text-sm font-medium text-brand-700">
            Sipariş listesi
          </Link>
        </CardBody>
      </Card>
    )
  }

  const orderMeta = orderStatusMeta(data.status)
  const payKind = resolvePaymentBadgeKind(data)
  const canConfirmBank = showHavaleConfirmButton(data)
  const isBank = isBankTransferLikeProvider(data.paymentProvider) || isBankTransferLikeProvider(data.paymentMethod)
  const paidLike = data.status === 'PAID' || data.status === 'PROCESSING'
  const centralLicenseItems = data.items.filter((i) => i.licenseRequired)
  const centralLicenseErrors = centralLicenseItems.filter((i) => i.licenseServerLastError?.trim())
  const canRetryDelivery =
    paidLike &&
    (centralLicenseErrors.length > 0 || (centralLicenseItems.length > 0 && !data.downloadEmailSentAt))

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={`Sipariş ${data.orderNo}`}
        description={data.orderStatusLabel ?? orderMeta.label}
        actions={
          <Link
            to="/admin/siparisler"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Liste
          </Link>
        }
      />

      {toast ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardBody>
            <p className="text-sm text-emerald-800">{toast}</p>
          </CardBody>
        </Card>
      ) : null}

      {formError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{formError}</p>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sipariş özeti</h2>
            <InfoRow label="Oluşturulma" value={formatDateTime(data.createdAt)} />
            <InfoRow label="Toplam" value={formatMoney(data.total, data.currency)} />
            <InfoRow label="Ödeme yöntemi" value={paymentMethodLabel(data)} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge tone={orderMeta.tone}>{orderMeta.label}</Badge>
              <Badge tone={paymentBadgeTone(payKind)}>{paymentBadgeLabel(payKind)}</Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Alıcı</h2>
            <InfoRow label="Ad soyad" value={data.customer.customerName} />
            <InfoRow label="E-posta" value={data.customer.customerEmail} />
            <InfoRow label="Telefon" value={data.customer.customerPhone ?? '—'} />
            <InfoRow label="Fatura tipi" value={data.customer.billingType ?? '—'} />
            {data.customer.companyName ? <InfoRow label="Firma" value={data.customer.companyName} /> : null}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">E-posta izleri</h2>
            <InfoRow
              label="Teslimat e-postası"
              value={data.downloadEmailSentAt ? 'Gönderildi' : 'Henüz gönderilmedi'}
            />
            <InfoRow label="Son gönderim" value={formatDateTime(data.downloadEmailSentAt)} />
            {data.paymentConfirmedByEmail ? (
              <InfoRow label="Havale onaylayan" value={data.paymentConfirmedByEmail} />
            ) : null}
            {data.digitalDeliveryEmailAlert ? (
              <div className="space-y-2">
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {data.digitalDeliveryEmailAlert}
                </p>
                {canRetryDelivery ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={retryDeliveryMutation.isPending}
                    onClick={() => {
                      setFormError(null)
                      void retryDeliveryMutation.mutateAsync()
                    }}
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${retryDeliveryMutation.isPending ? 'animate-spin' : ''}`} />
                    Lisans teslimatını yeniden dene
                  </Button>
                ) : null}
              </div>
            ) : canRetryDelivery ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={retryDeliveryMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  void retryDeliveryMutation.mutateAsync()
                }}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${retryDeliveryMutation.isPending ? 'animate-spin' : ''}`} />
                Lisans teslimatını yeniden dene
              </Button>
            ) : (
              <p className="text-xs text-slate-500">
                Detaylı e-posta hata günlüğü backend yanıtında yok; uyarı varsa yukarıda gösterilir.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="overflow-x-auto p-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Ürünler</h2>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Ürün</TH>
                <TH>Adet</TH>
                <TH>Birim</TH>
                <TH>Toplam</TH>
                <TH>Teslimat</TH>
                <TH>Merkezi lisans</TH>
              </TR>
            </THead>
            <TBody>
              {data.items.map((item) => (
                <TR key={item.id}>
                  <TD>
                    <p className="font-medium">{item.productName}</p>
                    {item.productSlug ? <p className="text-xs text-slate-500">{item.productSlug}</p> : null}
                  </TD>
                  <TD>{item.quantity}</TD>
                  <TD>{formatMoney(item.unitPrice, data.currency)}</TD>
                  <TD>{formatMoney(item.total, data.currency)}</TD>
                  <TD className="text-xs text-slate-600">
                    {item.downloadUrl
                      ? isSaasOrderDeliveryUrl(item.downloadUrl)
                        ? 'E-posta ile hesap'
                        : 'İndirme bağlantısı'
                      : '—'}
                  </TD>
                  <TD className="text-xs">
                    {item.licenseRequired ? (
                      item.licenseServerLastError?.trim() ? (
                        <span className="text-red-700">{item.licenseServerLastError.trim()}</span>
                      ) : (item.licenseServerUnitsNotified ?? 0) >= item.quantity ? (
                        <span className="text-emerald-700">Oluşturuldu ({item.licenseServerUnitsNotified}/{item.quantity})</span>
                      ) : paidLike ? (
                        <span className="text-amber-800">Bekleniyor</span>
                      ) : (
                        <span className="text-slate-500">Ödeme sonrası</span>
                      )
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ödeme</h2>
            <InfoRow label="Provider" value={data.paymentProvider} />
            <InfoRow label="Durum" value={data.paymentStatusLabel ?? data.paymentStatus ?? '—'} />
            <InfoRow label="PayTR işlem" value={data.paytrTransactionStatus ?? '—'} />
            <InfoRow label="Ödeme tarihi" value={formatDateTime(data.paidAt)} />
            {data.paymentTransactions.map((tx) => (
              <div key={tx.id} className="rounded-lg bg-slate-50 p-3 text-xs">
                <p className="font-mono">{tx.merchantOid}</p>
                <p className="text-slate-600">
                  {tx.status} — {formatMoney(tx.amount, tx.currency)}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {isBank ? 'Havale' : 'Teslimat'}
            </h2>
            {isBank ? (
              <>
                <InfoRow label="Referans" value={data.bankTransferReference ?? '—'} />
                {canConfirmBank && !bankOpen ? (
                  <Button variant="secondary" onClick={() => setBankOpen(true)}>
                    Havale/EFT ödemesini onayla
                  </Button>
                ) : null}
                {bankOpen ? (
                  <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                    <Input label="Ödeme tarihi" type="date" value={bankDate} onChange={(e) => setBankDate(e.target.value)} />
                    <Input label="Not *" value={bankNote} onChange={(e) => setBankNote(e.target.value)} />
                    <Input label="Referans" value={bankRef} onChange={(e) => setBankRef(e.target.value)} />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => void bankMutation.mutateAsync()}
                        disabled={bankMutation.isPending || !bankNote.trim()}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Onayla
                      </Button>
                      <Button variant="secondary" onClick={() => setBankOpen(false)}>
                        İptal
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <InfoRow label="İndirme e-postası" value={formatDateTime(data.downloadEmailSentAt)} />
            )}
          </CardBody>
        </Card>
      </div>

      {data.licenses && data.licenses.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Website lisans kayıtları</h2>
              <p className="mt-1 text-xs text-slate-500">
                Yerel veritabanı kayıtları (indirme modeli). Merkezi lisans server kayıtları ayrı yönetilir.
              </p>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Lisans kodu</TH>
                  <TH>Ürün</TH>
                  <TH>Lisans durumu</TH>
                  <TH>Aktivasyon</TH>
                  <TH>Cihaz limiti</TH>
                  <TH>Bitiş</TH>
                  <TH className="text-right">İşlem</TH>
                </TR>
              </THead>
              <TBody>
                {data.licenses.map((lic) => (
                  <TR key={lic.id}>
                    <TD>
                      <Link to={`/admin/lisanslar/${lic.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                        {lic.licenseKey}
                      </Link>
                    </TD>
                    <TD>{lic.productName}</TD>
                    <TD>
                      <Badge tone={licenseStatusTone(lic.status)}>{licenseStatusLabel(lic.status)}</Badge>
                    </TD>
                    <TD className="text-xs">
                      {lic.activatedDevicesCount > 0
                        ? `${lic.activatedDevicesCount} cihaz aktif`
                        : 'Aktivasyon bekliyor'}
                    </TD>
                    <TD>{lic.maxDevices}</TD>
                    <TD className="text-xs">{formatDateTime(lic.expiresAt)}</TD>
                    <TD className="text-right">
                      <Link to={`/admin/lisanslar/${lic.id}`}>
                        <Button variant="secondary" size="sm">
                          Detay
                        </Button>
                      </Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      ) : paidLike && centralLicenseItems.length > 0 ? (
        <Card className="border-sky-200 bg-sky-50/60">
          <CardBody>
            <h2 className="text-sm font-semibold text-sky-950">Merkezi lisans durumu</h2>
            {centralLicenseErrors.length > 0 ? (
              <p className="mt-2 text-sm text-red-800">
                Lisans oluşturulamadı: {centralLicenseErrors[0]!.licenseServerLastError}
              </p>
            ) : (
              <p className="mt-2 text-sm text-sky-900">{CENTRAL_LICENSE_PENDING_ADMIN}</p>
            )}
            <p className="mt-2 text-xs text-sky-800">
              Teslimat: ödeme onayı sonrası lisans bilgileri e-posta ile iletilir. İndirme e-postası:{' '}
              {formatDateTime(data.downloadEmailSentAt)}
            </p>
            {canRetryDelivery ? (
              <Button
                className="mt-3"
                variant="secondary"
                size="sm"
                disabled={retryDeliveryMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  void retryDeliveryMutation.mutateAsync()
                }}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${retryDeliveryMutation.isPending ? 'animate-spin' : ''}`} />
                Lisans teslimatını yeniden dene
              </Button>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <CentralLicenseInfoBanner compact />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Yönetim</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Sipariş durumu</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="PENDING">Beklemede</option>
                <option value="PROCESSING">İşleniyor</option>
                <option value="PAID">Ödendi</option>
                <option value="FAILED">Başarısız</option>
                <option value="CANCELLED">İptal</option>
              </select>
            </div>
            <Input label="Admin notu" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              setFormError(null)
              void updateMutation.mutateAsync()
            }}
            disabled={updateMutation.isPending}
          >
            Kaydet
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
