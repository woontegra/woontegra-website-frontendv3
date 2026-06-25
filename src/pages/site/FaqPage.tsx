import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { SiteCtaSection } from '@/components/site/SiteCtaSection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/api/pageContent'
import { defaultFaqPageContent } from '@/types/faqPageContent'
import { MARKETING_PAGE_KEYS } from '@/types/marketingPageContent'

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50"
      >
        <span className="pr-4 text-base font-semibold text-slate-900">{question}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="border-t border-slate-100 px-6 pb-5 pt-2">
          <p className="text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      ) : null}
    </div>
  )
}

export function FaqPage() {
  const { data: content = defaultFaqPageContent } = useQuery({
    queryKey: ['page-content', MARKETING_PAGE_KEYS.faq],
    queryFn: () => pageContentService.getFaqPage(),
    placeholderData: defaultFaqPageContent,
    ...publicQueryOptions,
  })

  const categoryNames = useMemo(() => content.categories.map((c) => c.category), [content.categories])
  const [activeCategory, setActiveCategory] = useState('')
  const selectedCategory = activeCategory || categoryNames[0] || 'Genel'
  const activeQuestions = content.categories.find((c) => c.category === selectedCategory)?.questions ?? []

  usePageMeta({ title: content.seoTitle, description: content.seoDescription })

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={content.heroEyebrow}
        title={content.heroTitle}
        description={content.heroDescription}
        image={content.heroImage}
        imageAlt="Woontegra SSS"
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'SSS' }]}
        highlights={[{ title: 'Hızlı yanıtlar' }, { title: 'Kategori bazlı düzen' }]}
      />

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categoryNames.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {activeQuestions.map((item) => (
              <AccordionItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      <SiteCtaSection
        title={content.ctaTitle}
        description={content.ctaDescription}
        buttonText={content.ctaButtonText}
        buttonLink={content.ctaButtonLink}
      />
    </div>
  )
}
