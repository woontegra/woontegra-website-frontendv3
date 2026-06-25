export type CmsQuickMenuParams = {
  sitePageKey?: string
  cmsPageId?: string
  categoryId?: string
  productId?: string
  label: string
  path: string
}

export type CmsQuickFooterParams = {
  sitePageKey?: string
  label: string
  path: string
  groupId?: string
}

export function buildMenuQuickLink(params: CmsQuickMenuParams): string {
  const q = new URLSearchParams({
    quick: 'menu',
    label: params.label,
    path: params.path,
  })
  if (params.sitePageKey) q.set('sitePageKey', params.sitePageKey)
  if (params.cmsPageId) q.set('cmsPageId', params.cmsPageId)
  if (params.categoryId) q.set('categoryId', params.categoryId)
  if (params.productId) q.set('productId', params.productId)
  return `/admin/menu-yonetimi?${q.toString()}`
}

export function buildFooterQuickLink(params: CmsQuickFooterParams): string {
  const q = new URLSearchParams({
    quick: 'footer',
    label: params.label,
    path: params.path,
  })
  if (params.sitePageKey) q.set('sitePageKey', params.sitePageKey)
  if (params.groupId) q.set('groupId', params.groupId)
  return `/admin/footer-yonetimi?${q.toString()}`
}
