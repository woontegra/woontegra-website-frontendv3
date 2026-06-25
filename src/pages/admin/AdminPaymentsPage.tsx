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
import { adminPaymentsService } from '@/services/api/adminPayments'
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

export function AdminPaymentsPage() {
  const [customerQuery, setCustomerQuery] = useState('')
  const [paymentProvider, setPaymentProvider] = useState('')

  const params = useMemo(
    () => ({
      customerQuery: customerQuery.trim() || undefined,
      paymentProvider: paymentProvider || undefined,
    }),
    [customerQuery, paymentProvider],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminPaymentsService.listFromOrders(params),
  })

  const rows = data ?? []

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Ödemeler"
        description="Sipariş kaynaklı ödeme hareketleri (ayrı ödeme API yok)."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Müşteri / e-posta"
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Provider</label>
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
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="Ödemeler yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Ödemeler yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState title="Ödeme kaydı yok" description="Henüz sipariş/ödeme bulunmuyor." />
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Sipariş no</TH>
                  <TH>Müşteri</TH>
                  <TH>Tutar</TH>
                  <TH>Yöntem</TH>
                  <TH>Provider</TH>
                  <TH>Ödeme durumu</TH>
                  <TH>Sipariş</TH>
                  <TH>Tarih</TH>
                  <TH className="text-right">İşlem</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => {
                  const payKind = resolvePaymentBadgeKind({ ...row, status: row.orderStatus })
                  const orderMeta = orderStatusMeta(row.orderStatus)
                  return (
                    <TR key={row.orderId}>
                      <TD className="font-mono text-xs">{row.orderNo}</TD>
                      <TD>
                        <p className="font-medium">{row.customerName}</p>
                        <p className="text-xs text-slate-500">{row.customerEmail}</p>
                      </TD>
                      <TD className="whitespace-nowrap font-medium">{formatMoney(row.total, row.currency)}</TD>
                      <TD className="text-xs">{paymentMethodLabel(row)}</TD>
                      <TD className="text-xs text-slate-600">{row.paymentProvider}</TD>
                      <TD>
                        <Badge tone={paymentBadgeTone(payKind)}>{paymentBadgeLabel(payKind)}</Badge>
                      </TD>
                      <TD>
                        <Badge tone={orderMeta.tone}>{orderMeta.label}</Badge>
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.createdAt)}</TD>
                      <TD className="text-right">
                        <Link to={`/admin/siparisler/${row.orderId}`}>
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
