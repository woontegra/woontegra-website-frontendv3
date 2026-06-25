import { useEffect, useState } from 'react'
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
import { productCategoriesService, type ProductCategoryInput } from '@/services/api/productCategories'
import { slugifySoftwareName } from '@/types/product'

const empty: ProductCategoryInput = { name: '', slug: '', description: '', parentId: null, isActive: true, sortOrder: 0 }

export function AdminProductCategoriesPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductCategoryInput>(empty)
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: () => productCategoriesService.list(),
  })

  useEffect(() => {
    if (slugManual || editingId) return
    setForm((f) => ({ ...f, slug: slugifySoftwareName(f.name) }))
  }, [form.name, slugManual, editingId])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Kategori adı gerekli')
      const payload = { ...form, name: form.name.trim(), slug: form.slug?.trim() || slugifySoftwareName(form.name) }
      if (editingId) return productCategoriesService.update(editingId, payload)
      return productCategoriesService.create(payload)
    },
    onSuccess: () => {
      setEditingId(null)
      setForm(empty)
      setSlugManual(false)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productCategoriesService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] }),
  })

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Kategoriler" description="Ürün kategorileri." />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Kategori düzenle' : 'Yeni kategori'}</h2>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Ad" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input
              label="Slug"
              value={form.slug ?? ''}
              onChange={(e) => {
                setSlugManual(true)
                setForm((f) => ({ ...f, slug: e.target.value }))
              }}
            />
          </div>
          <Input
            label="Açıklama"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive !== false}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Aktif
            </label>
            <Input
              label="Sıralama"
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number.parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void saveMutation.mutateAsync()} disabled={saveMutation.isPending}>
              {editingId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editingId ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null)
                  setForm(empty)
                }}
              >
                İptal
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState label="Kategoriler yükleniyor…" /> : null}
      {isError ? <EmptyState title="Yüklenemedi" description="Kategori listesi alınamadı." /> : null}

      {data && data.length > 0 ? (
        <Table>
          <THead>
            <TR>
              <TH>Ad</TH>
              <TH>Slug</TH>
              <TH>Sıra</TH>
              <TH>Durum</TH>
              <TH className="text-right">İşlem</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium">{c.name}</TD>
                <TD className="font-mono text-xs text-slate-500">{c.slug}</TD>
                <TD>{c.sortOrder}</TD>
                <TD>{c.isActive ? 'Aktif' : 'Pasif'}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingId(c.id)
                        setForm({
                          name: c.name,
                          slug: c.slug,
                          description: c.description ?? '',
                          parentId: c.parentId,
                          isActive: c.isActive,
                          sortOrder: c.sortOrder,
                        })
                        setSlugManual(true)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`“${c.name}” silinsin mi?`)) void deleteMutation.mutateAsync(c.id)
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
      ) : (
        !isLoading && <EmptyState title="Kategori yok" />
      )}
    </div>
  )
}
