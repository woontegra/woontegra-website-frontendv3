import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { CentralLicenseInfoBanner } from '@/components/admin/CentralLicenseInfoBanner'
import { adminOrdersService } from '@/services/api/adminOrders'
import { adminLicensesService } from '@/services/api/adminLicenses'
import { getErrorMessage } from '@/services/api/client'
import {
  activationStatusLabel,
  licensePeriodLabel,
  licenseRecordScopeLabel,
} from '@/types/license'
import {
  formatDateTime,
  licenseStatusLabel,
  licenseStatusTone,
  orderStatusMeta,
  paymentMethodLabel,
} from '@/utils/adminOrderUi'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(140px,180px)_1fr] sm:gap-3">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  )
}

const SEND_EMAIL_CONFIRM =
  'Bu lisans bilgileri müşteriye yeniden gönderilsin mi? Mevcut aktivasyon şifresi e-postada yer almayabilir.'

export function AdminLicenseDetailPage() {
  const { id = '' } = useParams()
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const licenseQuery = useQuery({
    queryKey: ['admin', 'license', id],
    queryFn: () => adminLicensesService.getById(id),
    enabled: Boolean(id),
  })

  const orderQuery = useQuery({
    queryKey: ['admin', 'order', licenseQuery.data?.orderId],
    queryFn: () => adminOrdersService.getById(licenseQuery.data!.orderId!),
    enabled: Boolean(licenseQuery.data?.orderId),
  })

  const sendEmailMutation = useMutation({
    mutationFn: () => adminLicensesService.sendEmail(id),
    onSuccess: () => {
      setEmailMessage('Lisans / kurulum e-postası gönderildi.')
      setEmailError(null)
    },
    onError: (err) => {
      setEmailError(getErrorMessage(err, 'E-posta gönderilemedi'))
      setEmailMessage(null)
    },
  })

  const license = licenseQuery.data
  const order = orderQuery.data

  const handleSendEmail = () => {
    if (!window.confirm(SEND_EMAIL_CONFIRM)) return
    void sendEmailMutation.mutateAsync()
  }

  if (licenseQuery.isLoading) {
    return (
      <div className="w-full min-w-0 space-y-6">
        <LoadingState label="Lisans detayı yükleniyor…" />
      </div>
    )
  }

  if (licenseQuery.isError || !license) {
    return (
      <div className="w-full min-w-0 space-y-6">
        <Link to="/admin/lisanslar" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Lisans kayıtları
        </Link>
        <EmptyState
          title="Lisans bulunamadı"
          description={getErrorMessage(licenseQuery.error, 'Kayıt okunamadı veya silinmiş olabilir.')}
        />
      </div>
    )
  }

  const orderItem = order?.items.find((item) => item.productName === license.productName) ?? order?.items[0]

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link to="/admin/lisanslar" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Lisans kayıtları
      </Link>

      <PageHeader
        title="Lisans detayı"
        description="Website veritabanındaki lisans takip kaydı — görüntüleme ve e-posta operasyonları."
        actions={
          license.orderId ? (
            <Link to={`/admin/siparisler/${license.orderId}`}>
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4" />
                Siparişe git
              </Button>
            </Link>
          ) : null
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Lisans özeti</h2>
          <dl className="space-y-3">
            <DetailRow label="Kayıt ID" value={<span className="font-mono text-xs">{license.id}</span>} />
            <DetailRow label="Lisans kodu" value={<span className="font-mono text-xs">{license.licenseKey || '—'}</span>} />
            <DetailRow
              label="Durum"
              value={<Badge tone={licenseStatusTone(license.status)}>{licenseStatusLabel(license.status)}</Badge>}
            />
            <DetailRow label="Program kodu" value={license.productCode ?? '—'} />
            <DetailRow label="Kayıt kapsamı" value={licenseRecordScopeLabel(license.source)} />
            <DetailRow label="Lisans süresi" value={licensePeriodLabel(license.startsAt, license.expiresAt)} />
            <DetailRow label="Cihaz limiti" value={String(license.maxDevices)} />
            <DetailRow
              label="Aktivasyon"
              value={activationStatusLabel(license.activatedDevicesCount, license.maxDevices, license.status)}
            />
            <DetailRow label="Başlangıç" value={formatDateTime(license.startsAt)} />
            <DetailRow label="Bitiş" value={formatDateTime(license.expiresAt)} />
            <DetailRow label="Oluşturulma" value={formatDateTime(license.createdAt)} />
            <DetailRow label="Son güncelleme" value={formatDateTime(license.updatedAt)} />
            {license.notes ? <DetailRow label="Not" value={license.notes} /> : null}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Sipariş bilgisi</h2>
          {license.orderId ? (
            orderQuery.isLoading ? (
              <p className="text-sm text-slate-500">Sipariş bilgisi yükleniyor…</p>
            ) : order ? (
              <dl className="space-y-3">
                <DetailRow label="Sipariş no" value={order.orderNo} />
                <DetailRow label="Sipariş tarihi" value={formatDateTime(order.createdAt)} />
                <DetailRow
                  label="Ödeme durumu"
                  value={
                    <Badge tone={orderStatusMeta(order.status).tone}>{order.orderStatusLabel ?? orderStatusMeta(order.status).label}</Badge>
                  }
                />
                <DetailRow label="Ödeme yöntemi" value={paymentMethodLabel(order)} />
                <DetailRow label="İndirme e-postası" value={formatDateTime(order.downloadEmailSentAt)} />
                <DetailRow
                  label="Sipariş detayı"
                  value={
                    <Link to={`/admin/siparisler/${order.id}`} className="font-medium text-brand-700 hover:underline">
                      Siparişi aç
                    </Link>
                  }
                />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Sipariş bilgisi alınamadı.</p>
            )
          ) : (
            <p className="text-sm text-slate-500">Bu kayıt bir siparişe bağlı değil.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Müşteri bilgisi</h2>
          <dl className="space-y-3">
            <DetailRow label="Ad soyad" value={license.customerName ?? order?.customer.customerName ?? '—'} />
            <DetailRow label="E-posta" value={license.customerEmail} />
            <DetailRow label="Telefon" value={license.customerPhone ?? order?.customer.customerPhone ?? '—'} />
            <DetailRow label="Firma" value={order?.customer.companyName ?? '—'} />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Ürün bilgisi</h2>
          <dl className="space-y-3">
            <DetailRow label="Ürün adı" value={license.productName} />
            <DetailRow label="Program kodu (appCode)" value={license.productCode ?? '—'} />
            <DetailRow
              label="Teslimat"
              value={
                orderItem?.downloadUrl
                  ? 'İndirme bağlantısı sipariş kaydında mevcut'
                  : 'Merkezi lisans server veya e-posta teslimatı'
              }
            />
          </dl>
        </CardBody>
      </Card>

      <Card className="border-sky-200 bg-sky-50/60">
        <CardBody className="space-y-2">
          <h2 className="text-sm font-semibold text-sky-950">Merkezi Lisans Server bilgisi</h2>
          <p className="text-sm text-sky-900">
            Bu kayıt website veritabanındaki lisans takip satırıdır. Lisans üretimi website içinde yapılmaz;{' '}
            <strong>licenseRequired</strong> ürünlerde merkezi Woontegra Lisans Server devreye girer.
          </p>
          <p className="text-sm text-sky-800">Merkezi lisans server referansı backend yanıtında bulunmuyor.</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">E-posta işlemleri</h2>
          <p className="text-sm text-slate-600">
            İndirme modeli lisans kayıtları için kurulum e-postasını tekrar gönderebilirsiniz. Merkezi server
            lisansları için e-posta merkezi sunucu / backend entegrasyonu üzerinden iletilir.
          </p>
          {emailMessage ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{emailMessage}</p>
          ) : null}
          {emailError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{emailError}</p>
          ) : null}
          <Button disabled={sendEmailMutation.isPending} onClick={handleSendEmail}>
            <Mail className="h-4 w-4" />
            {sendEmailMutation.isPending ? 'Gönderiliyor…' : 'Lisans / kurulum e-postasını gönder'}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="overflow-x-auto p-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Cihaz aktivasyonları</h2>
          </div>
          {license.activations.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">Henüz kayıtlı cihaz aktivasyonu yok.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Cihaz</TH>
                  <TH>Platform</TH>
                  <TH>Durum</TH>
                  <TH>İlk aktivasyon</TH>
                  <TH>Son doğrulama</TH>
                </TR>
              </THead>
              <TBody>
                {license.activations.map((a) => (
                  <TR key={a.id}>
                    <TD>
                      <div className="text-sm">{a.deviceName ?? '—'}</div>
                      <div className="text-xs text-slate-500">{a.deviceHash.slice(0, 16)}…</div>
                    </TD>
                    <TD className="text-sm">{a.platform ?? '—'}</TD>
                    <TD className="text-sm">{a.status}</TD>
                    <TD className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(a.firstActivatedAt)}</TD>
                    <TD className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(a.lastValidatedAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <CentralLicenseInfoBanner compact />
    </div>
  )
}
