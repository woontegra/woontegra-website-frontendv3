export const COOKIE_CONSENT_KEY = 'woontegra_cookie_consent'

export type CookieConsentCategories = {
  necessary: true
  analytics: boolean
  marketing: boolean
  functional: boolean
  updatedAt: string
}

export type CookieConsentChoice = 'accept-all' | 'reject-all' | 'custom'

const CONSENT_EVENT = 'woontegra:consent-change'
export const OPEN_COOKIE_PREFERENCES_EVENT = 'open-cookie-preferences'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function getCookieConsent(): CookieConsentCategories | null {
  if (!isBrowser()) return null

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CookieConsentCategories>
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      functional: parsed.functional === true,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null
}

export function saveCookieConsent(
  consent: Omit<CookieConsentCategories, 'necessary' | 'updatedAt'> & { necessary?: true },
): CookieConsentCategories {
  const payload: CookieConsentCategories = {
    necessary: true,
    analytics: consent.analytics === true,
    marketing: consent.marketing === true,
    functional: consent.functional === true,
    updatedAt: new Date().toISOString(),
  }

  if (isBrowser()) {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: payload }))
  }

  return payload
}

export function acceptAllCookies(): CookieConsentCategories {
  return saveCookieConsent({ analytics: true, marketing: true, functional: true })
}

export function rejectAllCookies(): CookieConsentCategories {
  return saveCookieConsent({ analytics: false, marketing: false, functional: false })
}

export function openCookiePreferences(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))
  }
}

export function onConsentChange(listener: (consent: CookieConsentCategories | null) => void): () => void {
  if (!isBrowser()) return () => undefined

  const handler = (event: Event) => {
    const custom = event as CustomEvent<CookieConsentCategories>
    listener(custom.detail ?? getCookieConsent())
  }

  window.addEventListener(CONSENT_EVENT, handler)
  return () => window.removeEventListener(CONSENT_EVENT, handler)
}
