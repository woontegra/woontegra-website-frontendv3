import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { ManagedImageField } from '@/components/admin/ManagedImageField'
import { adminBlogService, getErrorMessage } from '@/services/api/adminBlog'
import type { AdminBlogPostInput } from '@/types/blog'
import { slugifyBlogTitle } from '@/types/blog'

const emptyForm: AdminBlogPostInput = {
  title: '',
  slug: '',
  excerpt: '',
  bodyHtml: '',
  featuredImage: '',
  status: 'draft',
  categoryId: null,
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

export function AdminBlogFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [form, setForm] = useState<AdminBlogPostInput>(emptyForm)
  const [slugManual, setSlugManual] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'blog', id],
    queryFn: () => adminBlogService.getById(id!),
    enabled: !isNew && Boolean(id),
  })

  useEffect(() => {
    if (!data) return
    setForm({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? '',
      bodyHtml: data.bodyHtml ?? '',
      featuredImage: data.featuredImage ?? '',
      status: data.status,
      categoryId: data.category?.id ?? null,
    })
    setSlugManual(true)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: AdminBlogPostInput = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim() || slugifyBlogTitle(form.title),
        excerpt: form.excerpt?.trim() || null,
        bodyHtml: form.bodyHtml?.trim() || null,
        featuredImage: form.featuredImage?.trim() || null,
      }
      if (payload.title.length < 2) throw new Error('Başlık en az 2 karakter olmalıdır')
      if (isNew) return adminBlogService.create(payload)
      return adminBlogService.update(id!, payload)
    },
    onSuccess: () => navigate('/admin/blog'),
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const update = <K extends keyof AdminBlogPostInput>(key: K, value: AdminBlogPostInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !slugManual) {
        next.slug = slugifyBlogTitle(String(value))
      }
      return next
    })
  }

  if (!isNew && isLoading) return <LoadingState label="Yazı yükleniyor…" />
  if (!isNew && isError) return <EmptyState title="Yazı bulunamadı" description="Kayıt yüklenemedi." />

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={isNew ? 'Yeni blog yazısı' : 'Blog yazısını düzenle'}
        actions={
          <Link
            to="/admin/blog"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Listeye dön
          </Link>
        }
      />

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          setFormError(null)
          void saveMutation.mutateAsync()
        }}
      >
        {formError ? (
          <Card className="border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-700">{formError}</p>
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Başlık" value={form.title} onChange={(e) => update('title', e.target.value)} required />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  update('slug', e.target.value)
                }}
              />
            </div>
            <TextArea label="Özet" value={form.excerpt ?? ''} onChange={(v) => update('excerpt', v)} rows={3} />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-medium text-slate-700">İçerik</label>
                {form.slug?.trim() ? (
                  <a
                    href={`/blog/${form.slug.trim()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Canlı sayfayı aç
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
              <textarea
                value={form.bodyHtml ?? ''}
                onChange={(e) => update('bodyHtml', e.target.value)}
                rows={16}
                placeholder="HTML veya düz metin yazabilirsiniz."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <p className="text-xs text-slate-500">Public blog sayfasında HTML içerik tipografi ile render edilir.</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <ManagedImageField
              label="Kapak görseli"
              hint="Blog listesi ve blog detay sayfasında gösterilir. Medya kütüphanesinden seçebilir veya yeni dosya yükleyebilirsiniz."
              sizeSpec="blogCover"
              value={form.featuredImage ?? ''}
              onChange={(url) => update('featuredImage', url)}
              previewVariant="wide"
              allowDirectUpload
              manualUrlCollapsible
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="blog-status" className="block text-sm font-medium text-slate-700">
                Yayın durumu
              </label>
              <select
                id="blog-status"
                value={form.status ?? 'draft'}
                onChange={(e) => update('status', e.target.value)}
                className="h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
              </select>
            </div>
            <p className="text-xs text-slate-500">
              Blog SEO alanları backend Post modelinde yok; başlık ve özet public sayfada kullanılır.
            </p>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/blog')}>
            İptal
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Kaydediliyor…' : isNew ? 'Oluştur' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  )
}
