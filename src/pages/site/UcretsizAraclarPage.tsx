import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Shield, Sparkles } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { SiteCtaSection } from '@/components/site/SiteCtaSection'
import { SafeImage } from '@/components/ui/SafeImage'
import { usePageMeta } from '@/hooks/usePageMeta'
import { pageContentService } from '@/services/api/pageContent'
import {
  defaultFreeToolCardsBundle,
  FREE_TOOL_CARDS_KEY,
  getActiveFreeToolCards,
  getToolBadge,
  mergeFreeToolCards,
  toolImagePath,
} from '@/data/freeToolCardsContent'
import { defaultToolsPageContent, MARKETING_PAGE_KEYS } from '@/types/marketingPageContent'

export function UcretsizAraclarPage() {
  const pageQuery = useQuery({
    queryKey: ['page-content', MARKETING_PAGE_KEYS.tools],
    queryFn: () => pageContentService.getMarketingPage(MARKETING_PAGE_KEYS.tools, defaultToolsPageContent),
  })
  const toolsQuery = useQuery({
    queryKey: ['page-content', FREE_TOOL_CARDS_KEY],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(FREE_TOOL_CARDS_KEY)
      return mergeFreeToolCards(defaultFreeToolCardsBundle, raw as Partial<typeof defaultFreeToolCardsBundle>)
    },
  })

  const page = pageQuery.data ?? defaultToolsPageContent
  const tools = getActiveFreeToolCards(toolsQuery.data ?? defaultFreeToolCardsBundle)

  usePageMeta({ title: page.seoTitle, description: page.seoDescription })

  if (!page.enabled) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sayfa şu an yayında değil</h1>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        description={page.heroDescription}
        image={page.heroImage}
        imageAlt="Woontegra ücretsiz araçlar"
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Ücretsiz Araçlar' }]}
        highlights={[
          { icon: Shield, title: page.highlight1 },
          { icon: Sparkles, title: page.highlight2 },
        ]}
      />

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{page.sectionEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{page.sectionTitle}</h2>
            <p className="mt-4 text-base text-slate-600">{page.sectionDescription}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const image = toolImagePath(tool.imageKey)
              const isActive = tool.status === 'active'
              const badge = getToolBadge(tool.status)
              const card = (
                <div className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${isActive ? 'border-slate-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl' : 'border-slate-200/80 opacity-80'}`}>
                  {image ? (
                    <div className="h-44 overflow-hidden bg-slate-100">
                      <SafeImage src={image} alt={tool.name} className="h-full" aspectRatio="aspect-auto h-44" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{tool.name}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{badge}</span>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                    {isActive ? (
                      <span className="mt-4 text-sm font-semibold text-emerald-700">{tool.buttonText} →</span>
                    ) : (
                      <span className="mt-4 inline-flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        {tool.buttonText}
                      </span>
                    )}
                  </div>
                </div>
              )
              return isActive && tool.href && tool.href !== '#' ? (
                <Link key={tool.id} to={tool.href} className="block">
                  {card}
                </Link>
              ) : (
                <div key={tool.id}>{card}</div>
              )
            })}
          </div>
        </div>
      </section>

      <SiteCtaSection
        title={page.ctaTitle}
        description={page.ctaDescription}
        buttonText={page.ctaButtonText}
        buttonLink={page.ctaButtonLink}
        secondaryButtonText={page.ctaSecondaryButtonText}
        secondaryButtonLink={page.ctaSecondaryButtonLink}
      />
    </div>
  )
}
