import { getApiBaseUrl } from '@/utils/env'

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'functional' | 'unknown'

export type PublicCookieItem = {
  name: string
  provider: string
  category: CookieCategory
  purpose: string
  duration: string
  domain: string
  source: 'cookie' | 'set-cookie' | 'localStorage' | 'sessionStorage'
}

export type PublicCookiesResponse = {
  lastScannedAt: string | null
  cookies: PublicCookieItem[]
}

let cached: PublicCookiesResponse | null = null
let inflight: Promise<PublicCookiesResponse> | null = null

export async function fetchPublicCookies(force = false): Promise<PublicCookiesResponse> {
  if (!force && cached) return cached
  if (!force && inflight) return inflight

  inflight = (async () => {
    try {
      const base = getApiBaseUrl().replace(/\/$/, '')
      const response = await fetch(`${base}/public/cookies`, { cache: 'no-store' })
      if (response.ok) {
        const json = (await response.json()) as { success?: boolean; data?: PublicCookiesResponse }
        const data = json.data ?? (json as unknown as PublicCookiesResponse)
        cached = {
          lastScannedAt: data.lastScannedAt ?? null,
          cookies: Array.isArray(data.cookies) ? data.cookies : [],
        }
        return cached
      }
    } catch {
      /* API yoksa boş liste */
    }

    cached = { lastScannedAt: null, cookies: [] }
    return cached
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}

export function clearPublicCookiesCache(): void {
  cached = null
}

export const COOKIE_CATEGORY_LABELS: Record<CookieCategory, string> = {
  necessary: 'Zorunlu Çerezler',
  analytics: 'Analitik Çerezler',
  marketing: 'Pazarlama Çerezleri',
  functional: 'Fonksiyonel Çerezler',
  unknown: 'Sınıflandırılmamış',
}
