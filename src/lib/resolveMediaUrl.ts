import { getApiRootUrl } from '@/utils/env'
import { sanitizeUntrustedMediaPath } from '@/lib/mediaUrlGuards'

/** Boş veya hatalı görseller için varsayılan placeholder (frontend static). */
export const MEDIA_PLACEHOLDER = '/images/blog/varsayilan.jpg'
export const PRODUCT_IMAGE_PLACEHOLDER = '/product-placeholder.svg'
/** Eski frontend gerçek ana sayfa hero görseli (~202 KB). */
export const DEFAULT_HOME_HERO = '/images/hero-dashboard.jpg'
/** Eski frontend gerçek Woontegra logo PNG (~706 KB). */
export const DEFAULT_LOGO_PATH = '/logo.png'

const INVALID_LITERALS = new Set(['null', 'undefined', 'none', 'false', 'n/a', 'na'])

/** Eski panel/DB kayıtlarındaki bilinen path hataları → public/images gerçek dosya. */
const IMAGE_PATH_ALIASES: Record<string, string> = {
  '/images/about-hero.jpg': '/images/hakkimizda-hero.jpg',
  '/images/about-hero.png': '/images/hakkimizda-hero.jpg',
  '/images/blog/default.jpg': '/images/blog/varsayilan.jpg',
  '/images/e-ticaret.png': '/images/e-ticaret.jpeg',
  '/images/e-ticaret.jpg': '/images/e-ticaret-sistemi.jpg',
  '/images/web-tasarim.jpg': '/images/web-tasarim-mockup.jpg',
  '/images/marka-bilirkisi.jpg': '/images/brand-bilirkisi.jpg',
  '/images/marka-optimoon.jpg': '/images/brand-optimoon.jpg',
  '/images/marka-datca.jpg': '/images/brand-datca.jpg',
  '/images/marka-mercan.jpg': '/images/brand-mercan.jpg',
  '/images/ana-sayfa-hero.jpg': '/images/hero-dashboard.jpg',
  '/brands/optimoon.png': '/images/brand-optimoon.jpg',
  '/brands/datca.png': '/images/brand-datca.jpg',
  '/brands/mercan.png': '/images/brand-mercan.jpg',
  '/brands/bilirkisi.png': '/images/brand-bilirkisi.jpg',
}

const FRONTEND_STATIC_PREFIXES = ['/logo.', '/favicon.', '/images/', '/assets/', '/product-placeholder.']

export type ResolveMediaUrlOptions = {
  /** true ise boş URL için placeholder döner */
  placeholder?: boolean
  /** true ise ürün placeholder kullanılır */
  productPlaceholder?: boolean
}

function getUploadsBase(): string {
  const fromEnv =
    import.meta.env.VITE_UPLOADS_BASE_URL?.trim() ||
    import.meta.env.VITE_BACKEND_PUBLIC_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  const apiRoot = getApiRootUrl()
  if (apiRoot) return apiRoot

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return ''
}

function encodeUriPathSegments(pathname: string): string {
  const segs = pathname.split('/').filter((s) => s.length > 0)
  if (segs.length === 0) return ''
  return `/${segs.map((seg) => encodeURIComponent(seg)).join('/')}`
}

function isLocalhostHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')
}

function tryParseUrl(raw: string): URL | null {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

function defaultPlaceholder(options?: ResolveMediaUrlOptions): string {
  if (options?.productPlaceholder) return PRODUCT_IMAGE_PLACEHOLDER
  return MEDIA_PLACEHOLDER
}

function resolveUploadsPath(relativePath: string): string {
  const base = getUploadsBase()
  const pathPart = encodeUriPathSegments(relativePath.startsWith('/') ? relativePath : `/${relativePath}`)
  if (!base) return pathPart
  return `${base.replace(/\/+$/, '')}${pathPart}`
}

/**
 * Canlı ortamda DB'ye sızan localhost mutlak URL'lerini göreli /uploads/ yoluna indirger.
 */
export function normalizeStoredAssetPath(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) {
    const parsed = tryParseUrl(trimmed)
    if (parsed && isLocalhostHostname(parsed.hostname) && parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname
    }
    return trimmed
  }

  if (trimmed.startsWith('/')) return trimmed

  if (trimmed.startsWith('uploads/')) return `/${trimmed}`
  if (trimmed.startsWith('images/')) return `/${trimmed}`

  const parsed = tryParseUrl(trimmed)
  if (parsed) {
    if (isLocalhostHostname(parsed.hostname) && parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname
    }
    return trimmed
  }

  return trimmed
}

