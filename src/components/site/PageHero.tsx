import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SafeImage } from '@/components/ui/SafeImage'
import { cn } from '@/utils/cn'
import { isValidImageSrc } from '@/lib/resolveImageUrl'

export const INNER_PAGE_HERO_CLASS = 'min-h-[320px] py-16 md:min-h-[360px] md:py-20 lg:py-24'

export type PageHeroBreadcrumb = {
  label: string
  href?: string
}

export type PageHeroHighlight = {
  icon?: LucideIcon
  title: string
}

type Props = {
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: PageHeroBreadcrumb[]
  highlights?: PageHeroHighlight[]
  image?: string | null
  imageAlt?: string
  rightContent?: ReactNode
  children?: ReactNode
  variant?: 'dark' | 'soft'
  size?: 'inner' | 'compact'
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  highlights = [],
  image,
  imageAlt = '',
  rightContent,
  children,
  variant = 'dark',
  size = 'inner',
  className,
}: Props) {
  const isDark = variant === 'dark'
  const showImage = Boolean(rightContent || (image && isValidImageSrc(image)))

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950'
          : 'bg-gradient-to-b from-slate-50 via-white to-slate-100',
        size === 'inner' ? INNER_PAGE_HERO_CLASS : 'py-12 md:py-16',
        className,
      )}
    >
      {isDark ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(34,197,94,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.12),transparent_50%)]" />
        </>
      ) : null}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid items-center gap-10 lg:gap-16',
            showImage ? 'lg:grid-cols-2' : 'max-w-4xl',
          )}
        >
          <div className={isDark ? 'text-white' : 'text-slate-900'}>
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {crumb.href ? (
                      <Link to={crumb.href} className="transition hover:text-white">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={cn('font-medium', isDark ? 'text-emerald-400' : 'text-emerald-700')}>
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            ) : null}
            {eyebrow ? (
              <p
                className={cn(
                  'mb-4 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
                  isDark
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">{title}</h1>
            {description ? (
              <p
                className={cn(
                  'mt-5 max-w-xl text-base leading-relaxed md:text-lg',
                  isDark ? 'text-slate-300' : 'text-slate-600',
                )}
              >
                {description}
              </p>
            ) : null}
            {highlights.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {highlights.map((card) => (
                  <div
                    key={card.title}
                    className={cn(
                      'rounded-xl border p-4',
                      isDark
                        ? 'border-white/10 bg-white/5 backdrop-blur-sm'
                        : 'border-slate-200 bg-white shadow-sm',
                    )}
                  >
                    {card.icon ? (
                      <card.icon
                        className={cn('mb-2 h-5 w-5', isDark ? 'text-emerald-400' : 'text-emerald-600')}
                        aria-hidden
                      />
                    ) : null}
                    <p
                      className={cn(
                        'text-sm font-medium leading-snug',
                        isDark ? 'text-slate-100' : 'text-slate-800',
                      )}
                    >
                      {card.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {children}
          </div>

          {showImage ? (
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              {rightContent ?? (
                <>
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/15 blur-2xl" />
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-2xl border p-2 shadow-2xl',
                      isDark
                        ? 'border-white/15 bg-slate-900/40 shadow-emerald-900/20'
                        : 'border-slate-200 bg-white',
                    )}
                  >
                    <SafeImage
                      src={image}
                      alt={imageAlt}
                      loading="eager"
                      placeholder
                      wrapperClassName="rounded-xl"
                      aspectRatio="aspect-[4/3]"
                    />
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
