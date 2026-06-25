import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Pencil, Plus, PowerOff } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/services/api/client'
import { legalDocumentsAdminService } from '@/services/api/legalDocumentsAdmin'
import { LEGAL_DOC_TYPE_LABELS, legalDocPublicPath, type LegalDocType } from '@/types/legalDocuments'

function formatDateTime(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function AdminLegalDocumentsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'legal-documents'],
    queryFn: () => legalDocumentsAdminService.list(),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => legalDocumentsAdminService.deactivate(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'legal-documents'] }),
  })

  const handleDeactivate = async (id: string, title: string) => {
    if (!window.confirm(`“${title}” pasifleştirilsin mi?`)) return
    try {
      await deactivateMutation.mutateAsync(id)
    } catch (err) {
      window.alert(getErrorMessage(err, 'Pasifleştirilemedi'))
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Yasal Metinler"
        description="Checkout ve sipariş snapshot’larında kullanılan yasal belgeler — GET/PATCH /api/admin/legal-documents"
        actions={
          <Link
            to="/admin/yasal-metinler/yeni"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Yeni belge
          </Link>
        }
      />

      <Card className="border-slate-200 bg-slate-50">
        <CardBody className="text-sm text-slate-600">
          KVKK, gizlilik, çerez, iade, açık rıza ve kullanım şartları gibi{' '}
          <strong>CMS sayfaları</strong> için{' '}
          <Link to="/admin/icerikler" className="font-medium text-brand-700 hover:underline">
            İçerikler
          </Link>{' '}
          sayfasını kullanın. Bu ekran yalnızca <code className="rounded bg-white px-1">legal-documents</code> API
          belgelerini yönetir.
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="Yasal belgeler yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm font-medium text-red-800">Liste yüklenemedi</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>
              Tekrar dene
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState
          title="Henüz yasal belge eklenmemiş"
          description="Checkout ve public yasal sayfalar için ilk belgeyi oluşturun."
        />
      ) : null}

      {data && data.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Belge tipi</TH>
                  <TH>Başlık</TH>
                  <TH>Public route</TH>
                  <TH>Sürüm</TH>
                  <TH>Durum</TH>
                  <TH>Son güncelleme</TH>
                  <TH className="text-right">İşlemler</TH>
                </TR>
              </THead>
              <TBody>
                {data.map((row) => {
                  const typeLabel = LEGAL_DOC_TYPE_LABELS[row.type as LegalDocType] ?? row.type
                  const publicPath = legalDocPublicPath(row.type as LegalDocType)
                  return (
                    <TR key={row.id}>
                      <TD className="whitespace-nowrap text-slate-600">{typeLabel}</TD>
                      <TD className="font-medium text-slate-900">{row.title || '—'}</TD>
                      <TD>
                        {publicPath ? (
                          <Link
                            to={publicPath}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                          >
                            {publicPath}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TD>
                      <TD>v{row.version}</TD>
                      <TD>
                        <Badge tone={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Aktif' : 'Pasif'}</Badge>
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.updatedAt)}</TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/yasal-metinler/${row.id}/duzenle`}>
                            <Button variant="secondary" size="sm">
                              <Pencil className="h-3.5 w-3.5" />
                              Düzenle
                            </Button>
                          </Link>
                          {row.isActive ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={deactivateMutation.isPending}
                              onClick={() => void handleDeactivate(row.id, row.title)}
                            >
                              <PowerOff className="h-3.5 w-3.5" />
                              Pasifleştir
                            </Button>
                          ) : null}
                        </div>
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
