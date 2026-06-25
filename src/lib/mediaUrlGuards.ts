/** Upload test artefactları — publicte kullanılmamalı. */
const TEST_OBJECT_PATTERNS = [
  /r2-test/i,
  /admin-api-test/i,
  /woontegra-logo-test/i,
  /home-hero-test/i,
] as const

/** Bilinen stub/placeholder dosyalar (çok küçük veya metin SVG). */
const STUB_LOCAL_PATHS = new Set([
  '/images/woontegra-logo.svg',
  'images/woontegra-logo.svg',
  '/images/ana-sayfa-hero.jpg',
  'images/ana-sayfa-hero.jpg',
])

export function isTestMediaUrl(url?: string | null): boolean {
  if (!url?.trim()) return false
  const trimmed = url.trim()
  return TEST_OBJECT_PATTERNS.some((re) => re.test(trimmed))
}

export function isStubLocalMediaPath(path?: string | null): boolean {
  if (!path?.trim()) return false
  const normalized = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`
  return STUB_LOCAL_PATHS.has(normalized) || STUB_LOCAL_PATHS.has(normalized.replace(/^\//, ''))
}

/** Test R2 URL veya stub local path ise boş döner (fallback devreye girer). */
export function sanitizeUntrustedMediaPath(path?: string | null): string {
  if (!path?.trim()) return ''
  const trimmed = path.trim()
  if (isTestMediaUrl(trimmed)) return ''
  if (isStubLocalMediaPath(trimmed)) return ''
  return trimmed
}
