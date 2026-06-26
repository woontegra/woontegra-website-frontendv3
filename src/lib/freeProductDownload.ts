import { getApiRootUrl } from '@/utils/env'

/** Ücretsiz indirilebilir ürünler için public download API yolu (istatistik takibi). */
export function resolvePublicFreeDownloadUrl(
  slug: string,
  variant: 'setup' | 'portable' = 'setup',
): string | null {
  if (slug === 'sifre-kasasi') {
    const root = getApiRootUrl()
    return `${root}/api/public/downloads/sifre-kasasi/${variant}`
  }
  return null
}

export function hasPortableFreeDownload(slug: string): boolean {
  return slug === 'sifre-kasasi'
}
