import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'
import { DEFAULT_LOGO_PATH, resolveMediaUrl } from '@/lib/resolveMediaUrl'
import { sanitizeUntrustedMediaPath } from '@/lib/mediaUrlGuards'
import {
  DEFAULT_NAVBAR_LOGO_WIDTH,
  navbarLogoImgStyle,
} from '@/lib/logoSize'
import { buildBrandedAssetUrl } from '@/utils/mediaUrl'
import { cn } from '@/utils/cn'

type SiteLogoProps = {
  siteName: string
  logoPath?: string
  logoUpdatedAt?: string
  widthPx?: number
  className?: string
}

const FALLBACK_LOGO_PATHS = [DEFAULT_HEADER_LOGO_PATH, DEFAULT_LOGO_PATH, '/images/woontegra-logo.png']

function useIsMobileViewport(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mobile
}

function resolveFallbackLogoSrc(): string {
  for (const path of FALLBACK_LOGO_PATHS) {
    const url = resolveMediaUrl(path)
    if (url) return url
  }
  return resolveMediaUrl(DEFAULT_LOGO_PATH) || '/logo.png'
}

const DEFAULT_LOGO_SRC = resolveFallbackLogoSrc()

function resolveLogoSrc(logoPath?: string, logoUpdatedAt?: string): string {
  const custom = sanitizeUntrustedMediaPath(logoPath?.trim())
  if (!custom) return DEFAULT_LOGO_SRC
  if (custom === DEFAULT_HEADER_LOGO_PATH || custom === DEFAULT_LOGO_PATH) return DEFAULT_LOGO_SRC
  const built = buildBrandedAssetUrl(custom, logoUpdatedAt)
  return built || DEFAULT_LOGO_SRC
}

/** Header logosu — genişlik admin `navbarLogoWidth` ayarından (px). */
export function SiteLogo({
  logoPath,
  logoUpdatedAt,
  widthPx = DEFAULT_NAVBAR_LOGO_WIDTH,
  className,
}: SiteLogoProps) {
  const isMobile = useIsMobileViewport()
  const { width: displayWidth, style: logoStyle } = navbarLogoImgStyle(widthPx, isMobile)
  const preferredSrc = useMemo(() => resolveLogoSrc(logoPath, logoUpdatedAt), [logoPath, logoUpdatedAt])
  const [displaySrc, setDisplaySrc] = useState(DEFAULT_LOGO_SRC)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  useEffect(() => {
    setDisplaySrc(preferredSrc || DEFAULT_LOGO_SRC)
    setFallbackIndex(0)
  }, [preferredSrc])

  const fallbackChain = useMemo(() => {
    const chain = [preferredSrc, ...FALLBACK_LOGO_PATHS.map((p) => resolveMediaUrl(p))].filter(Boolean)
    return [...new Set(chain)]
  }, [preferredSrc])

  return (
    <img
      src={displaySrc || DEFAULT_LOGO_SRC}
      alt=""
      width={displayWidth}
      height={Math.max(1, Math.round(displayWidth / 3.2))}
      loading="eager"
      fetchPriority="high"
      decoding="sync"
      aria-hidden
      className={cn('block shrink-0 object-contain object-left', className)}
      style={logoStyle}
      onError={() => {
        const next = fallbackIndex + 1
        if (next < fallbackChain.length) {
          setFallbackIndex(next)
          setDisplaySrc(fallbackChain[next]!)
          return
        }
        setDisplaySrc(DEFAULT_LOGO_SRC)
      }}
    />
  )
}
