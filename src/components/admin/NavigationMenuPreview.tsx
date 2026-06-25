import type { HeaderNavItem } from '@/data/defaultHeaderNav'

type Props = {
  nav: HeaderNavItem[]
  source: 'default' | 'database'
}

export function NavigationMenuPreview({ nav, source }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Public header önizleme</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
            source === 'database' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-200'
          }`}
        >
          {source === 'database' ? 'Veritabanı menüsü' : 'Varsayılan menü'}
        </span>
      </div>
      <nav aria-label="Header menü önizleme" className="flex flex-wrap items-center gap-1">
        {nav.map((item) => (
          <div key={item.id} className="relative shrink-0">
            <span className="inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-100">
              {item.label}
              {(item.children?.length ?? 0) > 0 ? (
                <span className="text-slate-400" aria-hidden>
                  ▾
                </span>
              ) : null}
            </span>
            {(item.children?.length ?? 0) > 0 ? (
              <div className="absolute left-0 top-full z-10 mt-0.5 hidden min-w-[220px] rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-lg group-hover:block md:group-hover:block">
                {/* hover via parent wrapper */}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      {nav.some((i) => (i.children?.length ?? 0) > 0) ? (
        <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
          {nav
            .filter((i) => (i.children?.length ?? 0) > 0)
            .map((item) => (
              <div key={`${item.id}-children`}>
                <p className="text-xs font-medium text-emerald-400">{item.label} ▾</p>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {item.children!.map((child) =>
                    child.groupHeader ? (
                      <li
                        key={child.id}
                        className="w-full text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {child.label}
                      </li>
                    ) : (
                      <li
                        key={child.id}
                        className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-200"
                      >
                        {child.label}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  )
}
