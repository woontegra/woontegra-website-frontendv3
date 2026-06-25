import { DEFAULT_HEADER_NAV, SERVICES_NAV_CHILDREN, SOFTWARE_NAV_CHILDREN, type HeaderNavItem } from '@/data/defaultHeaderNav'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

/** Header’da gösterilmeyecek test/eski menü etiketleri */
const HIDDEN_NAV_LABELS = new Set([
  'masaüstü araçlar',
  'masaustu araclar',
  'ücretsiz araçlar',
  'ucretsiz araclar',
  'desktop tools',
])

const MIN_HEADER_NAV_ITEMS = 3

function normLabel(label: string): string {
  return label.trim().toLocaleLowerCase('tr-TR')
}

export function isHiddenHeaderNavLabel(label: string): boolean {
  return HIDDEN_NAV_LABELS.has(normLabel(label))
}

function mapPublicItem(item: PublicNavigationMenuItem): HeaderNavItem | null {
  const href = (item.resolvedUrl || item.href || '').trim()
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
    if (item.id === 'services' && (!item.children || item.children.length === 0)) {
      return { ...item, href: '/hizmetler', children: SERVICES_NAV_CHILDREN }
    }
    if ((item.id === 'software' || item.id === 'yazilimlar') && (!item.children || item.children.length === 0)) {
      return { ...item, id: 'software', label: item.label || 'Yazılımlar', href: '/yazilimlar', children: SOFTWARE_NAV_CHILDREN }
    }
    return item
  })
}

function ensureSoftwareNavItem(items: HeaderNavItem[]): HeaderNavItem[] {
  const hasSoftware = items.some((i) => i.id === 'software' || i.id === 'yazilimlar' || normLabel(i.label) === 'yazılımlar')
  if (hasSoftware) return restoreDropdownChildren(items)
  const blogIdx = items.findIndex((i) => i.href === '/blog')
  const softwareItem: HeaderNavItem = {
    id: 'software',
    label: 'Yazılımlar',
    href: '/yazilimlar',
    children: SOFTWARE_NAV_CHILDREN,
  }
  if (blogIdx >= 0) {
    const next = [...items]
    next.splice(blogIdx, 0, softwareItem)
    return restoreDropdownChildren(next)
  }
  return restoreDropdownChildren([...items, softwareItem])
}

export function resolveHeaderNavigation(apiItems: HeaderNavItem[]): HeaderNavItem[] {
  const sanitized = apiItems.filter((item) => item.label?.trim() && item.href?.trim() && item.href !== '#')

  if (sanitized.length >= MIN_HEADER_NAV_ITEMS) {
    return ensureSoftwareNavItem(restoreDropdownChildren(sanitized))
  }

  return DEFAULT_HEADER_NAV
}

export function resolveHeaderNavigationFromPublic(items: PublicNavigationMenuItem[]): HeaderNavItem[] {
  return resolveHeaderNavigation(mapPublicNavTree(items))
}