export function normalizePublicImagePath(url?: string | null): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  const lower = trimmed.toLowerCase()
  if (IMAGE_PATH_ALIASES[lower]) return IMAGE_PATH_ALIASES[lower]
  if (IMAGE_PATH_ALIASES[trimmed]) return IMAGE_PATH_ALIASES[trimmed]

  return trimmed
}

/** API / medya picker yanıtlarından URL çıkarır. */
export function extractMediaUrl(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim()
  if (!raw || typeof raw !== 'object') return ''

  const o = raw as Record<string, unknown>
  const nested = o.media && typeof o.media === 'object' ? (o.media as Record<string, unknown>) : null

  const candidates = [
    o.publicUrl,
    o.url,
    o.fileUrl,
    o.secureUrl,
    o.imageUrl,
    o.path,
    o.src,
    nested?.publicUrl,
    nested?.url,
    nested?.path,
  ]

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return ''
}

/**
 * Tek merkez: R2/CDN https, backend `/uploads/...`, Vite public `/images/...`.
 */
export function resolveMediaUrl(
  path: string | null | undefined,
  options?: ResolveMediaUrlOptions,
): string {
  const placeholder = defaultPlaceholder(options)

  if (path == null) return options?.placeholder ? placeholder : ''
  const raw = path.trim()
  if (!raw || INVALID_LITERALS.has(raw.toLowerCase())) {
    return options?.placeholder ? placeholder : ''
  }

  const trusted = sanitizeUntrustedMediaPath(raw)
  if (!trusted) {
    return options?.placeholder ? placeholder : ''
  }

  const stored = normalizeStoredAssetPath(trusted)
  if (!stored) return options?.placeholder ? placeholder : ''

  if (/^https?:\/\//i.test(stored)) {
    return stored
  }

  if (stored.startsWith('/uploads/') || stored.startsWith('uploads/')) {
    const uploadsPath = stored.startsWith('/') ? stored : `/${stored}`
    return resolveUploadsPath(uploadsPath)
  }

  const normalized = normalizePublicImagePath(stored)
  if (!normalized) return options?.placeholder ? placeholder : ''

  if (FRONTEND_STATIC_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized
  }

  if (normalized.startsWith('/images/') || normalized.startsWith('/assets/')) {
    return normalized
  }

  if (normalized.startsWith('/')) {
    return normalized
  }

  return `/images/${normalized.replace(/^\/+/, '')}`
}

export function isValidImageSrc(url?: string | null): boolean {
  if (url == null) return false
  const trimmed = url.trim()
  if (!trimmed || INVALID_LITERALS.has(trimmed.toLowerCase())) return false
  return Boolean(resolveMediaUrl(trimmed))
}

export function resolvePageImage(
  loaded: boolean,
  apiImage: string | undefined | null,
  fallback: string,
): string | undefined {
  const fromApi = apiImage?.trim()
  if (!loaded) return fromApi || undefined
  return fromApi || fallback
}

export function getMediaBaseUrl(): string {
  return getUploadsBase()
}

/** @deprecated resolveMediaUrl kullanın */
export function resolveAssetUrl(path: string | null | undefined, options?: ResolveMediaUrlOptions): string {
  return resolveMediaUrl(path, options)
}

/** Kurumsal site görselleri — resolveMediaUrl alias (geriye uyumluluk). */
export function resolveImageUrl(url?: string | null, options?: ResolveMediaUrlOptions): string {
  return resolveMediaUrl(url, options)
}
