import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Eye, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminOrdersService, type AdminOrderListParams } from '@/services/api/adminOrders'
import { getErrorMessage } from '@/services/api/client'
import { formatMoney } from '@/utils/formatMoney'
import {
  formatDateTime,
  orderStatusMeta,
  paymentBadgeLabel,
  paymentBadgeTone,
  paymentMethodLabel,
  resolvePaymentBadgeKind,
} from '@/utils/adminOrderUi'

export function AdminOrdersPage() {
  const [status, setStatus] = useState('')
  const [paymentProvider, setPaymentProvider] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [orderNo, setOrderNo] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const params: AdminOrderListParams = useMemo(
    () => ({
      status: status || undefined,
      paymentProvider: paymentProvider || undefined,
      paymentStatus: paymentStatus || undefined,
      customerQuery: customerQuery.trim() || undefined,
      orderNo: orderNo.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [status, paymentProvider, paymentStatus, customerQuery, orderNo, dateFrom, dateTo],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminOrdersService.list(params),
  })

  const items = data ?? []

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Siparişler"
        description="Web sitesi siparişleri ve ödeme durumları."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Sipariş no" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          <Input
            label="Müşteri / e-posta"
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Sipariş durumu</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tümü</option>
              <option value="PENDING">Beklemede</option>
              <option value="PROCESSING">İşleniyor</option>
              <option value="PAID">Ödendi</option>
              <option value="FAILED">Başarısız</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Ödeme yöntemi</label>
            <select
              value={paymentProvider}
              onChange={(e) => setPaymentProvider(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tümü</option>
              <option value="PAYTR">PayTR</option>
              <option value="BANK_TRANSFER">Havale/EFT</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Ödeme durumu</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tümü</option>
              <option value="PENDING">Bekliyor</option>
              <option value="WAITING_BANK_TRANSFER">Havale bekliyor</option>
              <option value="SUCCESS">Başarılı</option>
            </select>
          </div>
          <Input label="Başlangıç tarihi" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input label="Bitiş tarihi" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="Siparişler yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Siparişler yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState title="Sipariş bulunamadı" description="Filtreleri değiştirin veya henüz sipariş yok." />
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Sipariş no</TH>
                  <TH>Müşteri</TH>
                  <TH>Ürün</TH>
                  <TH>Tutar</TH>
                  <TH>Ödeme</TH>
                  <TH>Ödeme durumu</TH>
                  <TH>Sipariş</TH>
                  <TH>Tarih</TH>
                  <TH className="text-right">İşlem</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => {
                  const orderMeta = orderStatusMeta(row.status)
                  const payKind = resolvePaymentBadgeKind(row)
                  return (
                    <TR key={row.id}>
                      <TD className="font-mono text-xs">{row.orderNo}</TD>
                      <TD>
                        <div className="min-w-[140px]">
                          <p className="font-medium text-slate-900">{row.customerName}</p>
                          <p className="text-xs text-slate-500">{row.customerEmail}</p>
                        </div>
                      </TD>
                      <TD className="max-w-[180px] truncate text-sm">{row.productSummary}</TD>
                      <TD className="whitespace-nowrap font-medium">{formatMoney(row.total, row.currency)}</TD>
                      <TD>
                        <span className="text-xs text-slate-600">
                          {paymentMethodLabel(row)}
                        </span>
                      </TD>
                      <TD>
                        <Badge tone={paymentBadgeTone(payKind)}>{paymentBadgeLabel(payKind)}</Badge>
                      </TD>
                      <TD>
                        <Badge tone={orderMeta.tone}>{orderMeta.label}</Badge>
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.createdAt)}</TD>
                      <TD className="text-right">
                        <Link to={`/admin/siparisler/${row.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            Detay
                          </Button>
                        </Link>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
