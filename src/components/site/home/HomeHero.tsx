import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DEFAULT_HOME_HERO, SafeImage } from '@/components/ui/SafeImage'
import type { HomePageContent } from '@/types/homePageContent'

type Props = { hero: HomePageContent['hero'] }

export function HomeHero({ hero }: Props) {
  const handlePrimary = () => {
    if (hero.button1Href.startsWith('#')) {
      document.getElementById(hero.button1Href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (hero.button1Href.startsWith('/')) {
      window.location.href = hero.button1Href
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.2),transparent_70%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-white">
            {hero.tag ? (
              <div className="mb-4 inline-block rounded-full bg-green-500/20 px-3 py-1.5">
                <span className="text-xs font-medium text-green-400">{hero.tag}</span>
              </div>
            ) : null}
            <h1 className="mb-4 text-3xl font-semibold leading-tight md:text-4xl">{hero.title}</h1>
            {hero.subtitle ? <p className="mb-6 text-base leading-relaxed text-gray-300">{hero.subtitle}</p> : null}
            <div className="flex flex-wrap gap-3">
              {hero.button1Text ? (
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  {hero.button1Text}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
              {hero.button2Text ? (
                <Link
                  to={hero.button2Href || '/iletisim'}
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  {hero.button2Text}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-green-500/30 to-blue-500/30 blur-3xl" />
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <SafeImage
              src={hero.image}
              fallbackSrc={DEFAULT_HOME_HERO}
              alt="Woontegra Teknoloji"
              loading="eager"
              placeholder
              wrapperClassName="relative rounded-xl border border-white/10 shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl"
              aspectRatio="aspect-[8/5]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
