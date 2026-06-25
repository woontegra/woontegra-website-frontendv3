import {
  DEFAULT_HEADER_NAV,
  SERVICES_NAV_CHILDREN,
  type HeaderNavItem,
} from '@/data/defaultHeaderNav'
import { navigationMenuService } from '@/services/api/navigationMenu'
import type { ProductCategory } from '@/services/api/productCategories'
import type { AdminNavigationMenuInput, AdminNavigationMenuItem, NavigationMenuItemType } from '@/types/navigationMenu'
import { normNavLabel } from '@/lib/navigationMenuState'
import { categoryPublicPath } from '@/lib/menuSourceUrls'

export type DefaultNavTemplateRow = {
  key: string
  label: string
  href: string
  parentKey: string | null
  sortOrder: number
  groupHeader?: boolean
  uiHint: string
}

function flattenDefaultNav(
  items: HeaderNavItem[],
  parentKey: string | null = null,
  startOrder = 0,
): DefaultNavTemplateRow[] {
  const rows: DefaultNavTemplateRow[] = []
  items.forEach((item, index) => {
    const order = item.order ?? startOrder + index
    rows.push({
      key: item.id,
      label: item.label,
      href: item.href,
      parentKey,
      sortOrder: order,
      groupHeader: item.groupHeader,
      uiHint: item.groupHeader ? 'Grup başlığı' : parentKey ? 'Alt menü' : 'Ana menü',
    })
    if (item.children?.length) {
      rows.push(...flattenDefaultNav(item.children, item.id, 0))
    }
  })
  return rows
}

export const DEFAULT_NAV_TEMPLATE_ROWS = flattenDefaultNav(DEFAULT_HEADER_NAV)

export function defaultNavTemplateTree(): HeaderNavItem[] {
  return DEFAULT_HEADER_NAV
}

type SeedLeaf = {
  key: string
  label: string
  type: NavigationMenuItemType
  url?: string | null
  categoryId?: string | null
  sortOrder: number
}

type SeedBranch = SeedLeaf & { children?: SeedLeaf[] }

function itemKey(label: string, url: string, parentId: string | null): string {
  return `${normNavLabel(label)}|${url.trim()}|${parentId ?? ''}`
}

function findExisting(
  existing: AdminNavigationMenuItem[],
  label: string,
  url: string,
  parentId: string | null,
): AdminNavigationMenuItem | undefined {
  const key = itemKey(label, url, parentId)
  return existing.find((i) => itemKey(i.label, i.resolvedUrl || i.url || '', i.parentId) === key)
}

function navChildToSeed(child: HeaderNavItem, sortOrder: number): SeedLeaf | null {
  if (child.groupHeader || child.href === '#') return null
  return {
    key: child.id,
    label: child.label,
    type: 'CUSTOM_URL',
    url: child.href,
    sortOrder,
  }
}

function findYazilimlarCategory(categories: ProductCategory[]): ProductCategory | undefined {
  return categories.find(
    (c) => c.isActive && (c.slug === 'yazilimlar' || normNavLabel(c.name) === 'yazılımlar'),
  )
}

/** Varsayılan menü — sabit Yazılımlar yok; kategori varsa CATEGORY tipi ile eklenir. */
function buildSeedPlan(categories: ProductCategory[]): SeedBranch[] {
  const plan: SeedBranch[] = [
    { key: 'home', label: 'Ana sayfa', type: 'CUSTOM_URL', url: '/', sortOrder: 0 },
    { key: 'about', label: 'Hakkımızda', type: 'CUSTOM_URL', url: '/hakkimizda', sortOrder: 1 },
    {
      key: 'services',
      label: 'Hizmetler',
      type: 'CUSTOM_URL',
      url: '/hizmetler',
      sortOrder: 2,
      children: SERVICES_NAV_CHILDREN.map((c, i) => navChildToSeed(c, i)).filter(Boolean) as SeedLeaf[],
    },
    { key: 'solutions', label: 'Çözümler', type: 'CUSTOM_URL', url: '/cozumler', sortOrder: 3 },
    { key: 'blog', label: 'Blog', type: 'CUSTOM_URL', url: '/blog', sortOrder: 5 },
    { key: 'contact', label: 'İletişim', type: 'CUSTOM_URL', url: '/iletisim', sortOrder: 6 },
  ]

  const yazilimlarCat = findYazilimlarCategory(categories)
  if (yazilimlarCat) {
    plan.splice(4, 0, {
      key: 'cat-yazilimlar',
      label: yazilimlarCat.name,
      type: 'CATEGORY',
      categoryId: yazilimlarCat.id,
      url: categoryPublicPath(yazilimlarCat.slug),
      sortOrder: 4,
    })
  }

  return plan
}

function toPayload(node: SeedLeaf, parentId: string | null): AdminNavigationMenuInput {
  return {
    label: node.label,
    type: node.type,
    url: node.type === 'CUSTOM_URL' ? node.url ?? null : null,
    categoryId: node.type === 'CATEGORY' ? node.categoryId ?? null : null,
    productId: null,
    pageId: null,
    parentId,
    sortOrder: node.sortOrder,
    isActive: true,
    openInNewTab: false,
  }
}

export type SeedResult = {
  created: number
  updated: number
  skipped: number
}

export async function seedDefaultNavigationMenu(
  existing: AdminNavigationMenuItem[],
  categories: ProductCategory[],
): Promise<SeedResult> {
  const result: SeedResult = { created: 0, updated: 0, skipped: 0 }
  const plan = buildSeedPlan(categories)
  let working = [...existing]

  for (const branch of plan) {
    const url = branch.type === 'CATEGORY' ? categoryPublicPath(categories.find((c) => c.id === branch.categoryId)?.slug ?? '') : branch.url ?? '/'
    let row =
      branch.type === 'CATEGORY' && branch.categoryId
        ? working.find((i) => i.type === 'CATEGORY' && i.categoryId === branch.categoryId)
        : findExisting(working, branch.label, url, null)

    if (!row) {
      row = await navigationMenuService.create(toPayload(branch, null))
      result.created += 1
      working.push(row)
    } else {
      result.skipped += 1
    }

    for (const child of branch.children ?? []) {
      const childUrl = child.url ?? '/'
      let childRow = findExisting(working, child.label, childUrl, row.id)
      if (!childRow) {
        childRow = await navigationMenuService.create(toPayload(child, row.id))
        result.created += 1
        working.push(childRow)
      } else {
        result.skipped += 1
      }
    }
  }

  return result
}
