import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState'
import { SolutionDetailLayout } from '@/components/site/solutions/SolutionDetailLayout'
import { DynamicCmsPage } from '@/pages/site/DynamicCmsPage'
import { usePageMeta } from '@/hooks/usePageMeta'
import { pageContentService } from '@/services/api/pageContent'
import {
  getSolutionBySlug,
  SOLUTION_DETAIL_BY_SLUG,
  SOLUTION_PAGE_CONTENT_KEY,
  type SolutionDetailContent,
} from '@/data/solutionCatalog'

export function normalizeSolutionPages(raw: unknown): Record<string, Partial<SolutionDetailContent>> {
  if (!raw || typeof raw !== 'object') return {}
  const row = raw as Record<string, unknown>
  if (row.pages && typeof row.pages === 'object') return row.pages as Record<string, Partial<SolutionDetailContent>>
  return row as Record<string, Partial<SolutionDetailContent>>
}

function mergeSolution(base: SolutionDetailContent, partial: Partial<SolutionDetailContent>): SolutionDetailContent {
  return {
    ...base,
    ...partial,
    title: partial.title?.trim() || base.title,
    description: partial.description?.trim() || base.description,
    seoTitle: partial.seoTitle?.trim() || base.seoTitle,
    seoDescription: partial.seoDescription?.trim() || base.seoDescription,
  }
}

export function SolutionDetailPage() {
  const { slug = '' } = useParams()
  const base = SOLUTION_DETAIL_BY_SLUG[slug]

  const { data: overrides, isLoading } = useQuery({
    queryKey: ['page-content', SOLUTION_PAGE_CONTENT_KEY, slug],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SOLUTION_PAGE_CONTENT_KEY)
      const pages = normalizeSolutionPages(raw)
      return pages[slug] ?? null
    },
    enabled: Boolean(base),
  })

  const content = base ? mergeSolution(base, overrides ?? {}) : null
  const disabled = content?.enabled === false

  usePageMeta({
    title: content?.seoTitle ?? (base ? `${base.title} | Woontegra` : 'Çözüm'),
    description: content?.seoDescription ?? content?.description,
  })

  if (!base) {
    return <DynamicCmsPage slugOverride={slug} />
  }

  if (isLoading && !overrides) return <LoadingState label="Yükleniyor…" />

  if (disabled) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Çözüm şu an yayında değil</h1>
        <Link to="/cozumler" className="mt-4 inline-block text-emerald-700 hover:underline">
          Çözümlere dön
        </Link>
      </div>
    )
  }

  return <SolutionDetailLayout content={content!} />
}

export { getSolutionBySlug }
