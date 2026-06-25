import { useQuery } from '@tanstack/react-query'
import { BarChart3, Code2, Target, Workflow, Zap } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { MarketingFeatureCard } from '@/components/site/MarketingFeatureCard'
import { SiteCtaSection } from '@/components/site/SiteCtaSection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/api/pageContent'
import {
  defaultServiceCardsBundle,
  getActiveServiceCards,
  mergeServiceCards,
  SERVICE_CARDS_KEY,
} from '@/data/serviceCardsContent'
import {
  defaultServicesPageContent,
  MARKETING_PAGE_KEYS,
} from '@/types/marketingPageContent'

const PROCESS = [
  { step: '01', title: 'Analiz', desc: 'İhtiyaçları ve hedefleri netleştiririz.', color: 'from-blue-500 to-cyan-500' },
  { step: '02', title: 'Planlama', desc: 'Yol haritası ve sistem mimarisini oluştururuz.', color: 'from-purple-500 to-pink-500' },
  { step: '03', title: 'Geliştirme', desc: 'Modern teknolojilerle üretime geçeriz.', color: 'from-emerald-500 to-teal-500' },
  { step: '04', title: 'Yayın & Destek', desc: 'Canlıya alır ve sürdürülebilir hale getiririz.', color: 'from-orange-500 to-red-500' },
] as const

const WHY = [
  { icon: Target, title: 'Ürün Deneyimi', desc: 'Kendi markalarımızdan gelen gerçek operasyon tecrübesi.' },
  { icon: Workflow, title: 'Tek Yapı', desc: 'Yazılım, satış ve operasyonu entegre yönetiyoruz.' },
  { icon: Zap, title: 'Performans', desc: 'Hızlı, stabil ve büyümeye hazır sistemler kuruyoruz.' },
] as const

export function ServicesPage() {
  const pageQuery = useQuery({
    queryKey: ['page-content', MARKETING_PAGE_KEYS.services],
    queryFn: () => pageContentService.getMarketingPage(MARKETING_PAGE_KEYS.services, defaultServicesPageContent),
    placeholderData: defaultServicesPageContent,
    ...publicQueryOptions,
  })
  const cardsQuery = useQuery({
    queryKey: ['page-content', SERVICE_CARDS_KEY],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SERVICE_CARDS_KEY)
      return mergeServiceCards(defaultServiceCardsBundle, raw as Partial<typeof defaultServiceCardsBundle>)
    },
    placeholderData: defaultServiceCardsBundle,
    ...publicQueryOptions,
  })

  const page = pageQuery.data ?? defaultServicesPageContent
  const serviceCards = getActiveServiceCards(cardsQuery.data ?? defaultServiceCardsBundle)

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
        imageAlt="Woontegra dijital hizmetler"
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Hizmetler' }]}
        highlights={[
          { icon: Code2, title: page.highlight1 },
          { icon: BarChart3, title: page.highlight2 },
        ]}
      />

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{page.sectionEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{page.sectionTitle}</h2>
            <p className="mt-4 text-base text-slate-600">{page.sectionDescription}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCards.map((service) => (
              <MarketingFeatureCard
                key={service.id}
                icon={service.icon}
                title={service.title}
                description={service.description}
                href={service.href}
                gradient={service.gradient}
                tag={service.tag}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Süreç</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Nasıl Çalışıyoruz?</h2>
            <p className="mt-4 text-base text-slate-400">
              Şeffaf, planlı ve sonuç odaklı bir iş akışı ile projelerinizi hayata geçiriyoruz.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((item) => (
              <div key={item.step} className="text-center">
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-lg font-bold text-white shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Farkımız</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Neden Woontegra?</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WHY.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-7 transition-all hover:border-emerald-200 hover:shadow-md">
                <item.icon className="mb-4 h-8 w-8 text-emerald-600" aria-hidden />
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
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
