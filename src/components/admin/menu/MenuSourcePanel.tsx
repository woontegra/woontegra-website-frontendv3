import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { MenuAccordionSection } from '@/components/admin/menu/MenuAccordionSection'
import type { MenuSourceRow } from '@/components/admin/menu/menuTypes'
import { adminBlogService } from '@/services/api/adminBlog'
import { adminProductsService } from '@/services/api/adminProducts'
import { cmsPagesService } from '@/services/api/cmsPages'
import { productCategoriesService } from '@/services/api/productCategories'
import { SERVICE_CATALOG } from '@/data/serviceCatalog'
import { SITE_PAGE_DEFINITIONS } from '@/data/sitePages'
import { SOLUTION_CATALOG } from '@/data/solutionCatalog'
import type { LinkTargetValue } from '@/components/admin/LinkTargetSelector'
import {
  blogPostPublicPath,
  categoryPublicPath,
  cmsPagePublicPath,
  productPublicPath,
  servicePublicPath,
  solutionPublicPath,
} from '@/lib/menuSourceUrls'

type Props = {
  adding: boolean
  onAddBatch: (entries: { label: string; target: LinkTargetValue; openInNewTab?: boolean }[]) => Promise<void>
}

export function MenuSourcePanel({ adding, onAddBatch }: Props) {
  const [pages, setPages] = useState<MenuSourceRow[]>([])
  const [products, setProducts] = useState<MenuSourceRow[]>([])
  const [blogPosts, setBlogPosts] = useState<MenuSourceRow[]>([])
  const [customLabel, setCustomLabel] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customExternal, setCustomExternal] = useState(false)
  const [customBlank, setCustomBlank] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)

  const { data: categoryRows = [] } = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: () => productCategoriesService.list(),
    select: (rows) =>
      rows
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'))
        .map((c) => ({
          id: c.id,
          label: c.name,
          path: categoryPublicPath(c.slug),
          target: { kind: 'category' as const, categoryId: c.id, url: categoryPublicPath(c.slug) },
        })),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    void Promise.all([
      cmsPagesService.list().then((rows) => {
        const cms = rows.map((p) => ({
          id: `cms-${p.id}`,
          label: p.title,
          path: cmsPagePublicPath(p.slug),
          target: { kind: 'cms-page' as const, cmsPageId: p.id, url: cmsPagePublicPath(p.slug) },
        }))
        const staticPages = SITE_PAGE_DEFINITIONS.map((p) => ({
          id: `site-${p.key}`,
          label: p.title,
          path: p.path,
          target: { kind: 'site-page' as const, sitePageKey: p.key, url: p.path },
        }))
        setPages([
          { id: 'home', label: 'Ana sayfa', path: '/', target: { kind: 'home', url: '/' } },
          ...staticPages,
          ...cms,
        ])
      }),
      adminProductsService.list({ isActive: 'true' }).then((rows) =>
        setProducts(
          rows
            .filter((p) => p.isActive)
            .map((p) => ({
            id: p.id,
            label: p.name,
            path: productPublicPath(p.slug),
            target: { kind: 'product', productId: p.id, url: productPublicPath(p.slug) },
          })),
        ),
      ),
      adminBlogService.list().then((rows) =>
        setBlogPosts(
          rows.map((p) => ({
            id: p.slug,
            label: p.title,
            path: blogPostPublicPath(p.slug),
            target: { kind: 'blog-post', blogPostSlug: p.slug, url: blogPostPublicPath(p.slug) },
          })),
        ),
      ),
    ]).catch(() => undefined)
  }, [])

  const serviceRows = useMemo<MenuSourceRow[]>(
    () => [
      { id: 'svc-list', label: 'Hizmetler (liste)', path: '/hizmetler', target: { kind: 'service-list', url: '/hizmetler' } },
      ...SERVICE_CATALOG.map((s) => ({
        id: `svc-${s.slug}`,
        label: s.title,
        path: servicePublicPath(s.slug),
        target: { kind: 'service' as const, serviceSlug: s.slug, url: servicePublicPath(s.slug) },
      })),
    ],
    [],
  )

  const solutionRows = useMemo<MenuSourceRow[]>(
    () => [
      { id: 'sol-list', label: 'Çözümler (liste)', path: '/cozumler', target: { kind: 'solution-list', url: '/cozumler' } },
      ...SOLUTION_CATALOG.map((s) => ({
        id: `sol-${s.slug}`,
        label: s.title,
        path: solutionPublicPath(s.slug),
        target: { kind: 'solution' as const, solutionSlug: s.slug, url: solutionPublicPath(s.slug) },
      })),
    ],
    [],
  )

  const blogRows = useMemo<MenuSourceRow[]>(
    () => [
      { id: 'blog-list', label: 'Blog (liste)', path: '/blog', target: { kind: 'blog-list', url: '/blog' } },
      ...blogPosts,
    ],
    [blogPosts],
  )

  const addRows = async (rows: MenuSourceRow[]) => {
    await onAddBatch(rows.map((r) => ({ label: r.label, target: r.target })))
  }

  const submitCustom = async () => {
    const label = customLabel.trim()
    const url = customUrl.trim()
    if (!label || !url) return
    const target: LinkTargetValue = customExternal ? { kind: 'external-url', url } : { kind: 'custom-url', url }
    await onAddBatch([{ label, target, openInNewTab: customBlank || customExternal }])
    setCustomLabel('')
    setCustomUrl('')
    setCustomExternal(false)
    setCustomBlank(false)
  }

  return (
    <Card className="h-full border-slate-300">
      <CardBody className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Menü öğeleri ekle</h2>
          <p className="mt-1 text-xs text-slate-500">
            WordPress gibi: öğeleri seçin, &quot;Menüye ekle&quot; deyin. Alt menü ilişkisini sağdaki menü yapısından
            ayarlayın.
          </p>
        </div>

        <div className="space-y-2">
          <MenuAccordionSection
            title="Sayfalar"
            rows={pages}
            emptyText="Henüz sayfa yok."
            adding={adding}
            defaultOpen
            onAddSelected={addRows}
          />
          <MenuAccordionSection
            title="Blog"
            rows={blogRows}
            emptyText="Henüz blog yazısı yok."
            adding={adding}
            onAddSelected={addRows}
          />

          <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
              onClick={() => setCustomOpen((v) => !v)}
            >
              <span>Özel bağlantılar</span>
              <span className="text-xs font-normal text-slate-500">{customOpen ? '▾' : '▸'}</span>
            </button>
            {customOpen ? (
              <div className="space-y-3 border-t border-slate-200 p-3">
                <Input
                  label="URL"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={customExternal ? 'https://…' : '/yol veya https://…'}
                />
                <Input
                  label="Bağlantı metni"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={customExternal} onChange={(e) => setCustomExternal(e.target.checked)} />
                  Dış bağlantı (https)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={customBlank} onChange={(e) => setCustomBlank(e.target.checked)} />
                  Yeni sekmede aç
                </label>
                <Button
                  type="button"
                  size="sm"
                  disabled={adding || !customLabel.trim() || !customUrl.trim()}
                  onClick={() => void submitCustom()}
                >
                  Menüye ekle
                </Button>
              </div>
            ) : null}
          </div>

          <MenuAccordionSection
            title="Kategoriler"
            rows={categoryRows}
            emptyText="Henüz kategori yok. Kategoriler ekranından oluşturun."
            adding={adding}
            onAddSelected={addRows}
          />
          <MenuAccordionSection
            title="Ürünler"
            rows={products}
            emptyText="Henüz ürün yok."
            adding={adding}
            onAddSelected={addRows}
          />
          <MenuAccordionSection
            title="Hizmetler"
            rows={serviceRows}
            emptyText="Hizmet kataloğu boş."
            adding={adding}
            onAddSelected={addRows}
          />
          <MenuAccordionSection
            title="Çözümler"
            rows={solutionRows}
            emptyText="Çözüm kataloğu boş."
            adding={adding}
            onAddSelected={addRows}
          />
        </div>
      </CardBody>
    </Card>
  )
}
