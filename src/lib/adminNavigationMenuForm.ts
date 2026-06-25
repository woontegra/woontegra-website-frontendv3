import { SERVICE_CATALOG } from '@/data/serviceCatalog'
import { SITE_PAGE_DEFINITIONS } from '@/data/sitePages'
import { SOLUTION_CATALOG } from '@/data/solutionCatalog'
import type { LinkTargetValue } from '@/components/admin/LinkTargetSelector'
import { resolveLinkTargetHref } from '@/components/admin/LinkTargetSelector'
import type { AdminNavigationMenuInput, AdminNavigationMenuItem, NavigationMenuItemType } from '@/types/navigationMenu'

export type UiMenuKind =
  | NavigationMenuItemType
  | 'SITE_PAGE'
  | 'BLOG_POST'
  | 'BLOG_LIST'
  | 'HOME'
  | 'EXTERNAL_URL'
  | 'SERVICE_LIST'
  | 'SERVICE'
  | 'SOLUTION_LIST'
  | 'SOFTWARE_LIST'
  | 'SOLUTION'

export const UI_MENU_KIND_LABELS: Record<UiMenuKind, string> = {
  HOME: 'Ana sayfa',
  BLOG_LIST: 'Blog',
  BLOG_POST: 'Blog yazısı',
  SERVICE_LIST: 'Hizmet listesi',
  SERVICE: 'Hizmet',
  SOLUTION_LIST: 'Çözüm listesi',
  SOFTWARE_LIST: 'Yazılım listesi',
  SOLUTION: 'Çözüm',
  SITE_PAGE: 'Sayfa',
  EXTERNAL_URL: 'Dış bağlantı',
  CUSTOM_URL: 'Özel bağlantı',
  PRODUCT: 'Ürün',
  CATEGORY: 'Ürün kategorisi',
  PAGE: 'Özel sayfa (CMS)',
}

