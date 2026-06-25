import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService } from '@/services/api/customers'
import { getErrorMessage } from '@/services/api/client'
import { formatMoney } from '@/utils/formatMoney'

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'default' {
  const s = status.toUpperCase()
  if (s === 'PAID' || s === 'PROCESSING') return 'success'
  if (s === 'PENDING') return 'warning'
  if (s === 'FAILED' || s === 'CANCELLED') return 'danger'
  return 'default'
}

function statusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'Ödendi'
    case 'PROCESSING':
      return 'İşleniyor'
    case 'PENDING':
      return 'Beklemede'
    case 'FAILED':
      return 'Başarısız'
    case 'CANCELLED':
      return 'İptal'
    default:
      return status
  }
}

export function HesabimOrdersPage() {
  const { authed } = useCustomerSession()

  if (!authed) {
    return <Navigate to="/musteri-giris?return=%2Fhesabim%2Fsiparisler" replace />
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => customersService.listOrders(),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-6">
        <Link
          to="/hesabim"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Hesabıma dön
        </Link>
        <h1 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Siparişlerim</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ödeme onaylı dijital ürünlerin indirme bağlantıları sipariş detayında görünür.
        </p>
      </div>

      {isLoading ? <LoadingState label="Siparişler yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-800">{getErrorMessage(error, 'Siparişler yüklenemedi.')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState title="Henüz sipariş yok" description="Satın aldığınız ürünler burada listelenir." />
      ) : null}

      {data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((order) => (
            <li key={order.orderNo}>
              <Link
                to={`/hesabim/siparisler/${encodeURIComponent(order.orderNo)}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-900">{order.orderNo}</p>
                    <p className="mt-1 text-sm text-slate-600">{order.productSummary}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatMoney(order.total, order.currency)}</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-1">
                      <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-8 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Search className="mt-0.5 h-4 w-4 shrink-0" />
        Misafir siparişlerde indirme bilgileri e-posta ile gönderilir; giriş yapmadan da erişebilirsiniz.
      </p>
    </div>
  )
}
