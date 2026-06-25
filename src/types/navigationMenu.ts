export type NavigationMenuItemType = 'CUSTOM_URL' | 'PRODUCT' | 'CATEGORY' | 'PAGE'

export type AdminNavigationMenuItem = {
  id: string
  label: string
  type: NavigationMenuItemType
  url: string | null
  productId: string | null
  categoryId: string | null
  pageId: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  openInNewTab: boolean
  createdAt: string
  updatedAt: string
  resolvedUrl: string
}

export type AdminNavigationMenuInput = {
  label: string
  type: NavigationMenuItemType
  url?: string | null
  productId?: string | null
  categoryId?: string | null
  pageId?: string | null
  parentId?: string | null
  sortOrder?: number
  isActive?: boolean
  openInNewTab?: boolean
}

export type PublicNavigationMenuItem = {
  id: string
  label: string
  href: string
  resolvedUrl: string
  openInNewTab: boolean
  sortOrder: number
  children: PublicNavigationMenuItem[]
}

export const NAV_MENU_TYPE_LABELS: Record<NavigationMenuItemType, string> = {
  CUSTOM_URL: 'Özel URL / Dış bağlantı',
  PRODUCT: 'Ürün',
  CATEGORY: 'Ürün kategorisi',
  PAGE: 'CMS sayfa',
}
