import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState'
import { ServiceDetailLayout } from '@/components/site/services/ServiceDetailLayout'
import { usePageMeta } from '@/hooks/usePageMeta'
import { pageContentService } from '@/services/api/pageContent'
import { SERVICE_PAGE_CONTENT_KEY } from '@/data/serviceCatalog'
import { SERVICE_DETAIL_BY_SLUG, type ServiceDetailContent } from '@/data/serviceDetailContent'

function deepMergeService(base: ServiceDetailContent, partial: Partial<ServiceDetailContent>): ServiceDetailContent {
  return {
    ...base,
    ...partial,
    hero: { ...base.hero, ...(partial.hero ?? {}) },
    problems: partial.problems?.items?.length
      ? { ...base.problems, ...partial.problems, items: partial.problems.items }
      : base.problems,
    approach: { ...base.approach, ...(partial.approach ?? {}) },
    scope: partial.scope?.items?.length
      ? { ...base.scope, ...partial.scope, items: partial.scope.items }
      : base.scope,
    process: partial.process?.steps?.length
      ? { ...base.process, ...partial.process, steps: partial.process.steps }
      : base.process,
    whyUs: partial.whyUs?.items?.length ? { ...base.whyUs, ...partial.whyUs, items: partial.whyUs.items } : base.whyUs,
    technology: partial.technology?.items?.length
      ? { ...base.technology, ...partial.technology, items: partial.technology.items }
      : base.technology,
    cta: { ...base.cta, ...(partial.cta ?? {}) },
  }
}

export function normalizeServicePages(raw: unknown): Record<string, Partial<ServiceDetailContent & { enabled?: boolean }>> {
  if (!raw || typeof raw !== 'object') return {}
  const row = raw as Record<string, unknown>
  if (row.pages && typeof row.pages === 'object') {
    return row.pages as Record<string, Partial<ServiceDetailContent & { enabled?: boolean }>>
  }
  return row as Record<string, Partial<ServiceDetailContent & { enabled?: boolean }>>
}

export function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const base = SERVICE_DETAIL_BY_SLUG[slug]

  const { data: overrides, isLoading } = useQuery({
    queryKey: ['page-content', SERVICE_PAGE_CONTENT_KEY, slug],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SERVICE_PAGE_CONTENT_KEY)
      const pages = normalizeServicePages(raw)
      return pages[slug] ?? null
    },
    enabled: Boolean(base),
  })

  const content = base ? deepMergeService(base, overrides ?? {}) : null
  const disabled = overrides?.enabled === false

  usePageMeta({
    title: content ? `${content.hero.title} | Woontegra` : 'Hizmet bulunamadı',
    description: content?.hero.description,
  })

  if (!base) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hizmet bulunamadı</h1>
        <Link to="/hizmetler" className="mt-4 inline-block text-emerald-700 hover:underline">
          Hizmetlere dön
        </Link>
      </div>
    )
  }

  if (isLoading && !overrides) return <LoadingState label="Yükleniyor…" />

  if (disabled) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hizmet şu an yayında değil</h1>
        <Link to="/hizmetler" className="mt-4 inline-block text-emerald-700 hover:underline">
          Hizmetlere dön
        </Link>
      </div>
    )
  }

  return <ServiceDetailLayout content={content!} />
}
