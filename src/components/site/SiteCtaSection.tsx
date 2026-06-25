import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

type Props = {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
}

export function SiteCtaSection({
  title,
  description,
  buttonText = 'İletişime Geç',
  buttonLink = '/iletisim',
  secondaryButtonText,
  secondaryButtonLink,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 py-20 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">{title}</h2>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-emerald-50 md:text-lg">{description}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {buttonText ? (
            <Link to={buttonLink}>
              <Button variant="secondary" className="border-white/40 px-8 py-3 text-base text-white hover:bg-white hover:text-emerald-700">
                {buttonText}
              </Button>
            </Link>
          ) : null}
          {secondaryButtonText && secondaryButtonLink ? (
            <Link to={secondaryButtonLink}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                {secondaryButtonText}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
