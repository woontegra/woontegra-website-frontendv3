import { useEffect, useState } from 'react'
import { adminBlogService } from '@/services/api/adminBlog'
import { adminProductsService } from '@/services/api/adminProducts'
import { cmsPagesService } from '@/services/api/cmsPages'
import { productCategoriesService } from '@/services/api/productCategories'
import {
  blogPostPublicPath,
  categoryPublicPath,
  cmsPagePublicPath,
  productPublicPath,
  servicePublicPath,
  solutionPublicPath,
} from '@/lib/menuSourceUrls'
import { SITE_PAGE_DEFINITIONS } from '@/data/sitePages'
import { SERVICE_CATALOG } from '@/data/serviceCatalog'
import { SOLUTION_CATALOG } from '@/data/solutionCatalog'

export type LinkTargetKind =
  | 'home'
  | 'blog-list'
  | 'site-page'
  | 'service-list'
  | 'service'
  | 'solution-list'
  | 'software-list'
  | 'solution'
  | 'cms-page'
  | 'product'
  | 'category'
  | 'blog-post'
  | 'custom-url'
  | 'external-url'
  | 'cookie-preferences'

export type LinkTargetValue = {
  kind: LinkTargetKind
  sitePageKey?: string
  serviceSlug?: string
  solutionSlug?: string
  cmsPageId?: string
  productId?: string
  categoryId?: string
  blogPostSlug?: string
  url?: string
}

type Option = { value: string; label: string; meta?: string }

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function resolveLinkTargetHref(value: LinkTargetValue): { href?: string; action?: 'cookie-preferences' } {
  switch (value.kind) {
    case 'home':
      return { href: '/' }
    case 'blog-list':
      return { href: '/blog' }
    case 'service-list':
      return { href: '/hizmetler' }
    case 'solution-list':
      return { href: '/cozumler' }
    case 'software-list':
      return { href: '/yazilimlar' }
    case 'service':
      return { href: value.serviceSlug ? servicePublicPath(value.serviceSlug) : '/hizmetler' }
    case 'solution':
      return { href: value.solutionSlug ? solutionPublicPath(value.solutionSlug) : '/cozumler' }
    case 'cookie-preferences':
      return { action: 'cookie-preferences' }
    case 'site-page': {
      const page = SITE_PAGE_DEFINITIONS.find((p) => p.key === value.sitePageKey)
      return { href: page?.path ?? '/' }
    }
    case 'cms-page':
      return { href: value.url?.trim() || '/' }
    case 'product':
      return { href: value.url?.trim() || '/' }
    case 'category':
      return { href: value.url?.trim() || '/' }
    case 'blog-post':
      return { href: value.blogPostSlug ? blogPostPublicPath(value.blogPostSlug) : '/blog' }
    case 'external-url':
    case 'custom-url':
      return { href: value.url?.trim() || '/' }
    default:
      return { href: '/' }
  }
}

