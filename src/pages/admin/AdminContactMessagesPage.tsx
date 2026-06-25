import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Mail, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { contactMessagesAdminService, type ContactMessage } from '@/services/api/contactMessagesAdmin'
import { getErrorMessage } from '@/services/api/client'
import { cn } from '@/utils/cn'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('tr-TR')
  } catch {
    return iso
  }
}

export function AdminContactMessagesPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'contact-messages'],
    queryFn: () => contactMessagesAdminService.list(),
  })

  const items = useMemo(() => {
    const rows = data ?? []
    if (filter === 'unread') return rows.filter((m) => !m.read)
    if (filter === 'read') return rows.filter((m) => m.read)
    return rows
  }, [data, filter])

  const readMutation = useMutation({
    mutationFn: (id: string) => contactMessagesAdminService.markAsRead(id),
    onSuccess: (updated) => {
      setSelected(updated)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactMessagesAdminService.remove(id),
    onSuccess: () => {
      setSelected(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] })
    },
  })

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Müşteri talepleri"
        description="İletişim formu üzerinden gelen mesajlar."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Yenile
          </Button>
        }
      />

      {isLoading ? <LoadingState label="Mesajlar yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Mesajlar yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'Tümü'],
                ['unread', 'Okunmamış'],
                ['read', 'Okundu'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium',
                  filter === key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState title="Mesaj yok" description="Henüz iletişim formu mesajı gelmemiş." />
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-3">
                <CardBody className="overflow-x-auto p-0">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Durum</TH>
                        <TH>Gönderen</TH>
                        <TH>E-posta</TH>
                        <TH>Tarih</TH>
                        <TH className="text-right">İşlem</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {items.map((m) => (
                        <TR key={m.id} className={selected?.id === m.id ? 'bg-brand-50/40' : undefined}>
                          <TD>
                            <Badge tone={m.read ? 'default' : 'brand'}>{m.read ? 'Okundu' : 'Yeni'}</Badge>
                          </TD>
                          <TD className="font-medium text-slate-900">{m.name}</TD>
                          <TD className="text-xs">{m.email}</TD>
                          <TD className="text-xs text-slate-500">{formatDate(m.createdAt)}</TD>
                          <TD className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelected(m)}>
                              <Eye className="h-4 w-4" />
                              Detay
                            </Button>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </CardBody>
              </Card>

              <Card className="lg:col-span-2">
                <CardBody className="space-y-4">
                  {selected ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{selected.name}</p>
                          <a href={`mailto:${selected.email}`} className="text-sm text-brand-700">
                            {selected.email}
                          </a>
                        </div>
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      {selected.phone ? (
                        <p className="text-sm text-slate-600">
                          <span className="text-slate-500">Telefon:</span> {selected.phone}
                        </p>
                      ) : null}
                      {selected.company ? (
                        <p className="text-sm text-slate-600">
                          <span className="text-slate-500">Firma:</span> {selected.company}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-500">{formatDate(selected.createdAt)}</p>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-800">
                        {selected.message}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!selected.read ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={readMutation.isPending}
                            onClick={() => void readMutation.mutateAsync(selected.id)}
                          >
                            Okundu işaretle
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('Mesaj silinsin mi?')) void deleteMutation.mutateAsync(selected.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Sil
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Detay için listeden bir mesaj seçin.</p>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
