import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/services/api/client'
import { brandsService, type BrandInput } from '@/services/api/brands'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const empty: BrandInput = { name: '', description: '', image: '', url: '' }

export function AdminBrandsPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BrandInput>(empty)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError, error: loadError, refetch } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => brandsService.listAdmin(),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Marka adı gerekli')
      if (!form.image.trim()) throw new Error('Logo/görsel URL zorunlu')
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        image: form.image.trim(),
        url: form.url?.trim() || undefined,
      }
      if (editingId) return brandsService.update(editingId, payload)
      return brandsService.create(payload)
    },
    onSuccess: () => {
      setEditingId(null)
      setForm(empty)
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandsService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] }),
  })

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Markalar"
        description="Site markaları. Backend ürün–marka ilişkisi desteklemediği için marka ürüne bağlanamaz."
      />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Marka düzenle' : 'Yeni marka'}</h2>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Input label="Marka adı" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input
            label="Açıklama"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Logo / görsel URL"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="/images/... veya https://..."
          />
          <Input
            label="Web sitesi"
            value={form.url ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button onClick={() => void saveMutation.mutateAsync()} disabled={saveMutation.isPending}>
              {editingId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editingId ? (
              <Button variant="secondary" onClick={() => { setEditingId(null); setForm(empty) }}>
                İptal
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="Markalar yükleniyor…" /> : null}
      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(loadError)}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>
              Tekrar dene
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState title="Marka yok" description="İlk markayı ekleyin." />
      ) : null}

      {data && data.length > 0 ? (
        <Table>
          <THead>
            <TR>
              <TH>Logo</TH>
              <TH>Ad</TH>
              <TH>Web</TH>
              <TH className="text-right">İşlem</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((b) => (
              <TR key={b.id}>
                <TD>
                  {b.image ? (
                    <img src={resolveMediaUrl(b.image)} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    '—'
                  )}
                </TD>
                <TD className="font-medium">{b.name}</TD>
                <TD className="text-slate-500">{b.url ?? '—'}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingId(b.id)
                        setForm({
                          name: b.name,
                          description: b.description ?? '',
                          image: b.image,
                          url: b.url ?? '',
                        })
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`“${b.name}” silinsin mi?`)) void deleteMutation.mutateAsync(b.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : null}
    </div>
  )
}
