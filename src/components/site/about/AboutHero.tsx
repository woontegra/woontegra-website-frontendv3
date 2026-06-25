import { PageHero } from '@/components/site/PageHero'
import { AboutIcon } from '@/components/site/about/aboutIcons'
import { enabledHighlights, type AboutPageContent } from '@/types/aboutPageContent'

type Props = { hero: AboutPageContent['hero'] }

export function AboutHero({ hero }: Props) {
  const highlights = enabledHighlights(hero.highlights)

  return (
    <PageHero
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.subtitle}
      breadcrumbs={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Hakkımızda' },
      ]}
      image={hero.image}
      imageAlt="Woontegra ekibi ve dijital ürünler"
    >
      {highlights.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {highlights.map((card) => (
            <div key={card.id} className={`rounded-xl border bg-gradient-to-br p-4 ${card.cardClass}`}>
              <AboutIcon name={card.icon} className={`mb-2 h-5 w-5 ${card.iconClass}`} />
              <p className="text-sm font-medium leading-snug text-slate-100">{card.title}</p>
            </div>
          ))}
        </div>
      ) : null}
    </PageHero>
  )
}
