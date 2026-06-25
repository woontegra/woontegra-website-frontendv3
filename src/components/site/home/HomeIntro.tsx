import type { HomePageContent } from '@/types/homePageContent'
import { cn } from '@/utils/cn'

type Props = { intro: HomePageContent['intro'] }

export function HomeIntro({ intro }: Props) {
  const cards = (intro.cards ?? []).filter((c) => c.enabled).slice().sort((a, b) => a.order - b.order)
  return (
    <section className="relative bg-gradient-to-b from-white via-slate-50 to-white py-16">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-20 bg-gradient-to-b from-transparent to-white" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {intro.eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{intro.eyebrow}</p>
          ) : null}
          {intro.title ? (
            <h2 className="text-balance bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 bg-clip-text text-2xl font-semibold leading-tight text-transparent sm:text-3xl">
              {intro.title}
            </h2>
          ) : null}
        </div>

        {cards.length ? (
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, idx) => (
              <div
                key={card.id}
                className="group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border bg-gradient-to-br text-xs font-bold',
                      idx % 3 === 0
                        ? 'border-emerald-100 from-emerald-600/10 to-emerald-600/0 text-emerald-700'
                        : idx % 3 === 1
                          ? 'border-blue-100 from-blue-600/10 to-blue-600/0 text-blue-700'
                          : 'border-slate-200 from-slate-900/5 to-transparent text-slate-700',
                    )}
                    aria-hidden
                  >
                    {card.icon?.trim() || String(idx + 1).padStart(2, '0')}
                  </div>
                  <p className="text-base font-semibold text-slate-900">{card.title}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        ) : null}

        {(intro.text1 || intro.text2) && !intro.title ? (
          <div className="mx-auto mt-10 max-w-4xl text-center">
            {intro.text1 ? <p className="mb-4 text-lg leading-relaxed text-slate-700">{intro.text1}</p> : null}
            {intro.text2 ? <p className="text-lg font-semibold text-slate-900">{intro.text2}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
