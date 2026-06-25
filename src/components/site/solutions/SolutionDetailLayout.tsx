import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { SiteCtaSection } from '@/components/site/SiteCtaSection'
import type { SolutionDetailContent } from '@/data/solutionCatalog'

type Props = {
  content: SolutionDetailContent
}

export function SolutionDetailLayout({ content }: Props) {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Çözüm"
        title={content.title}
        description={content.description}
        image={content.logo}
        imageAlt={content.logoAlt ?? content.title}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Çözümler', href: '/cozumler' },
          { label: content.title },
        ]}
      >
        {content.externalUrl ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={content.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Siteyi ziyaret et
              <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              to="/iletisim"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white hover:text-slate-900"
            >
              İletişime geç
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </PageHero>

      <SiteCtaSection
        title="Projeniz için teklif alın"
        description="Çözümlerimiz hakkında detaylı bilgi veya özel proje teklifi için bizimle iletişime geçin."
        buttonText="Teklif Al"
        buttonLink="/teklif-al"
        secondaryButtonText="İletişim"
        secondaryButtonLink="/iletisim"
      />
    </div>
  )
}
