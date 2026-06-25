import { DEFAULT_HEADER_NAV, type HeaderNavItem } from '@/data/defaultHeaderNav'
import {
  mapPublicNavTree,
  resolveHeaderNavigation,
  resolveHeaderNavigationFromPublic,
} from '@/lib/headerNavigation'
import type { AdminNavigationMenuItem, PublicNavigationMenuItem } from '@/types/navigationMenu'

export const MIN_MEANINGFUL_TOP_LEVEL_NAV = 3

export type HeaderNavSource = 'default' | 'database'

export function normNavLabel(label: string): string {
  return label.trim().toLocaleLowerCase('tr-TR')
}

function isActiveTopLevel(item: { isActive?: boolean; parentId?: string | null }): boolean {
  return item.isActive !== false && !item.parentId
}

export function countMeaningfulPublicTopLevel(items: PublicNavigationMenuItem[]): number {
  return mapPublicNavTree(items).length
}

export function countMeaningfulAdminTopLevel(items: AdminNavigationMenuItem[]): number {
  return items.filter((i) => isActiveTopLevel(i) && i.label?.trim() && (i.resolvedUrl || i.url)?.trim()).length
}

export function isPublicNavigationComplete(items: PublicNavigationMenuItem[] | null | undefined): boolean {
  if (!items?.length) return false
  return countMeaningfulPublicTopLevel(items) >= MIN_MEANINGFUL_TOP_LEVEL_NAV
}

export function isAdminNavigationComplete(items: AdminNavigationMenuItem[]): boolean {
  if (!items.length) return false
  return countMeaningfulAdminTopLevel(items) >= MIN_MEANINGFUL_TOP_LEVEL_NAV
}

export function getEffectiveHeaderNavigation(
  publicItems: PublicNavigationMenuItem[] | null | undefined,
  options?: { isError?: boolean },
): { nav: HeaderNavItem[]; source: HeaderNavSource } {
  if (options?.isError || publicItems == null) {
    return { nav: DEFAULT_HEADER_NAV, source: 'default' }
  }
  const mapped = mapPublicNavTree(publicItems)
  if (mapped.length < MIN_MEANINGFUL_TOP_LEVEL_NAV) {
    return { nav: DEFAULT_HEADER_NAV, source: 'default' }
  }
  return {
    nav: resolveHeaderNavigation(mapped),
    source: 'database',
  }
}

export function getEffectiveHeaderNavigationFromPublic(items: PublicNavigationMenuItem[]): HeaderNavItem[] {
  return getEffectiveHeaderNavigation(items).nav
}

/** Admin önizleme — public endpoint ile aynı sonuç */
export function previewHeaderNavFromPublic(items: PublicNavigationMenuItem[]): HeaderNavItem[] {
  return getEffectiveHeaderNavigation(items).nav
}

export function previewHeaderNavFromAdminDb(items: AdminNavigationMenuItem[]): HeaderNavItem[] {
  const asPublic = adminItemsToPublicTree(items)
  return getEffectiveHeaderNavigation(asPublic).nav
}

function adminItemsToPublicTree(items: AdminNavigationMenuItem[]): PublicNavigationMenuItem[] {
  const active = items.filter((i) => i.isActive !== false)
  const byParent = new Map<string | null, AdminNavigationMenuItem[]>()
  for (const item of active) {
    const key = item.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(item)
  }
  const sortFn = (a: AdminNavigationMenuItem, b: AdminNavigationMenuItem) =>
    a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'tr')

  const walk = (parentId: string | null): PublicNavigationMenuItem[] =>
    (byParent.get(parentId) ?? [])
      .slice()
      .sort(sortFn)
      .map((item) => ({
        id: item.id,
        label: item.label,
        href: item.resolvedUrl || item.url || '/',
        resolvedUrl: item.resolvedUrl || item.url || '/',
        openInNewTab: item.openInNewTab,
        sortOrder: item.sortOrder,
        children: walk(item.id),
      }))

  return walk(null)
}

export { resolveHeaderNavigationFromPublic }
