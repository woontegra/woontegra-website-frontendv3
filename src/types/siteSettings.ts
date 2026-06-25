function str(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function keywords(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((k) => String(k)).filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) return parsed.map((k) => String(k)).filter(Boolean)
    } catch {
      return value
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    }
  }
  return []
}

import {
  clampNavbarLogoWidth,
  DEFAULT_NAVBAR_LOGO_WIDTH,
} from '@/lib/logoSize'

export type PublicSiteSettings = {
  siteName: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  logo: string
  logoUpdatedAt: string
  navbarLogoHeight: number
  navbarLogoWidth: number
  footerLogoHeight: number
  mobileLogoHeight: number
  favicon: string
  faviconUpdatedAt: string
  primaryColor: string
  secondaryColor: string
}

export type AdminSiteSettings = {
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  navbarLogoWidth: number
  contactEmail: string
  contactPhone: string
  contactWhatsApp: string
  contactAddress: string
  googleMapsEmbed: string
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string[]
  maintenanceMode: boolean
  maintenanceMessage: string
  logoUpdatedAt: string
  faviconUpdatedAt: string
}

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  siteName: 'Woontegra',
  contactEmail: 'info@woontegra.com',
  contactPhone: '',
  contactAddress: '',
  logo: '/logo.png',
  logoUpdatedAt: '',
  navbarLogoHeight: 42,
  navbarLogoWidth: DEFAULT_NAVBAR_LOGO_WIDTH,
  footerLogoHeight: 28,
  mobileLogoHeight: 34,
  favicon: '/favicon.svg',
  faviconUpdatedAt: '',
  primaryColor: '#16a34a',
  secondaryColor: '#0ea5e9',
}

export const DEFAULT_ADMIN_SITE_SETTINGS: AdminSiteSettings = {
  siteName: 'Woontegra',
  siteDescription: '',
  logo: '/logo.png',
  favicon: '/favicon.svg',
  navbarLogoWidth: DEFAULT_NAVBAR_LOGO_WIDTH,
  contactEmail: '',
  contactPhone: '',
  contactWhatsApp: '',
  contactAddress: '',
  googleMapsEmbed: '',
  defaultTitle: '',
  defaultDescription: '',
  defaultKeywords: [],
  maintenanceMode: false,
  maintenanceMessage: 'Site bakımda. Kısa süre sonra geri döneceğiz.',
  logoUpdatedAt: '',
  faviconUpdatedAt: '',
}

function parseLogoHeight(value: unknown, fallback: number): number {
  const n = Number.parseInt(str(value), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(90, Math.max(24, n))
}

export function normalizePublicSiteSettings(raw: unknown): PublicSiteSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    siteName: str(o.siteName, DEFAULT_PUBLIC_SITE_SETTINGS.siteName),
    contactEmail: str(o.contactEmail, DEFAULT_PUBLIC_SITE_SETTINGS.contactEmail),
    contactPhone: str(o.contactPhone),
    contactAddress: str(o.contactAddress),
    logo: str(o.logo, DEFAULT_PUBLIC_SITE_SETTINGS.logo) || DEFAULT_PUBLIC_SITE_SETTINGS.logo,
    logoUpdatedAt: str(o.logoUpdatedAt),
    navbarLogoHeight: parseLogoHeight(o.navbarLogoHeight, DEFAULT_PUBLIC_SITE_SETTINGS.navbarLogoHeight),
    navbarLogoWidth: clampNavbarLogoWidth(
      o.navbarLogoWidth,
      DEFAULT_PUBLIC_SITE_SETTINGS.navbarLogoWidth,
    ),
    footerLogoHeight: parseLogoHeight(o.footerLogoHeight, DEFAULT_PUBLIC_SITE_SETTINGS.footerLogoHeight),
    mobileLogoHeight: parseLogoHeight(o.mobileLogoHeight, DEFAULT_PUBLIC_SITE_SETTINGS.mobileLogoHeight),
    favicon: str(o.favicon, DEFAULT_PUBLIC_SITE_SETTINGS.favicon) || DEFAULT_PUBLIC_SITE_SETTINGS.favicon,
    faviconUpdatedAt: str(o.faviconUpdatedAt),
    primaryColor: str(o.primaryColor, DEFAULT_PUBLIC_SITE_SETTINGS.primaryColor),
    secondaryColor: str(o.secondaryColor, DEFAULT_PUBLIC_SITE_SETTINGS.secondaryColor),
  }
}

export function normalizeAdminSiteSettings(raw: unknown): AdminSiteSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    siteName: str(o.siteName, DEFAULT_ADMIN_SITE_SETTINGS.siteName),
    siteDescription: str(o.siteDescription),
    logo: str(o.logo, DEFAULT_ADMIN_SITE_SETTINGS.logo) || DEFAULT_ADMIN_SITE_SETTINGS.logo,
    favicon: str(o.favicon, DEFAULT_ADMIN_SITE_SETTINGS.favicon) || DEFAULT_ADMIN_SITE_SETTINGS.favicon,
    navbarLogoWidth: clampNavbarLogoWidth(
      o.navbarLogoWidth,
      DEFAULT_ADMIN_SITE_SETTINGS.navbarLogoWidth,
    ),
    contactEmail: str(o.contactEmail),
    contactPhone: str(o.contactPhone),
    contactWhatsApp: str(o.contactWhatsApp),
    contactAddress: str(o.contactAddress),
    googleMapsEmbed: str(o.googleMapsEmbed),
    defaultTitle: str(o.defaultTitle),
    defaultDescription: str(o.defaultDescription),
    defaultKeywords: keywords(o.defaultKeywords),
    maintenanceMode: bool(o.maintenanceMode),
    maintenanceMessage: str(o.maintenanceMessage, DEFAULT_ADMIN_SITE_SETTINGS.maintenanceMessage),
    logoUpdatedAt: str(o.logoUpdatedAt),
    faviconUpdatedAt: str(o.faviconUpdatedAt),
  }
}

export type SiteSettingsPatch = Partial<Omit<AdminSiteSettings, 'logoUpdatedAt'>>
