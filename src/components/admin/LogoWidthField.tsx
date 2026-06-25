import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import {
  clampNavbarLogoWidth,
  DEFAULT_NAVBAR_LOGO_WIDTH,
  NAVBAR_LOGO_WIDTH_MAX,
  NAVBAR_LOGO_WIDTH_MIN,
  navbarLogoImgStyle,
} from '@/lib/logoSize'
import { buildBrandedAssetUrl } from '@/utils/mediaUrl'
import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'

type Props = {
  value: number
  logoUrl?: string
  logoUpdatedAt?: string
  onChange: (width: number) => void
}

export function LogoWidthField({ value, logoUrl, logoUpdatedAt, onChange }: Props) {
  const width = clampNavbarLogoWidth(value)
  const { style: previewStyle } = navbarLogoImgStyle(width, false)
  const previewSrc = useMemo(() => {
    const path = logoUrl?.trim() || DEFAULT_HEADER_LOGO_PATH
    return buildBrandedAssetUrl(path, logoUpdatedAt)
  }, [logoUrl, logoUpdatedAt])

  const setWidth = (next: number) => onChange(clampNavbarLogoWidth(next))

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-900">Logo genişliği</p>
          <p className="text-xs text-slate-500">Mouse ile sürükleyerek header logosunu büyütüp küçültün.</p>
        </div>
        <span className="tabular-nums text-sm font-semibold text-brand-700">{width} px</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={NAVBAR_LOGO_WIDTH_MIN}
          max={NAVBAR_LOGO_WIDTH_MAX}
          step={1}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow"
          aria-label="Logo genişliği"
        />
        <input
          type="number"
          min={NAVBAR_LOGO_WIDTH_MIN}
          max={NAVBAR_LOGO_WIDTH_MAX}
          step={1}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm tabular-nums text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          aria-label="Logo genişliği piksel"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {NAVBAR_LOGO_WIDTH_MIN} px — {NAVBAR_LOGO_WIDTH_MAX} px
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setWidth(DEFAULT_NAVBAR_LOGO_WIDTH)}
        >
          Varsayılana dön ({DEFAULT_NAVBAR_LOGO_WIDTH} px)
        </Button>
      </div>

      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">Önizleme</p>
        <div className="flex min-h-[52px] items-center">
          <img
            src={previewSrc}
            alt=""
            className="block shrink-0 object-contain object-left"
            style={previewStyle}
            onError={(e) => {
              e.currentTarget.src = buildBrandedAssetUrl(DEFAULT_HEADER_LOGO_PATH)
            }}
          />
        </div>
      </div>
    </div>
  )
}
