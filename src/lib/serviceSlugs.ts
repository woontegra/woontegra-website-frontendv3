import { SERVICE_DETAIL_BY_SLUG } from '@/data/serviceDetailContent'



/** Eski menü / URL alias → kanonik hizmet slug */

export const SERVICE_SLUG_ALIASES: Record<string, string> = {

  'e-ticaret-cozumleri': 'e-ticaret',

  'saas-urun-gelistirme': 'saas',

}



export const KNOWN_SERVICE_SLUGS = new Set([

  ...Object.keys(SERVICE_DETAIL_BY_SLUG),

  ...Object.keys(SERVICE_SLUG_ALIASES),

])



export function resolveServiceSlug(slug: string): string {

  const key = slug.trim().toLowerCase()

  return SERVICE_SLUG_ALIASES[key] ?? key

}



export function isKnownServiceSlug(slug: string): boolean {

  const key = slug.trim().toLowerCase()

  if (!key) return false

  if (KNOWN_SERVICE_SLUGS.has(key)) return true

  return Boolean(SERVICE_DETAIL_BY_SLUG[resolveServiceSlug(key)])

}



export function canonicalServicePath(slug: string): string {

  return `/hizmetler/${resolveServiceSlug(slug)}`

}



/** CMS tek segment yollarını (/saas) kanonik hizmet rotasına çevirir. */

export function remapLegacyServiceUrl(url: string): string {

  if (!url || url === '#') return url

  const match = url.match(/^\/([^/?#]+)\/?$/)

  if (!match) return url

  if (isKnownServiceSlug(match[1])) return canonicalServicePath(match[1])

  return url

}


