import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ManagedImageField } from '@/components/admin/ManagedImageField'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getServiceBySlug, SERVICE_PAGE_CONTENT_KEY } from '@/data/serviceCatalog'
import { SERVICE_DETAIL_BY_SLUG } from '@/data/serviceDetailContent'
import { getErrorMessage } from '@/services/api/client'
import { pageContentService } from '@/services/api/pageContent'
import { normalizeServicePages } from '@/pages/site/ServiceDetailPage'

type ServicePageAdmin = {
  enabled: boolean
  menuTitle: string
  showInHeader: boolean
  showInFooter: boolean
  sortOrder: number
  seoTitle: string
  seoDescription: string
  hero: {
    eyebrow: string
    title: string
    description: string
    image: string
    imageAlt: string
  }
}

function defaultsFromSlug(slug: string): ServicePageAdmin {
  const base = SERVICE_DETAIL_BY_SLUG[slug]
  return {
    enabled: true,
    menuTitle: base?.hero.title ?? '',
    showInHeader: true,
    showInFooter: false,
    sortOrder: 0,
    seoTitle: base ? `${base.hero.title} | Woontegra` : '',
    seoDescription: base?.hero.description ?? '',
    hero: {
      eyebrow: base?.hero.eyebrow ?? '',
      title: base?.hero.title ?? '',
      description: base?.hero.description ?? '',
      image: base?.hero.image ?? '',
      imageAlt: base?.hero.imageAlt ?? '',
    },
  }
}

export function AdminServiceEditPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const catalog = getServiceBySlug(slug)
  const [form, setForm] = useState<ServicePageAdmin>(() => defaultsFromSlug(slug))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!slug || !catalog) return
    setLoading(true)
    void pageContentService
      .getRawByKey(SERVICE_PAGE_CONTENT_KEY)
      .then((raw) => {
        const pages = normalizeServicePages(raw)
        const partial = pages[slug]
        const defaults = defaultsFromSlug(slug)
        if (!partial) {
          setForm(defaults)
          return
        }
        const partialAdmin = partial as Partial<ServicePageAdmin>
        setForm({
          enabled: partial.enabled !== false,
          menuTitle: partialAdmin.menuTitle?.trim() || defaults.menuTitle,
          showInHeader: partialAdmin.showInHeader !== false,
          showInFooter: Boolean(partialAdmin.showInFooter),
          sortOrder: partialAdmin.sortOrder ?? 0,
          seoTitle: partialAdmin.seoTitle?.trim() || defaults.seoTitle,
          seoDescription: partialAdmin.seoDescription?.trim() || defaults.seoDescription,
          hero: {
            ...defaults.hero,
            ...(partial.hero ?? {}),
          },
        })
      })
      .catch(() => setForm(defaultsFromSlug(slug)))
      .finally(() => setLoading(false))
  }, [slug, catalog])

  if (!catalog) {
    return (
      <div className="space-y-4">
        <PageHeader title="Hizmet bulunamadı" />
        <Link to="/admin/hizmetler" className="text-sm text-brand-700 hover:underline">
          Hizmet listesine dön
        </Link>
      </div>
    )
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const raw = (await pageContentService.getRawByKey(SERVICE_PAGE_CONTENT_KEY)) ?? {}
      const pages = normalizeServicePages(raw)
      const next = {
        ...raw,
        pages: {
          ...pages,
          [slug]: form,
        },
      }
      await pageContentService.updateByKey(SERVICE_PAGE_CONTENT_KEY, next as Record<string, unknown>)
      setSuccess('Hizmet kaydedildi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kaydedilemedi'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Hizmet yükleniyor…" />

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hizmet: ${catalog.title}`}
        description={`/${slug} — hero, SEO ve yayın ayarları`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/hizmetler" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Listeye dön
            </Link>
            <a
              href={catalog.path}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Public önizleme
            </a>
          </div>
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Card>
        <CardBody className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Menü başlığı" value={form.menuTitle} onChange={(e) => setForm((f) => ({ ...f, menuTitle: e.target.value }))} />
            <Input label="Slug (salt okunur)" value={slug} readOnly disabled />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Hero eyebrow" value={form.hero.eyebrow} onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, eyebrow: e.target.value } }))} />
            <Input label="Hero başlık" value={form.hero.title} onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, title: e.target.value } }))} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Kısa açıklama</label>
            <textarea
              className="min-h-[96px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.hero.description}
              onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, description: e.target.value } }))}
            />
          </div>

          <ManagedImageField
            label="Hero görseli"
            value={form.hero.image}
            onChange={(url) => setForm((f) => ({ ...f, hero: { ...f.hero, image: url } }))}
          />

          <Input
            label="Hero görsel alt metni"
            value={form.hero.imageAlt}
            onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, imageAlt: e.target.value } }))}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="SEO başlık" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            <Input
              label="Sıralama"
              type="number"
              value={String(form.sortOrder)}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">SEO açıklama</label>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
              Aktif
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.showInHeader} onChange={(e) => setForm((f) => ({ ...f, showInHeader: e.target.checked }))} />
              Header dropdown&apos;da göster
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.showInFooter} onChange={(e) => setForm((f) => ({ ...f, showInFooter: e.target.checked }))} />
              Footer&apos;da göster
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/hizmetler')}>
              Vazgeç
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
