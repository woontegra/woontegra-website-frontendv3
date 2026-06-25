import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Pencil, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PRODUCT_TYPE_LABELS } from '@/constants/product'
import { adminProductsService, getErrorMessage } from '@/services/api/adminProducts'
import type { AdminProduct } from '@/types/product'
import { formatMoney } from '@/utils/formatMoney'

function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function hasDigitalDelivery(item: AdminProduct): boolean {
  return Boolean(item.downloadMediaId || item.downloadUrl?.trim() || item.downloadMedia?.url)
}

function hasCoverImage(item: AdminProduct): boolean {
  return Boolean(item.coverImageMediaId || item.coverMedia?.url || item.coverImage?.trim())
}

function saleBadge(item: AdminProduct) {
  if (!item.isActive) return { label: 'Yayında değil', tone: 'default' as const }
  if (!item.purchaseEnabled) return { label: 'Satış kapalı', tone: 'warning' as const }
  if (!Number.isFinite(item.price) || item.price <= 0) return { label: 'Fiyatsız', tone: 'warning' as const }
  return { label: 'Satışta', tone: 'success' as const }
}

export function AdminProductListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'true' | 'false'>('all')

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      isActive: status === 'all' ? undefined : status,
    }),
    [search, status],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminProductsService.list(params),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminProductsService.deactivate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`“${name}” pasife alınsın mı?`)) return
    try {
      await deactivateMutation.mutateAsync(id)
    } catch (err) {
      window.alert(getErrorMessage(err, 'İşlem başarısız'))
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Ürünler"
        description="Katalog durumu — satış, teslimat, lisans ve görsel hazırlığı tek bakışta."
        actions={
          <Link
            to="/admin/urunler/yeni"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Yeni ürün
          </Link>
        }
      />

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Input label="Ara" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad veya slug…" />
          <div className="space-y-1.5">
            <label htmlFor="product-status" className="block text-sm font-medium text-slate-700">
              Durum
            </label>
            <select
              id="product-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="h-10 w-full min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">Tümü</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
          </div>
          <Button variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
            Yenile
          </Button>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="Ürünler yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm font-medium text-red-800">Liste yüklenemedi</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState title="Henüz ürün yok" description="İlk ürünü oluşturmak için “Yeni ürün” butonunu kullanın." />
      ) : null}

      {data && data.length > 0 ? (
        <Table>
          <THead>
            <TR>
              <TH>Ürün</TH>
              <TH>Kategori</TH>
              <TH>Fiyat</TH>
              <TH>Satış</TH>
              <TH>Teslimat</TH>
              <TH>Lisans</TH>
              <TH>Görsel</TH>
              <TH>Güncelleme</TH>
              <TH className="text-right">İşlemler</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((item) => {
              const sale = saleBadge(item)
              const digital = hasDigitalDelivery(item)
              return (
                <TR key={item.id}>
                  <TD>
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.slug}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {PRODUCT_TYPE_LABELS[item.productType] ?? item.productType}
                      {item.isFeatured ? (
                        <Badge tone="brand" className="ml-1">
                          Öne çıkan
                        </Badge>
                      ) : null}
                    </div>
                  </TD>
                  <TD>{item.category?.name ?? '—'}</TD>
                  <TD>
                    {item.price > 0 ? formatMoney(item.price, item.currency) : <span className="text-slate-400">—</span>}
                  </TD>
                  <TD>
                    <Badge tone={sale.tone}>{sale.label}</Badge>
                  </TD>
                  <TD>
                    {item.productType === 'DOWNLOAD' ? (
                      digital ? (
                        item.deliveryLinkMissing ? (
                          <Badge tone="danger">Eksik / geçersiz</Badge>
                        ) : (
                          <Badge tone="success">Dijital var</Badge>
                        )
                      ) : (
                        <Badge tone="warning">Dosya yok</Badge>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TD>
                  <TD>
                    {item.licenseRequired ? (
                      <div className="space-y-1">
                        <Badge tone="warning">Merkezi</Badge>
                        <div className="font-mono text-[10px] text-slate-500">{item.licenseAppCode ?? '—'}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Yok</span>
                    )}
                  </TD>
                  <TD>
                    {hasCoverImage(item) ? (
                      <Badge tone="success">Var</Badge>
                    ) : (
                      <Badge tone="default">Yok</Badge>
                    )}
                  </TD>
                  <TD className="text-slate-500">{formatDate(item.updatedAt)}</TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/urunler/${item.id}/duzenle`}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Düzenle
                      </Link>
                      {item.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDeactivate(item.id, item.name)}
                          disabled={deactivateMutation.isPending}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Pasife al
                        </Button>
                      ) : null}
                    </div>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      ) : null}
    </div>
  )
}
