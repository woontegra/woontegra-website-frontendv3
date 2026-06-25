import { SERVICE_DETAIL_BY_SLUG } from '@/data/serviceDetailContent'

export type ServiceCatalogEntry = {
  slug: string
  title: string
  menuTitle: string
  path: string
}

export const SERVICE_PAGE_CONTENT_KEY = 'servicePages'

export const SERVICE_CATALOG: ServiceCatalogEntry[] = Object.entries(SERVICE_DETAIL_BY_SLUG)
  .map(([slug, content]) => ({
    slug,
    title: content.hero.title,
    menuTitle: content.hero.title,
    path: `/hizmetler/${slug}`,
  }))
  .sort((a, b) => a.title.localeCompare(b.title, 'tr'))

export function getServiceBySlug(slug: string): ServiceCatalogEntry | undefined {
  return SERVICE_CATALOG.find((s) => s.slug === slug)
}
