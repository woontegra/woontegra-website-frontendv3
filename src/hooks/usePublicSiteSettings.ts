import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { siteSettingsService } from '@/services/api/siteSettings'
import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/types/siteSettings'
import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'
import { buildBrandedAssetUrl, resolveMediaUrl } from '@/utils/mediaUrl'
import { sanitizeUntrustedMediaPath } from '@/lib/mediaUrlGuards'

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public', 'siteSettings'],
    queryFn: () => siteSettingsService.getPublic(),
    staleTime: 60_000,
    placeholderData: (prev) => prev ?? DEFAULT_PUBLIC_SITE_SETTINGS,
  })
}

export function SiteFaviconEffect() {
  const { data } = usePublicSiteSettings()

  useEffect(() => {
    const raw = data?.favicon || DEFAULT_PUBLIC_SITE_SETTINGS.favicon
    const resolved = resolveMediaUrl(raw) || resolveMediaUrl(DEFAULT_PUBLIC_SITE_SETTINGS.favicon)
    if (!resolved) return

    // Cache-bust: her renderda değişmesin; favicon değişince değişsin.
    const version = String(data?.faviconUpdatedAt || hash32(resolved))
    const sep = resolved.includes('?') ? '&' : '?'
    const href = `${resolved}${sep}v=${encodeURIComponent(version)}`
    const type = guessFaviconType(resolved)

    // Tek kaynak: tarayıcılar çoğu zaman "son icon"u seçer.
    // Bu yüzden dinamik link'i kaldırıp, mevcut icon linklerini birlikte güncelliyoruz.
    // Eğer remote/favicon bozuksa default `/favicon.svg` her zaman sayfada kalır.
    ensureDefaultFaviconLink()
    updateFaviconLinks(href, type || undefined)
  }, [data?.favicon, data?.faviconUpdatedAt])

  return null
}

function ensureDefaultFaviconLink() {
  const existing = document.querySelector<HTMLLinkElement>('link#favicon-default')
  if (existing) return existing
  const link = document.createElement('link')
  link.id = 'favicon-default'
  link.rel = 'icon'
  link.type = 'image/svg+xml'
  link.href = '/favicon.svg'
  document.head.insertBefore(link, document.head.firstChild)
  return link
}

function updateFaviconLinks(href: string, type?: string) {
  const icon = ensureLink('favicon-default', 'icon')
  const shortcut = ensureLink('favicon-shortcut', 'shortcut icon')
  const apple = ensureLink('apple-touch-icon', 'apple-touch-icon')

  // default da dahil hepsini aynı kaynağa çeviriyoruz; böylece browser "son icon" seçse bile doğru olur.
  for (const link of [icon, shortcut, apple]) {
    link.href = href
    if (type && link.rel !== 'apple-touch-icon') link.type = type
  }
}

function ensureLink(id: string, rel: string) {
  let link = document.querySelector<HTMLLinkElement>(`link#${id}`)
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = rel
    document.head.appendChild(link)
  }
  return link
}

function guessFaviconType(url: string): string | '' {
  const u = url.toLowerCase()
  if (u.endsWith('.ico')) return 'image/x-icon'
  if (u.endsWith('.png')) return 'image/png'
  if (u.endsWith('.svg')) return 'image/svg+xml'
  return ''
}

function hash32(input: string): number {
  // djb2
  let h = 5381
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i)
  return h >>> 0
}

export function siteLogoUrl(settings: { logo?: string; logoUpdatedAt?: string } | undefined): string {
  const path = sanitizeUntrustedMediaPath(settings?.logo?.trim()) || DEFAULT_HEADER_LOGO_PATH
  return buildBrandedAssetUrl(path, settings?.logoUpdatedAt)
}
