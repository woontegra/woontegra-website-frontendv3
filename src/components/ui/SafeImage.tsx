import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_HOME_HERO,
  MEDIA_PLACEHOLDER,
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveMediaUrl,
} from '@/lib/resolveMediaUrl'
import { cn } from '@/utils/cn'

type Props = {
  src?: string | null
  alt: string
  className?: string
  wrapperClassName?: string
  fallbackClassName?: string
  aspectRatio?: string
  loading?: 'eager' | 'lazy'
  /** true: ürün placeholder; false: blog/genel placeholder */
  productPlaceholder?: boolean
  placeholder?: boolean
  /** Birincil src başarısız olursa denenecek yedek ham path */
  fallbackSrc?: string | null
  onHidden?: () => void
}

function pickPlaceholder(productPlaceholder: boolean): string {
  return productPlaceholder ? PRODUCT_IMAGE_PLACEHOLDER : MEDIA_PLACEHOLDER
}

function resolveSrc(
  raw: string | null | undefined,
  productPlaceholder: boolean,
  usePlaceholder: boolean,
): string {
  const resolved = resolveMediaUrl(raw, { productPlaceholder })
  if (resolved) return resolved
  if (usePlaceholder) return pickPlaceholder(productPlaceholder)
  return ''
}

export function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackClassName,
  aspectRatio = 'aspect-[4/3]',
  loading = 'lazy',
  productPlaceholder = false,
  placeholder = false,
  fallbackSrc,
  onHidden,
}: Props) {
  const placeholderAsset = pickPlaceholder(productPlaceholder)

  const primarySrc = useMemo(
    () => resolveSrc(src, productPlaceholder, placeholder),
    [src, productPlaceholder, placeholder],
  )

  const secondarySrc = useMemo(() => {
    if (!fallbackSrc?.trim()) return ''
    return resolveSrc(fallbackSrc, productPlaceholder, true)
  }, [fallbackSrc, productPlaceholder])

  const [activeSrc, setActiveSrc] = useState(primarySrc)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setActiveSrc(primarySrc || secondarySrc || (placeholder ? placeholderAsset : ''))
    setLoaded(false)
    setFailed(false)
  }, [primarySrc, secondarySrc, placeholder, placeholderAsset])

  if (failed || !activeSrc) {
    onHidden?.()
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400',
          aspectRatio,
          fallbackClassName,
          wrapperClassName,
        )}
        aria-hidden={!alt}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      />
    )
  }

  return (
    <div className={cn('relative w-full overflow-hidden', aspectRatio, wrapperClassName, className)}>
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse rounded-xl bg-slate-200/80" aria-hidden />
      ) : null}
      <img
        src={activeSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (secondarySrc && activeSrc !== secondarySrc) {
            setActiveSrc(secondarySrc)
            setLoaded(false)
            return
          }
          if (placeholder && activeSrc !== placeholderAsset) {
            setActiveSrc(placeholderAsset)
            setLoaded(false)
            return
          }
          setFailed(true)
        }}
      />
    </div>
  )
}

export { DEFAULT_HOME_HERO }
