import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AboutIcon } from '@/components/site/about/aboutIcons'
import { SafeImage } from '@/components/ui/SafeImage'
import { isValidImageSrc, resolveImageUrl } from '@/lib/resolveImageUrl'
import {
  enabledBrands,
  enabledIconCards,
  enabledSimpleCards,
  enabledStats,
  enabledTimelineSteps,
  type AboutPageContent,
} from '@/types/aboutPageContent'

export function AboutWhatIs({ whatIs }: { whatIs: AboutPageContent['whatIs'] }) {
  const cards = enabledSimpleCards(whatIs.cards)
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{whatIs.title}</h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {whatIs.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {whatIs.highlight ? <p className="font-semibold text-slate-900">{whatIs.highlight}</p> : null}
            </div>
          </div>
          <div className="grid gap-4">
            {cards.map((card) => (
              <div key={card.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function AboutTimeline({ timeline }: { timeline: AboutPageContent['timeline'] }) {
  const steps = enabledTimelineSteps(timeline.steps)
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{timeline.title}</h2>
          {timeline.subtitle ? <p className="mt-4 text-base text-slate-600">{timeline.subtitle}</p> : null}
        </div>
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="relative space-y-0">
            <div className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-slate-200 via-emerald-300 to-slate-200 md:left-[19px]" />
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
                <div className="relative z-10 flex shrink-0 flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full md:h-10 md:w-10 ${step.color} shadow-lg`}>
                    <AboutIcon name={step.icon} className="h-4 w-4 text-white md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Adım {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function AboutDifferentiators({ section }: { section: AboutPageContent['differentiators'] }) {
  const cards = enabledIconCards(section.cards)
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{section.title}</h2>
          {section.subtitle ? <p className="mt-4 text-base text-slate-400">{section.subtitle}</p> : null}
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/80 p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-900/20">
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                <AboutIcon name={item.icon} className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutBrands({ brands }: { brands: AboutPageContent['brands'] }) {
  const cards = enabledBrands(brands.cards)
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{brands.title}</h2>
          {brands.subtitle ? <p className="mt-4 text-base leading-relaxed text-slate-600">{brands.subtitle}</p> : null}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((brand) => {
            const imageSrc = isValidImageSrc(brand.image) ? resolveImageUrl(brand.image) : ''
            return (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100 sm:h-52">
                  {imageSrc ? (
                    <SafeImage
                      src={imageSrc}
                      alt={brand.name}
                      className="h-full transition-transform duration-500 group-hover:scale-105"
                      aspectRatio="aspect-auto h-48 sm:h-52"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="text-lg font-bold text-slate-900">{brand.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{brand.text}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 group-hover:underline">
                    Siteyi ziyaret et
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function AboutWorkApproach({ section }: { section: AboutPageContent['workApproach'] }) {
  const cards = enabledIconCards(section.cards)
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{section.title}</h2>
          {section.subtitle ? <p className="mt-4 text-base text-slate-600">{section.subtitle}</p> : null}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md`}>
                <AboutIcon name={item.icon} className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutStructure({ section }: { section: AboutPageContent['structure'] }) {
  const stats = enabledStats(section.stats)
  return (
    <section className="bg-slate-50 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{section.title}</h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <AboutIcon name={stat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{stat.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{stat.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function AboutVision({ vision }: { vision: AboutPageContent['vision'] }) {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{vision.title}</h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300">
          {vision.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutCta({ cta }: { cta: AboutPageContent['cta'] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 py-20 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">{cta.title}</h2>
        {cta.subtitle ? <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-emerald-50 md:text-lg">{cta.subtitle}</p> : null}
        {cta.buttonText ? (
          <Link
            to={cta.buttonHref || '/iletisim'}
            className="mt-10 inline-flex items-center justify-center rounded-lg border border-white/40 px-10 py-4 text-base text-white transition-all hover:bg-white hover:text-emerald-700"
          >
            {cta.buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
