import { useQuery } from '@tanstack/react-query'
import { AboutHero } from '@/components/site/about/AboutHero'
import {
  AboutBrands,
  AboutCta,
  AboutDifferentiators,
  AboutStructure,
  AboutTimeline,
  AboutVision,
  AboutWhatIs,
  AboutWorkApproach,
} from '@/components/site/about/AboutSections'
import { usePageMeta } from '@/hooks/usePageMeta'
import { pageContentService } from '@/services/api/pageContent'
import { defaultAboutPageContent } from '@/types/aboutPageContent'

export function AboutPage() {
  const { data: content = defaultAboutPageContent } = useQuery({
    queryKey: ['page-content', 'about'],
    queryFn: () => pageContentService.getAbout(),
    placeholderData: defaultAboutPageContent,
    staleTime: 60_000,
  })

  usePageMeta({
    title: content.hero.title || 'Hakkımızda',
    description: content.metaDescription || content.hero.subtitle,
  })

  return (
    <div className="bg-white">
      <AboutHero hero={content.hero} />
      <AboutWhatIs whatIs={content.whatIs} />
      <AboutTimeline timeline={content.timeline} />
      <AboutDifferentiators section={content.differentiators} />
      <AboutBrands brands={content.brands} />
      <AboutWorkApproach section={content.workApproach} />
      <AboutStructure section={content.structure} />
      <AboutVision vision={content.vision} />
      <AboutCta cta={content.cta} />
    </div>
  )
}
