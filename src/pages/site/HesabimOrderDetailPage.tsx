import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, KeyRound } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { CENTRAL_LICENSE_PUBLIC_MESSAGE } from '@/constants/centralLicenseServer'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService } from '@/services/api/customers'
import { getErrorMessage } from '@/services/api/client'
import { formatMoney } from '@/utils/formatMoney'
import { isSaasOrderDeliveryUrl } from '@/utils/productPurchase'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function canShowDownload(status: string): boolean {
  const s = status.toUpperCase()
  return s === 'PAID' || s === 'PROCESSING'
}

export function HesabimOrderDetailPage() {
  const { orderNo: raw } = useParams()
  const orderNo = raw ? decodeURIComponent(raw) : ''
  const { authed } = useCustomerSession()

  if (!authed) {
    return <Navigate to={`/musteri-giris?return=${encodeURIComponent(`/hesabim/siparisler/${orderNo}`)}`} replace />
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', 'orders', orderNo],
    queryFn: () => customersService.getOrder(orderNo),
    enabled: Boolean(orderNo.trim()),
  })

  if (!orderNo.trim()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Sipariş bulunamadı" description="Geçersiz sipariş numarası." />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingState label="Sipariş yükleniyor…" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <p className="text-sm text-red-800">{getErrorMessage(error, 'Sipariş bulunamadı.')}</p>
        <Link to="/hesabim/siparisler" className="text-sm font-semibold text-emerald-700 hover:underline">
          Siparişlerime dön
        </Link>
      </div>
    )
  }

  const paid = canShowDownload(data.status)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link
        to="/hesabim/siparisler"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Siparişlerime dön
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="font-mono text-lg font-bold text-slate-900 sm:text-xl">{data.orderNo}</h1>
          <p className="mt-1 text-sm text-slate-600">{formatDate(data.createdAt)}</p>
          <Badge tone={paid ? 'success' : 'warning'} className="mt-3">
            {paid ? 'Ödeme onaylı' : 'Ödeme bekleniyor'}
          </Badge>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900">{formatMoney(data.total, data.currency)}</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ürünler</h2>
          <ul className="divide-y divide-slate-100">
            {data.items.map((item, i) => {
              const url = paid ? item.downloadUrl : null
              return (
                <li key={`${item.productName}-${i}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × {formatMoney(item.unitPrice, data.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatMoney(item.total, data.currency)}</p>
                    {url ? (
                      isSaasOrderDeliveryUrl(url) ? (
                        <p className="mt-1 text-xs text-slate-500">Hesap bilgileri e-posta ile</p>
                      ) : (
                        <a
                          href={url}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          İndir
                        </a>
                      )
                    ) : paid ? (
                      <p className="mt-1 text-xs text-slate-400">İndirme yok</p>
                    ) : (
                      <p className="mt-1 text-xs text-amber-700">Ödeme onayı sonrası açılır</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardBody>
      </Card>

      {data.licenseCodesMasked && data.licenseCodesMasked.length > 0 ? (
        <Card className="mt-4 border-sky-200 bg-sky-50/50">
          <CardBody className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-950">
              <KeyRound className="h-4 w-4" />
              Lisans bilgisi
            </div>
            <p className="text-xs text-sky-900">{CENTRAL_LICENSE_PUBLIC_MESSAGE}</p>
            <ul className="mt-2 space-y-1 font-mono text-sm text-slate-800">
              {data.licenseCodesMasked.map((code, i) => (
                <li key={i}>{code}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}

      {!paid ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          İndirme bağlantıları yalnızca ödeme onaylı siparişlerde gösterilir. Onay sonrası bilgiler e-posta ile de
          iletilir.
        </p>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          Ödeme onayından sonra indirme ve lisans bilgileri e-posta adresinize iletilmiştir.
        </p>
      )}

      <div className="mt-8">
        <Link to="/iletisim">
          <Button variant="secondary">Destek</Button>
        </Link>
      </div>
    </div>
  )
}
