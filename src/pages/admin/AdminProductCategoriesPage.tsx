import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Menu, Pencil, Trash2 } from 'lucide-react'
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
import { buildMenuQuickLink } from '@/lib/cmsQuickLinks'
import { categoryPublicPath } from '@/lib/menuSourceUrls'

const empty: ProductCategoryInput = { name: '', slug: '', description: '', parentId: null, isActive: true, sortOrder: 0 }

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateCategoryForm(form: ProductCategoryInput): string | null {
  const name = form.name.trim()
  const slugInput = form.slug?.trim() ?? ''

  if (!name) {
    if (slugInput) return 'Kategori adı zorunludur. Yalnızca slug ile kayıt yapılamaz.'
    return 'Kategori adı zorunludur.'
  }
  if (name.length < 2) return 'Kategori adı en az 2 karakter olmalıdır.'

  const slug = (slugInput || slugifySoftwareName(name)).toLowerCase()
  if (!slug) return 'Geçerli bir slug gerekli.'
  if (!SLUG_PATTERN.test(slug)) return 'Slug yalnızca küçük harf, rakam ve tire içerebilir.'
  return null
}

export function AdminProductCategoriesPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductCategoryInput>(empty)
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

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
      const validationError = validateCategoryForm(form)
      if (validationError) throw new Error(validationError)
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: (form.slug?.trim() || slugifySoftwareName(form.name)).toLowerCase(),
      }
      if (editingId) return productCategoriesService.update(editingId, payload)
      return productCategoriesService.create(payload)
    },
    onSuccess: () => {
      setEditingId(null)
      setForm(empty)
      setSlugManual(false)
      setError(null)
      setNameError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const sortedCategories = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr')),
    [data],
  )

  const slugPreview = slugifySoftwareName(form.name)

  const handleSave = () => {
    const validationError = validateCategoryForm(form)
    if (validationError) {
      setError(validationError)
      setNameError(!form.name.trim() ? validationError : null)
      return
    }
    setError(null)
    setNameError(null)
    void saveMutation.mutateAsync()
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productCategoriesService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] }),
  })

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorilerini yönetin. Kategori oluşturmak menüye otomatik eklemez — üst menüye koymak için Menü Yönetimi kullanın."
      />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Kategori düzenle' : 'Yeni kategori'}</h2>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Ad"
              required
              value={form.name}
              error={nameError ?? undefined}
              onChange={(e) => {
                setNameError(null)
                setError(null)
                setForm((f) => ({ ...f, name: e.target.value }))
              }}
            />
            <div className="space-y-1.5">
              <Input
                label="Slug"
                value={form.slug ?? ''}
                onChange={(e) => {
                  setSlugManual(true)
                  setError(null)
                  setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))
                }}
              />
              {form.name.trim() && !slugManual ? (
                <p className="text-xs text-slate-500">
                  Otomatik: <span className="font-mono">{slugPreview || '—'}</span>
                  {slugPreview === 'yazilimlar' ? ' (ör. Yazılımlar → yazilimlar)' : null}
                </p>
              ) : null}
            </div>
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
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
            {editingId ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null)
                  setForm(empty)
                  setSlugManual(false)
                  setError(null)
                  setNameError(null)
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

      {sortedCategories.length > 0 ? (
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
            {sortedCategories.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium">{c.name}</TD>
                <TD className="font-mono text-xs text-slate-500">{c.slug}</TD>
                <TD>{c.sortOrder}</TD>
                <TD>{c.isActive ? 'Aktif' : 'Pasif'}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Link
                      to={buildMenuQuickLink({
                        categoryId: c.id,
                        label: c.name,
                        path: categoryPublicPath(c.slug),
                      })}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Menu className="h-3.5 w-3.5" />
                      Menüye ekle
                    </Link>
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
