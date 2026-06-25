import type { CSSProperties } from 'react'

export const NAVBAR_LOGO_WIDTH_MIN = 80
export const NAVBAR_LOGO_WIDTH_MAX = 260
export const DEFAULT_NAVBAR_LOGO_WIDTH = 150
export const MOBILE_NAVBAR_LOGO_WIDTH_CAP = 160

/** Woontegra logo PNG yaklaşık en-boy oranı (genişlik / yükseklik). */
export const NAVBAR_LOGO_ASPECT_RATIO = 3.2

export function clampNavbarLogoWidth(value: unknown, fallback = DEFAULT_NAVBAR_LOGO_WIDTH): number {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(NAVBAR_LOGO_WIDTH_MAX, Math.max(NAVBAR_LOGO_WIDTH_MIN, parsed))
}

/** Mobilde taşmayı önlemek için üst sınır. */
export function effectiveNavbarLogoWidth(configWidth: number, isMobile: boolean): number {
  const clamped = clampNavbarLogoWidth(configWidth)
  if (!isMobile) return clamped
  return Math.min(clamped, MOBILE_NAVBAR_LOGO_WIDTH_CAP)
}

/** Admin önizleme ve public header aynı genişlik kuralını kullanır. */
export function navbarLogoImgStyle(
  configWidth: number,
  isMobile = false,
): { width: number; style: CSSProperties } {
  const width = effectiveNavbarLogoWidth(configWidth, isMobile)
  return {
    width,
    style: {
      width: `${width}px`,
      height: 'auto',
      maxWidth: isMobile ? `min(${width}px, 46vw, 100%)` : `${width}px`,
      minWidth: `${width}px`,
    },
  }
}
