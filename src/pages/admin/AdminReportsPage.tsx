import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminOrdersService } from '@/services/api/adminOrders'
import { adminLicensesService } from '@/services/api/adminLicenses'
import { computeSalesReport } from '@/types/report'
import { countLicenseRecords } from '@/types/license'
import { formatMoney } from '@/utils/formatMoney'
import { getErrorMessage } from '@/services/api/client'

export function AdminReportsPage() {
  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', 'reports'],
    queryFn: () => adminOrdersService.list(),
  })

  const licensesQuery = useQuery({
    queryKey: ['admin', 'licenses', 'reports'],
    queryFn: () => adminLicensesService.list(),
  })

  const loading = ordersQuery.isLoading || licensesQuery.isLoading
  const failed = ordersQuery.isError || licensesQuery.isError

  const report =
    ordersQuery.data && licensesQuery.data
      ? computeSalesReport(ordersQuery.data, countLicenseRecords(licensesQuery.data))
      : null

  const cards = report
    ? [
        { label: 'Toplam ciro (ödenen)', value: formatMoney(report.summary.totalRevenue, report.summary.totalCurrency) },
        { label: 'Bu ay ciro', value: formatMoney(report.summary.monthlyRevenue, report.summary.monthlyCurrency) },
        { label: 'Toplam sipariş', value: String(report.summary.totalOrders) },
        { label: 'Ödenen sipariş', value: String(report.summary.paidOrders) },
        { label: 'Havale bekleyen', value: String(report.summary.bankTransferPending) },
        { label: 'Lisans kayıtları', value: String(report.summary.licenseRecords) },
      ]
    : []

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Raporlar"
        description="Sipariş ve lisans verilerinden türetilmiş özet — ayrı rapor API'si yok."
      />

      {loading ? <LoadingState label="Rapor verileri yükleniyor…" /> : null}

      {failed ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-800">
              {getErrorMessage(ordersQuery.error ?? licensesQuery.error, 'Veri alınamadı')}
            </p>
          </CardBody>
        </Card>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardBody>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{c.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card>
            <CardBody className="overflow-x-auto p-0">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Ürün bazlı satış özeti</h2>
                <p className="text-xs text-slate-500">Ödenen siparişler · productSummary alanından gruplanır</p>
              </div>
              <Table>
                <THead>
                  <TR>
                    <TH>Ürün özeti</TH>
                    <TH>Sipariş</TH>
                    <TH>Adet</TH>
                    <TH>Ciro</TH>
                  </TR>
                </THead>
                <TBody>
                  {report.productRows.length === 0 ? (
                    <TR>
                      <TD colSpan={4} className="text-slate-500">
                        Henüz ödenen sipariş yok.
                      </TD>
                    </TR>
                  ) : (
                    report.productRows.map((row) => (
                      <TR key={row.productLabel}>
                        <TD className="font-medium">{row.productLabel}</TD>
                        <TD>{row.orderCount}</TD>
                        <TD>{row.unitsSold}</TD>
                        <TD>{formatMoney(row.revenue, row.currency)}</TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="overflow-x-auto p-0">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Ödeme yöntemi özeti</h2>
              </div>
              <Table>
                <THead>
                  <TR>
                    <TH>Yöntem</TH>
                    <TH>Sipariş</TH>
                    <TH>Ciro</TH>
                  </TR>
                </THead>
                <TBody>
                  {report.paymentRows.length === 0 ? (
                    <TR>
                      <TD colSpan={3} className="text-slate-500">
                        Veri yok.
                      </TD>
                    </TR>
                  ) : (
                    report.paymentRows.map((row) => (
                      <TR key={row.method}>
                        <TD className="font-medium">{row.method}</TD>
                        <TD>{row.orderCount}</TD>
                        <TD>{formatMoney(row.revenue, row.currency)}</TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </CardBody>
          </Card>

          <p className="text-xs text-slate-500">
            Kaynak: GET /api/admin/orders, GET /api/admin/licenses —{' '}
            <Link to="/admin/siparisler" className="text-brand-700 hover:underline">
              Siparişler
            </Link>
          </p>
        </>
      ) : null}
    </div>
  )
}
