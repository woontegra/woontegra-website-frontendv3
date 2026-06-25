import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '@/components/site/PageHero'
import { FeatureCard } from '@/components/site/FeatureCard'
import { SiteCtaSection } from '@/components/site/SiteCtaSection'
import { resolveIcon } from '@/lib/iconRegistry'
import type { ServiceDetailContent } from '@/data/serviceDetailContent'

type Props = {
  content: ServiceDetailContent
  serviceLabel?: string
}

export function ServiceDetailLayout({ content, serviceLabel }: Props) {
  const label = serviceLabel ?? content.hero.title

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        image={content.hero.image}
        imageAlt={content.hero.imageAlt}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Hizmetler', href: '/hizmetler' },
          { label },
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={content.hero.primaryCta.to}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {content.hero.primaryCta.text}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={content.hero.secondaryCta.to}
            className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white hover:text-slate-900"
          >
            {content.hero.secondaryCta.text}
          </Link>
        </div>
      </PageHero>

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{content.problems.title}</h2>
            <p className="mt-4 text-base text-slate-600">{content.problems.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.problems.items.map((item) => {
              const Icon = resolveIcon(item.icon)
              return (
                <div key={item.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{content.approach.title}</h2>
              <p className="mt-4 text-base text-slate-600">{content.approach.description}</p>
              <ul className="mt-8 space-y-4">
                {content.approach.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                    <span className="text-base text-slate-700">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/50 p-6 md:p-8">
              <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">Süreç Akışı</p>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {content.approach.flowSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-2 md:gap-3">
                    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm">{step}</span>
                    {index < content.approach.flowSteps.length - 1 ? <ArrowRight className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{content.scope.title}</h2>
            <p className="mt-4 text-base text-slate-600">{content.scope.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.scope.items.map((item) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} gradient={item.gradient} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{content.process.title}</h2>
            <p className="mt-4 text-base text-slate-600">{content.process.subtitle}</p>
          </div>
          <div className="mt-12 hidden lg:block">
            <div className="relative space-y-10">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-300" />
              {content.process.steps.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-10 text-right' : 'pl-10'}`}>
                    <div className="inline-block max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
                      <span className="text-sm font-bold text-emerald-600">{step.step}</span>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-emerald-500 shadow" />
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 space-y-4 lg:hidden">
            {content.process.steps.map((step) => (
              <div key={step.step} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">{step.step}</div>
                <div>
                  <h3 className="font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white md:text-4xl">{content.whyUs.title}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {content.whyUs.items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{content.technology.title}</h2>
            <p className="mt-4 text-base text-slate-600">{content.technology.description}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.technology.items.map((item) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>

      <SiteCtaSection
        title={content.cta.title}
        description={content.cta.description}
        buttonText={content.cta.buttonText}
        buttonLink={content.cta.buttonTo}
        secondaryButtonText={content.cta.secondaryButtonText}
        secondaryButtonLink={content.cta.secondaryButtonTo}
      />
    </div>
  )
}
