import { DEFAULT_LOGO_PATH, resolveMediaUrl as resolveCoreMediaUrl } from '@/lib/resolveMediaUrl'
import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'

export {
  resolveMediaUrl,
  resolveImageUrl,
  resolveAssetUrl,
  extractMediaUrl,
  isValidImageSrc,
  normalizePublicImagePath,
  getMediaBaseUrl,
  MEDIA_PLACEHOLDER,
  PRODUCT_IMAGE_PLACEHOLDER,
  DEFAULT_HOME_HERO,
} from '@/lib/resolveMediaUrl'
export { resolveCatalogMediaPreviewUrl } from '@/lib/resolveCatalogMediaPreviewUrl'

/** Ürün/blog kartları — boşsa ürün placeholder */
export function resolveCatalogCoverUrl(raw?: string | null): string {
  if (!raw?.trim()) {
    return resolveCoreMediaUrl(null, { placeholder: true, productPlaceholder: true })
  }
  return resolveCoreMediaUrl(raw.trim(), { placeholder: true, productPlaceholder: true })
}

export function productCoverUrl(product: {
  coverImage?: string | null
  image?: string | null
  coverUrl?: string | null
}): string {
  const raw = product.coverImage || product.coverUrl || product.image
  return resolveCatalogCoverUrl(raw)
}

export function buildBrandedAssetUrl(path: string, logoUpdatedAt?: string): string {
  const trimmed = path?.trim()
  const basePath = trimmed || DEFAULT_HEADER_LOGO_PATH || DEFAULT_LOGO_PATH
  const url =
    resolveCoreMediaUrl(basePath) ||
    resolveCoreMediaUrl(DEFAULT_HEADER_LOGO_PATH) ||
    resolveCoreMediaUrl(DEFAULT_LOGO_PATH)
  if (!logoUpdatedAt?.trim()) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(logoUpdatedAt.trim())}`
}

/** @deprecated resolveCatalogCoverUrl veya resolveMediaUrl kullanın */
export function resolveMediaUrlWithProductPlaceholder(
  raw?: string | null,
  options?: { placeholder?: boolean },
): string {
  if (!raw?.trim()) {
    return resolveCoreMediaUrl(null, {
      placeholder: options?.placeholder,
      productPlaceholder: options?.placeholder,
    })
  }
  return resolveCoreMediaUrl(raw.trim(), {
    placeholder: options?.placeholder,
    productPlaceholder: options?.placeholder,
  })
}
