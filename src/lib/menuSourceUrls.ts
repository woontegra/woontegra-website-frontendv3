/** Public site URL üretimi — menü kaynakları için tek kaynak */

export function productPublicPath(slug: string): string {
  return `/yazilimlar/${slug}`
}

export function categoryPublicPath(slug: string): string {
  return `/kategori/${slug}`
}

export function cmsPagePublicPath(slug: string): string {
  return `/${slug}`
}

export function blogPostPublicPath(slug: string): string {
  return `/blog/${slug}`
}

export function servicePublicPath(slug: string): string {
  return `/hizmetler/${slug}`
}

export function solutionPublicPath(slug: string): string {
  return `/cozumler/${slug}`
}
