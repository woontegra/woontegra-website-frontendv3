import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ManagedImageField } from '@/components/admin/ManagedImageField'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  getSolutionBySlug,
  SOLUTION_PAGE_CONTENT_KEY,
  type SolutionDetailContent,
} from '@/data/solutionCatalog'
import { getErrorMessage } from '@/services/api/client'
import { pageContentService } from '@/services/api/pageContent'
import { normalizeSolutionPages } from '@/pages/site/SolutionDetailPage'

export function AdminSolutionEditPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const catalog = getSolutionBySlug(slug)
  const [form, setForm] = useState<SolutionDetailContent>(() => catalog ?? ({} as SolutionDetailContent))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!slug || !catalog) return
    setLoading(true)
    void pageContentService
      .getRawByKey(SOLUTION_PAGE_CONTENT_KEY)
      .then((raw) => {
        const pages = normalizeSolutionPages(raw)
        const partial = pages[slug]
        setForm({ ...catalog, ...partial, slug: catalog.slug })
      })
      .catch(() => setForm(catalog))
      .finally(() => setLoading(false))
  }, [slug, catalog])

  if (!catalog) {
    return (
      <div className="space-y-4">
        <PageHeader title="Çözüm bulunamadı" />
        <Link to="/admin/cozumler" className="text-sm text-brand-700 hover:underline">
          Çözüm listesine dön
        </Link>
      </div>
    )
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const raw = (await pageContentService.getRawByKey(SOLUTION_PAGE_CONTENT_KEY)) ?? {}
      const pages = normalizeSolutionPages(raw)
      const next = {
        ...raw,
        pages: {
          ...pages,
          [slug]: form,
        },
      }
      await pageContentService.updateByKey(SOLUTION_PAGE_CONTENT_KEY, next as Record<string, unknown>)
      setSuccess('Çözüm kaydedildi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kaydedilemedi'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Çözüm yükleniyor…" />

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Çözüm: ${catalog.title}`}
        description={`/cozumler/${slug}`}
        actions={
          <a
            href={`/cozumler/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Public önizleme
          </a>
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Card>
        <CardBody className="space-y-6">
          <Input label="Başlık" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Açıklama</label>
            <textarea
              className="min-h-[96px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <ManagedImageField label="Logo / görsel" sizeSpec="solutionHero" value={form.logo ?? ''} onChange={(url) => setForm((f) => ({ ...f, logo: url }))} />
          <Input label="Dış site URL" value={form.externalUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} />
          <Input label="SEO başlık" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
          <Input label="SEO açıklama" value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
            Aktif
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/cozumler')}>
              Vazgeç
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