export function uiKindFromRow(row: AdminNavigationMenuItem): UiMenuKind {
  if (row.type === 'CUSTOM_URL') {
    const url = (row.url ?? '').trim()
    if (url === '/') return 'HOME'
    if (url === '/blog') return 'BLOG_LIST'
    if (url === '/hizmetler') return 'SERVICE_LIST'
    if (url === '/cozumler') return 'SOLUTION_LIST'
    if (url === '/yazilimlar') return 'SOFTWARE_LIST'
    if (/^https?:\/\//i.test(url)) return 'EXTERNAL_URL'
    if (SERVICE_CATALOG.some((s) => s.path === url)) return 'SERVICE'
    if (SOLUTION_CATALOG.some((s) => `/cozumler/${s.slug}` === url)) return 'SOLUTION'
    if (SITE_PAGE_DEFINITIONS.some((p) => p.path === url)) return 'SITE_PAGE'
    if (url.startsWith('/blog/')) return 'BLOG_POST'
  }
  return row.type
}

export function buildPayload(form: AdminNavigationMenuInput, uiKind: UiMenuKind): AdminNavigationMenuInput {
  if (
    uiKind === 'HOME' ||
    uiKind === 'BLOG_LIST' ||
    uiKind === 'SITE_PAGE' ||
    uiKind === 'BLOG_POST' ||
    uiKind === 'EXTERNAL_URL' ||
    uiKind === 'SERVICE_LIST' ||
    uiKind === 'SERVICE' ||
    uiKind === 'SOLUTION_LIST' ||
    uiKind === 'SOFTWARE_LIST' ||
    uiKind === 'SOLUTION'
  ) {
    return {
      ...form,
      type: 'CUSTOM_URL',
      url: (form.url ?? '').trim(),
      productId: null,
      categoryId: null,
      pageId: null,
    }
  }
  return {
    ...form,
    url: form.type === 'CUSTOM_URL' ? (form.url ?? '').trim() : null,
    productId: form.type === 'PRODUCT' ? form.productId : null,
    categoryId: form.type === 'CATEGORY' ? form.categoryId : null,
    pageId: form.type === 'PAGE' ? form.pageId : null,
  }
}

export function validateForm(form: AdminNavigationMenuInput, uiKind: UiMenuKind): string | null {
  if (!form.label.trim()) return 'Menü başlığı gerekli'
  if (uiKind === 'HOME' || uiKind === 'BLOG_LIST' || uiKind === 'SERVICE_LIST' || uiKind === 'SOLUTION_LIST' || uiKind === 'SOFTWARE_LIST') {
    return null
  }
  if (uiKind === 'SITE_PAGE' && !(form.url ?? '').trim()) return 'Sayfa seçin'
  if (uiKind === 'BLOG_POST' && !(form.url ?? '').trim()) return 'Blog yazısı seçin'
  if (uiKind === 'EXTERNAL_URL') {
    const u = (form.url ?? '').trim()
    if (!/^https?:\/\//i.test(u)) return 'Dış bağlantı https:// ile başlamalı'
  }
  if (form.type === 'CUSTOM_URL' && uiKind === 'CUSTOM_URL') {
    const u = (form.url ?? '').trim()
    if (!u) return 'Bağlantı adresi gerekli'
    if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) return 'Adres / veya https:// ile başlamalı'
  }
  if (form.type === 'PRODUCT' && !form.productId) return 'Ürün seçin'
  if (form.type === 'CATEGORY' && !form.categoryId) return 'Kategori seçin'
  if (form.type === 'PAGE' && !form.pageId) return 'Sayfa seçin'
  return null
}

export function linkTargetFromRow(row: AdminNavigationMenuItem, kind: UiMenuKind): LinkTargetValue {
  if (kind === 'HOME') return { kind: 'home', url: '/' }
  if (kind === 'BLOG_LIST') return { kind: 'blog-list', url: '/blog' }
  if (kind === 'SERVICE_LIST') return { kind: 'service-list', url: '/hizmetler' }
  if (kind === 'SOLUTION_LIST') return { kind: 'solution-list', url: '/cozumler' }
  if (kind === 'SOFTWARE_LIST') return { kind: 'software-list', url: '/yazilimlar' }
  if (kind === 'SERVICE') {
    const service = SERVICE_CATALOG.find((s) => s.path === row.url)
    return { kind: 'service', serviceSlug: service?.slug, url: row.url ?? '/hizmetler' }
  }
  if (kind === 'SOLUTION') {
    const solution = SOLUTION_CATALOG.find((s) => `/cozumler/${s.slug}` === row.url)
    return { kind: 'solution', solutionSlug: solution?.slug, url: row.url ?? '/cozumler' }
  }
  if (kind === 'SITE_PAGE') {
    const page = SITE_PAGE_DEFINITIONS.find((p) => p.path === row.url)
    return { kind: 'site-page', sitePageKey: page?.key, url: row.url ?? '/' }
  }
  if (kind === 'BLOG_POST') {
    return { kind: 'blog-post', blogPostSlug: (row.url ?? '').replace(/^\/blog\//, ''), url: row.url ?? '' }
  }
  if (kind === 'EXTERNAL_URL') return { kind: 'external-url', url: row.url ?? '' }
  if (row.type === 'PRODUCT') return { kind: 'product', productId: row.productId ?? undefined, url: row.resolvedUrl }
  if (row.type === 'CATEGORY') return { kind: 'category', categoryId: row.categoryId ?? undefined, url: row.resolvedUrl }
  if (row.type === 'PAGE') return { kind: 'cms-page', cmsPageId: row.pageId ?? undefined, url: row.resolvedUrl }
  return { kind: 'custom-url', url: row.url ?? '/' }
}

export function applyLinkTarget(target: LinkTargetValue): {
  uiKind: UiMenuKind
  patch: Partial<AdminNavigationMenuInput>
} {
  const resolved = resolveLinkTargetHref(target)
  if (target.kind === 'home') {
    return { uiKind: 'HOME', patch: { type: 'CUSTOM_URL', url: '/', productId: null, categoryId: null, pageId: null } }
  }
  if (target.kind === 'blog-list') {
    return { uiKind: 'BLOG_LIST', patch: { type: 'CUSTOM_URL', url: '/blog', productId: null, categoryId: null, pageId: null } }
  }
  if (target.kind === 'service-list') {
    return { uiKind: 'SERVICE_LIST', patch: { type: 'CUSTOM_URL', url: '/hizmetler', productId: null, categoryId: null, pageId: null } }
  }
  if (target.kind === 'solution-list') {
    return { uiKind: 'SOLUTION_LIST', patch: { type: 'CUSTOM_URL', url: '/cozumler', productId: null, categoryId: null, pageId: null } }
  }
  if (target.kind === 'software-list') {
    return { uiKind: 'SOFTWARE_LIST', patch: { type: 'CUSTOM_URL', url: '/yazilimlar', productId: null, categoryId: null, pageId: null } }
  }
  if (target.kind === 'service') {
    return {
      uiKind: 'SERVICE',
      patch: { type: 'CUSTOM_URL', url: resolved.href ?? '/hizmetler', productId: null, categoryId: null, pageId: null },
    }
  }
  if (target.kind === 'solution') {
    return {
      uiKind: 'SOLUTION',
      patch: { type: 'CUSTOM_URL', url: resolved.href ?? '/cozumler', productId: null, categoryId: null, pageId: null },
    }
  }
  if (target.kind === 'site-page') {
    return {
      uiKind: 'SITE_PAGE',
      patch: { type: 'CUSTOM_URL', url: resolved.href ?? '/', productId: null, categoryId: null, pageId: null },
    }
  }
  if (target.kind === 'blog-post') {
    return {
      uiKind: 'BLOG_POST',
      patch: { type: 'CUSTOM_URL', url: resolved.href ?? '/blog', productId: null, categoryId: null, pageId: null },
    }
  }
  if (target.kind === 'external-url') {
    return {
      uiKind: 'EXTERNAL_URL',
      patch: { type: 'CUSTOM_URL', url: resolved.href ?? '', productId: null, categoryId: null, pageId: null },
    }
  }
  if (target.kind === 'product') {
    return { uiKind: 'PRODUCT', patch: { type: 'PRODUCT', productId: target.productId ?? null, url: resolved.href } }
  }
  if (target.kind === 'category') {
    return { uiKind: 'CATEGORY', patch: { type: 'CATEGORY', categoryId: target.categoryId ?? null, url: resolved.href } }
  }
  if (target.kind === 'cms-page') {
    return { uiKind: 'PAGE', patch: { type: 'PAGE', pageId: target.cmsPageId ?? null, url: resolved.href } }
  }
  return {
    uiKind: 'CUSTOM_URL',
    patch: { type: 'CUSTOM_URL', url: resolved.href ?? '/', productId: null, categoryId: null, pageId: null },
  }
}

export function sortMenuRows(a: AdminNavigationMenuItem, b: AdminNavigationMenuItem): number {
  return a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'tr')
}

export type MenuTreeNode = AdminNavigationMenuItem & { children: MenuTreeNode[] }

export function buildMenuTree(items: AdminNavigationMenuItem[]): MenuTreeNode[] {
  const byParent = new Map<string | null, AdminNavigationMenuItem[]>()
  for (const item of items) {
    const key = item.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(item)
  }
  const walk = (parentId: string | null): MenuTreeNode[] =>
    (byParent.get(parentId) ?? [])
      .slice()
      .sort(sortMenuRows)
      .map((item) => ({ ...item, children: walk(item.id) }))
  return walk(null)
}
