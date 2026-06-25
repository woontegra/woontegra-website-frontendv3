import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Eye, Mail, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { CentralLicenseInfoBanner } from '@/components/admin/CentralLicenseInfoBanner'
import { adminLicensesService } from '@/services/api/adminLicenses'
import { getErrorMessage } from '@/services/api/client'
import {
  activationStatusLabel,
  licensePeriodLabel,
} from '@/types/license'
import { formatDateTime, licenseStatusLabel, licenseStatusTone } from '@/utils/adminOrderUi'

const SEND_EMAIL_CONFIRM =
  'Bu lisans bilgileri müşteriye yeniden gönderilsin mi? Mevcut aktivasyon şifresi e-postada yer almayabilir.'

export function AdminLicensesPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      status: status || undefined,
    }),
    [q, status],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'licenses', params],
    queryFn: () => adminLicensesService.list(params),
  })

  const items = data ?? []

  const handleSendEmail = async (id: string) => {
    if (!window.confirm(SEND_EMAIL_CONFIRM)) return
    setSendingId(id)
    setActionMessage(null)
    setActionError(null)
    try {
      await adminLicensesService.sendEmail(id)
      setActionMessage('E-posta gönderildi.')
    } catch (err) {
      setActionError(getErrorMessage(err, 'E-posta gönderilemedi'))
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Lisans kayıtları"
        description="Website veritabanındaki lisans takip kayıtları — görüntüleme ve e-posta operasyonları."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <CentralLicenseInfoBanner extra="licenseRequired ürünlerin merkezi lisansları Woontegra Lisans Server'da yönetilir; bu listede yalnızca website kayıtları görünür." />

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Input label="Ara" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lisans kodu, e-posta, sipariş no…" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tümü</option>
              <option value="ACTIVE">Aktif</option>
              <option value="DISABLED">Pasif</option>
              <option value="EXPIRED">Süresi dolmuş</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {actionMessage ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardBody className="text-sm text-emerald-800">{actionMessage}</CardBody>
        </Card>
      ) : null}
      {actionError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="text-sm text-red-700">{actionError}</CardBody>
        </Card>
      ) : null}

      {isLoading ? <LoadingState label="Lisans kayıtları yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Lisans kayıtları yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState
          title="Kayıt bulunamadı"
          description="Website lisans kaydı yok veya arama kriterlerine uyan sonuç yok."
        />
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Lisans kodu</TH>
                  <TH>Sipariş no</TH>
                  <TH>Ürün</TH>
                  <TH>Müşteri e-posta</TH>
                  <TH>Program kodu</TH>
                  <TH>Durum</TH>
                  <TH>Aktivasyon</TH>
                  <TH>Cihaz limiti</TH>
                  <TH>Lisans süresi</TH>
                  <TH>Bitiş</TH>
                  <TH>Son güncelleme</TH>
                  <TH className="text-right">İşlemler</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD className="max-w-[140px] truncate text-xs text-slate-800" title={row.licenseKey}>
                      {row.licenseKey || '—'}
                    </TD>
                    <TD className="text-xs">{row.orderNo ?? '—'}</TD>
                    <TD className="text-sm">{row.productName}</TD>
                    <TD className="text-sm">{row.customerEmail}</TD>
                    <TD className="text-xs text-slate-600">{row.productCode ?? '—'}</TD>
                    <TD>
                      <Badge tone={licenseStatusTone(row.status)}>{licenseStatusLabel(row.status)}</Badge>
                    </TD>
                    <TD className="text-xs text-slate-700">
                      {activationStatusLabel(row.activatedDevicesCount, row.maxDevices, row.status)}
                    </TD>
                    <TD className="text-sm">{row.maxDevices}</TD>
                    <TD className="whitespace-nowrap text-xs text-slate-600">
                      {licensePeriodLabel(row.startsAt, row.expiresAt)}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.expiresAt)}</TD>
                    <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.updatedAt)}</TD>
                    <TD>
                      <div className="flex flex-wrap justify-end gap-1">
                        <Link to={`/admin/lisanslar/${row.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-3.5 w-3.5" />
                            Detay
                          </Button>
                        </Link>
                        {row.orderId ? (
                          <Link to={`/admin/siparisler/${row.orderId}`}>
                            <Button variant="ghost" size="sm">
                              Sipariş
                            </Button>
                          </Link>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={sendingId === row.id}
                          onClick={() => void handleSendEmail(row.id)}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {sendingId === row.id ? '…' : 'E-posta'}
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
