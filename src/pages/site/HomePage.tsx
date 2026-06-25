import { useHomePageContent } from '@/hooks/useHomePageContent'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { HomeHero } from '@/components/site/home/HomeHero'
import { HomeIntro } from '@/components/site/home/HomeIntro'
import { HomeServices } from '@/components/site/home/HomeServices'
import { HomeBrands } from '@/components/site/home/HomeBrands'
import { HomeWhy } from '@/components/site/home/HomeWhy'
import { HomeProcess } from '@/components/site/home/HomeProcess'
import { HomeCta } from '@/components/site/home/HomeCta'
import { defaultHomePageContent } from '@/types/homePageContent'

export function HomePage() {
  const { data: settings } = usePublicSiteSettings()
  const { data: content = defaultHomePageContent } = useHomePageContent()

  usePageMeta({
    title: settings?.siteName ? `${settings.siteName} | Dijital Çözümler` : undefined,
    description: content.hero.subtitle || 'Woontegra — dijital çözümler, yazılım ve teknoloji hizmetleri.',
  })

  return (
    <div className="bg-white">
      {content.hero.enabled ? <HomeHero hero={content.hero} /> : null}
      {content.intro.enabled ? <HomeIntro intro={content.intro} /> : null}
      {content.services.enabled ? <HomeServices services={content.services} /> : null}
      {content.brands.enabled ? <HomeBrands brands={content.brands} /> : null}
      {content.why.enabled ? <HomeWhy why={content.why} /> : null}
      {content.process.enabled ? <HomeProcess process={content.process} /> : null}
      {content.cta.enabled ? <HomeCta cta={content.cta} /> : null}
    </div>
  )
}
