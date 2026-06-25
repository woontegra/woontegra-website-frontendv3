import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { siteSettingsService } from '@/services/api/siteSettings'
import { adminProductsService } from '@/services/api/adminProducts'
import { adminBlogService } from '@/services/api/adminBlog'
import { pageContentService } from '@/services/api/pageContent'
import { getErrorMessage } from '@/services/api/client'
import { DEFAULT_ADMIN_SITE_SETTINGS, type AdminSiteSettings } from '@/types/siteSettings'
import { LEGAL_PAGE_DEFINITIONS } from '@/types/legalPageContent'
import { cn } from '@/utils/cn'

type TabId = 'general' | 'products' | 'blog' | 'pages'

export function AdminSeoPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<TabId>('general')
  const [form, setForm] = useState<AdminSiteSettings>(DEFAULT_ADMIN_SITE_SETTINGS)
  const [keywordInput, setKeywordInput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const settingsQuery = useQuery({
    queryKey: ['admin', 'siteSettings'],
    queryFn: () => siteSettingsService.getAdmin(),
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'seo-audit'],
    queryFn: () => adminProductsService.list(),
    enabled: tab === 'products',
  })

  const blogQuery = useQuery({
    queryKey: ['admin', 'blog', 'seo-audit'],
    queryFn: () => adminBlogService.list(),
    enabled: tab === 'blog',
  })

  const legalSeoQuery = useQuery({
    queryKey: ['admin', 'legal-seo-audit'],
    queryFn: async () => {
      const rows = await Promise.all(
        LEGAL_PAGE_DEFINITIONS.map(async (def) => {
          const raw = await pageContentService.getLegalPage(def.key, def.defaults)
          return { def, raw }
        }),
      )
      return rows
    },
    enabled: tab === 'pages',
  })

  useEffect(() => {
    if (settingsQuery.data) setForm(settingsQuery.data)
  }, [settingsQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const { logoUpdatedAt: _, ...payload } = form
      return siteSettingsService.update({
        defaultTitle: payload.defaultTitle,
        defaultDescription: payload.defaultDescription,
        defaultKeywords: payload.defaultKeywords,
      })
    },
    onSuccess: (next) => {
      setForm(next)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'siteSettings'] })
      setMessage({ type: 'success', text: 'Genel SEO kaydedildi.' })
    },
    onError: (err) => {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Kayıt başarısız') })
    },
  })

  const productGaps = useMemo(() => {
    return (productsQuery.data ?? []).filter((p) => !p.seoTitle?.trim() || !p.seoDescription?.trim())
  }, [productsQuery.data])

  const tabs: { id: TabId; label: string }[] = [
    { id: 'general', label: 'Genel SEO' },
    { id: 'products', label: 'Ürün SEO' },
    { id: 'blog', label: 'Blog SEO' },
    { id: 'pages', label: 'Yasal / sayfa SEO' },
  ]

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="SEO yönetimi"
        description="Site ayarları, ürün ve içerik SEO denetimi."
        actions={
          tab === 'general' ? (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className={cn('text-sm', message.type === 'success' ? 'text-emerald-700' : 'text-red-600')}>{message.text}</p>
      ) : null}

      {tab === 'general' ? (
        settingsQuery.isLoading ? (
          <LoadingState label="SEO ayarları yükleniyor…" />
        ) : (
          <Card>
            <CardBody className="space-y-4">
              <p className="text-xs text-slate-500">PATCH /api/settings — defaultTitle, defaultDescription, defaultKeywords</p>
              <Input
                label="Varsayılan başlık (defaultTitle)"
                value={form.defaultTitle}
                onChange={(e) => setForm((p) => ({ ...p, defaultTitle: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Varsayılan açıklama</label>
                <textarea
                  rows={3}
                  value={form.defaultDescription}
                  onChange={(e) => setForm((p) => ({ ...p, defaultDescription: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Anahtar kelimeler</label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Kelime ekle"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const k = keywordInput.trim()
                      if (!k || form.defaultKeywords.includes(k)) return
                      setForm((p) => ({ ...p, defaultKeywords: [...p.defaultKeywords, k] }))
                      setKeywordInput('')
                    }}
                  >
                    Ekle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.defaultKeywords.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700"
                      onClick={() => setForm((p) => ({ ...p, defaultKeywords: p.defaultKeywords.filter((x) => x !== k) }))}
                    >
                      {k} ×
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )
      ) : null}

      {tab === 'products' ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Eksik ürün SEO alanları</h2>
              <p className="text-xs text-slate-500">seoTitle veya seoDescription boş olan ürünler</p>
            </div>
            {productsQuery.isLoading ? <LoadingState label="Ürünler…" className="p-4" /> : null}
            <Table>
              <THead>
                <TR>
                  <TH>Ürün</TH>
                  <TH>seoTitle</TH>
                  <TH>seoDescription</TH>
                  <TH> </TH>
                </TR>
              </THead>
              <TBody>
                {productGaps.length === 0 ? (
                  <TR>
                    <TD colSpan={4}>Tüm ürünlerde SEO alanları dolu veya ürün yok.</TD>
                  </TR>
                ) : (
                  productGaps.map((p) => (
                    <TR key={p.id}>
                      <TD className="font-medium">{p.name}</TD>
                      <TD>{p.seoTitle?.trim() ? '✓' : '—'}</TD>
                      <TD>{p.seoDescription?.trim() ? '✓' : '—'}</TD>
                      <TD>
                        <Link to={`/admin/urunler/${p.id}/duzenle`} className="text-sm text-brand-700 hover:underline">
                          Düzenle
                        </Link>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'blog' ? (
        <Card>
          <CardBody className="space-y-4">
            <p className="text-sm text-amber-900">
              Blog modelinde ayrı seoTitle/seoDescription alanı yok. Public sitede{' '}
              <code className="rounded bg-amber-100 px-1">title</code> ve{' '}
              <code className="rounded bg-amber-100 px-1">excerpt</code> meta için kullanılır.
            </p>
            {blogQuery.isLoading ? <LoadingState label="Blog yazıları…" /> : null}
            {blogQuery.data && blogQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Başlık</TH>
                      <TH>Özet (excerpt)</TH>
                      <TH> </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {blogQuery.data.map((post) => (
                      <TR key={post.id}>
                        <TD className="font-medium">{post.title}</TD>
                        <TD className="max-w-xs truncate text-slate-600">{post.excerpt?.trim() || '—'}</TD>
                        <TD>
                          <Link
                            to={`/admin/blog/${post.id}/duzenle`}
                            className="text-sm text-brand-700 hover:underline"
                          >
                            Düzenle
                          </Link>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'pages' ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Yasal sayfa SEO (page-content)</h2>
              <p className="text-xs text-slate-500">GET /api/page-content/:key — İçerikler ekranından düzenlenir</p>
            </div>
            {legalSeoQuery.isLoading ? <LoadingState label="Sayfa içerikleri…" className="p-4" /> : null}
            <Table>
              <THead>
                <TR>
                  <TH>Sayfa</TH>
                  <TH>seoTitle</TH>
                  <TH>seoDescription</TH>
                  <TH> </TH>
                </TR>
              </THead>
              <TBody>
                {(legalSeoQuery.data ?? []).map(({ def, raw }) => {
                  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
                  const seoTitle = String(o.seoTitle ?? '')
                  const seoDescription = String(o.seoDescription ?? '')
                  return (
                    <TR key={def.key}>
                      <TD className="font-medium">{def.label}</TD>
                      <TD>{seoTitle.trim() ? '✓' : '—'}</TD>
                      <TD>{seoDescription.trim() ? '✓' : '—'}</TD>
                      <TD>
                        <Link to="/admin/icerikler" className="text-sm text-brand-700 hover:underline">
                          İçerikler
                        </Link>
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
