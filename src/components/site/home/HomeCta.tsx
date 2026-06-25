import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { HomePageContent } from '@/types/homePageContent'

type Props = { cta: HomePageContent['cta'] }

export function HomeCta({ cta }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">{cta.title}</h2>
        {cta.subtitle ? <p className="mx-auto mb-10 max-w-2xl text-xl text-white/90">{cta.subtitle}</p> : null}
        {cta.buttonText ? (
          <Link
            to={cta.buttonHref || '/iletisim'}
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-10 py-4 text-base text-white transition-all hover:bg-white hover:text-green-600"
          >
            {cta.buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
