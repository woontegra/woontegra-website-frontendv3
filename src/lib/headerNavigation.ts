import { DEFAULT_HEADER_NAV, SERVICES_NAV_CHILDREN, type HeaderNavItem } from '@/data/defaultHeaderNav'
import { remapLegacyServiceUrl } from '@/lib/serviceSlugs'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

/** Header'da gösterilmeyecek test/eski menü etiketleri */
const HIDDEN_NAV_LABELS = new Set([
  'masaüstü araçlar',
  'masaustu araclar',
  'ücretsiz araçlar',
  'ucretsiz araclar',
  'desktop tools',
])

const MIN_HEADER_NAV_ITEMS = 1

function normLabel(label: string): string {
  return label.trim().toLocaleLowerCase('tr-TR')
}

export function isHiddenHeaderNavLabel(label: string): boolean {
  return HIDDEN_NAV_LABELS.has(normLabel(label))
}

function normalizeNavHref(href: string): string {
  return remapLegacyServiceUrl(href.trim())
}

function mapPublicItem(item: PublicNavigationMenuItem): HeaderNavItem | null {
  const href = normalizeNavHref(item.resolvedUrl || item.href || '')
  const label = item.label?.trim() ?? ''
  if (!label || !href || href === '#') return null
  if (isHiddenHeaderNavLabel(label)) return null

  const children = (item.children ?? [])
    .map(mapPublicItem)
    .filter((c): c is HeaderNavItem => c != null)

  return {
    id: item.id,
    label,
    href,
    end: href === '/',
    openInNewTab: item.openInNewTab,
    children: children.length ? children : undefined,
  }
}

export function mapPublicNavTree(items: PublicNavigationMenuItem[]): HeaderNavItem[] {
  if (!Array.isArray(items)) return []
  return [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(mapPublicItem)
    .filter((item): item is HeaderNavItem => item != null)
}

function restoreDropdownChildren(items: HeaderNavItem[]): HeaderNavItem[] {
  return items.map((item) => {
    const isServices =
      item.id === 'services' || normalizeNavHref(item.href) === '/hizmetler' || item.label === 'Hizmetler'

    if (isServices) {
      const children =
        item.children && item.children.length > 0
          ? item.children.map((child) => ({ ...child, href: normalizeNavHref(child.href) }))
          : SERVICES_NAV_CHILDREN
      return { ...item, href: '/hizmetler', children }
    }

    if (item.children?.length) {
      return {
        ...item,
        children: item.children.map((child) => ({ ...child, href: normalizeNavHref(child.href) })),
      }
    }

    return { ...item, href: normalizeNavHref(item.href) }
  })
}

/** Veritabanı menüsünü olduğu gibi kullan; Yazılımlar vb. hardcoded eklenmez. */
export function resolveHeaderNavigation(apiItems: HeaderNavItem[]): HeaderNavItem[] {
  const sanitized = apiItems.filter((item) => item.label?.trim() && item.href?.trim() && item.href !== '#')

  if (sanitized.length >= MIN_HEADER_NAV_ITEMS) {
    return restoreDropdownChildren(sanitized)
  }

  return DEFAULT_HEADER_NAV
}

export function resolveHeaderNavigationFromPublic(items: PublicNavigationMenuItem[]): HeaderNavItem[] {
  return resolveHeaderNavigation(mapPublicNavTree(items))
}
