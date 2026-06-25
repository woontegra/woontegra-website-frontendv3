import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { BlogTocItem } from '@/lib/blogReading'
import { cn } from '@/utils/cn'

type Props = {
  items: BlogTocItem[]
  className?: string
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: 'smooth' })
}

export function BlogTableOfContents({ items, className }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  if (items.length < 2) return null

  const list = (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? 'pl-3' : undefined}>
          <button
            type="button"
            onClick={() => scrollToHeading(item.id)}
            className={cn(
              'w-full text-left transition hover:text-emerald-700',
              item.level === 2 ? 'font-medium text-slate-800' : 'text-slate-600',
            )}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <div className={cn('lg:hidden', className)}>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
          onClick={() => setMobileOpen((open) => !open)}
        >
          İçindekiler
          <ChevronDown className={cn('h-4 w-4 transition', mobileOpen && 'rotate-180')} />
        </button>
        {mobileOpen ? <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">{list}</div> : null}
      </div>

      <aside
        className={cn(
          'hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:block',
          className,
        )}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">İçindekiler</h2>
        <nav aria-label="İçindekiler">{list}</nav>
      </aside>
    </>
  )
}