export function hrefToLinkTarget(href?: string, action?: 'cookie-preferences'): LinkTargetValue {
  if (action === 'cookie-preferences') return { kind: 'cookie-preferences' }
  const url = href?.trim() || '/'
  if (url === '/') return { kind: 'home', url: '/' }
  if (url === '/blog') return { kind: 'blog-list', url: '/blog' }
  if (url === '/hizmetler') return { kind: 'service-list', url: '/hizmetler' }
  if (url === '/cozumler') return { kind: 'solution-list', url: '/cozumler' }
  if (url === '/yazilimlar') return { kind: 'software-list', url: '/yazilimlar' }
  const service = SERVICE_CATALOG.find((s) => s.path === url)
  if (service) return { kind: 'service', serviceSlug: service.slug, url }
  const solution = SOLUTION_CATALOG.find((s) => `/cozumler/${s.slug}` === url)
  if (solution) return { kind: 'solution', solutionSlug: solution.slug, url }
  const sitePage = SITE_PAGE_DEFINITIONS.find((p) => p.path === url)
  if (sitePage) return { kind: 'site-page', sitePageKey: sitePage.key, url }
  if (/^https?:\/\//i.test(url)) return { kind: 'external-url', url }
  if (url.startsWith('/blog/')) return { kind: 'blog-post', blogPostSlug: url.replace(/^\/blog\//, ''), url }
  return { kind: 'custom-url', url }
}

type LinkTargetSelectorProps = {
  value: LinkTargetValue
  onChange: (value: LinkTargetValue) => void
  allowCookiePreferences?: boolean
}

export function LinkTargetSelector({ value, onChange, allowCookiePreferences = false }: LinkTargetSelectorProps) {
  const [products, setProducts] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [cmsPages, setCmsPages] = useState<Option[]>([])
  const [blogPosts, setBlogPosts] = useState<Option[]>([])

  useEffect(() => {
    void Promise.all([
      adminProductsService.list({ isActive: 'all' }).then((rows) =>
        setProducts(rows.map((p) => ({ value: p.id, label: p.name, meta: productPublicPath(p.slug) }))),
      ),
      productCategoriesService.list().then((rows) =>
        setCategories(rows.map((c) => ({ value: c.id, label: c.name, meta: categoryPublicPath(c.slug) }))),
      ),
      cmsPagesService.list().then((rows) =>
        setCmsPages(rows.map((p) => ({ value: p.id, label: p.title, meta: cmsPagePublicPath(p.slug) }))),
      ),
      adminBlogService.list().then((rows) =>
        setBlogPosts(rows.map((p) => ({ value: p.slug, label: p.title, meta: blogPostPublicPath(p.slug) }))),
      ),
    ]).catch(() => undefined)
  }, [])

  const kinds: Array<{ id: LinkTargetKind; label: string }> = [
    { id: 'home', label: 'Ana sayfa' },
    { id: 'blog-list', label: 'Blog listesi' },
    { id: 'service-list', label: 'Hizmet listesi' },
    { id: 'service', label: 'Hizmet' },
    { id: 'solution-list', label: 'Çözüm listesi' },
    { id: 'software-list', label: 'Yazılım listesi' },
    { id: 'solution', label: 'Çözüm' },
    { id: 'site-page', label: 'Site sayfası' },
    { id: 'product', label: 'Ürün' },
    { id: 'category', label: 'Ürün kategorisi' },
    { id: 'blog-post', label: 'Blog yazısı' },
    { id: 'cms-page', label: 'CMS sayfa' },
    { id: 'custom-url', label: 'Özel URL' },
    { id: 'external-url', label: 'Dış bağlantı' },
    ...(allowCookiePreferences ? [{ id: 'cookie-preferences' as const, label: 'Çerez Tercihleri Aksiyonu' }] : []),
  ]

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Hedef türü</label>
        <select
          className={fieldClass}
          value={value.kind}
          onChange={(e) => onChange({ kind: e.target.value as LinkTargetKind })}
        >
          {kinds.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      {value.kind === 'home' || value.kind === 'blog-list' || value.kind === 'service-list' || value.kind === 'solution-list' || value.kind === 'software-list' ? (
        <p className="text-xs text-slate-500">
          Hedef:{' '}
          {value.kind === 'home'
            ? '/'
            : value.kind === 'blog-list'
              ? '/blog'
              : value.kind === 'service-list'
                ? '/hizmetler'
                : value.kind === 'software-list'
                  ? '/yazilimlar'
                  : '/cozumler'}
        </p>
      ) : null}

      {value.kind === 'service' ? (
        <select
          className={fieldClass}
          value={value.serviceSlug ?? ''}
          onChange={(e) => {
            const slug = e.target.value
            onChange({ ...value, serviceSlug: slug, url: slug ? `/hizmetler/${slug}` : '/hizmetler' })
          }}
        >
          <option value="">Hizmet seçin</option>
          {SERVICE_CATALOG.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title} ({s.path})
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'solution' ? (
        <select
          className={fieldClass}
          value={value.solutionSlug ?? ''}
          onChange={(e) => {
            const slug = e.target.value
            onChange({ ...value, solutionSlug: slug, url: slug ? `/cozumler/${slug}` : '/cozumler' })
          }}
        >
          <option value="">Çözüm seçin</option>
          {SOLUTION_CATALOG.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title} (/cozumler/{s.slug})
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'site-page' ? (
        <select
          className={fieldClass}
          value={value.sitePageKey ?? ''}
          onChange={(e) => {
            const page = SITE_PAGE_DEFINITIONS.find((p) => p.key === e.target.value)
            onChange({ ...value, sitePageKey: e.target.value, url: page?.path })
          }}
        >
          <option value="">Sayfa seçin</option>
          {SITE_PAGE_DEFINITIONS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.title} ({p.path})
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'product' ? (
        <select
          className={fieldClass}
          value={value.productId ?? ''}
          onChange={(e) => {
            const opt = products.find((p) => p.value === e.target.value)
            onChange({ ...value, productId: e.target.value, url: opt?.meta })
          }}
        >
          <option value="">Ürün seçin</option>
          {products.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'category' ? (
        <select
          className={fieldClass}
          value={value.categoryId ?? ''}
          onChange={(e) => {
            const opt = categories.find((c) => c.value === e.target.value)
            onChange({ ...value, categoryId: e.target.value, url: opt?.meta ?? '/' })
          }}
        >
          <option value="">Kategori seçin</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'blog-post' ? (
        <select
          className={fieldClass}
          value={value.blogPostSlug ?? ''}
          onChange={(e) => onChange({ ...value, blogPostSlug: e.target.value, url: `/blog/${e.target.value}` })}
        >
          <option value="">Blog yazısı seçin</option>
          {blogPosts.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'cms-page' ? (
        <select
          className={fieldClass}
          value={value.cmsPageId ?? ''}
          onChange={(e) => {
            const opt = cmsPages.find((p) => p.value === e.target.value)
            onChange({ ...value, cmsPageId: e.target.value, url: opt?.meta ?? '/' })
          }}
        >
          <option value="">CMS sayfa seçin</option>
          {cmsPages.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label} ({p.meta})
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'custom-url' || value.kind === 'external-url' ? (
        <input
          className={fieldClass}
          value={value.url ?? ''}
          placeholder={value.kind === 'external-url' ? 'https://...' : '/yol'}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
        />
      ) : null}

      {value.kind === 'cookie-preferences' ? (
        <p className="text-xs text-slate-500">
          Çerez Tercihleri Aksiyonu: footer tıklamasında çerez tercihleri modalı açılır; route değişmez.
        </p>
      ) : null}
    </div>
  )
}
