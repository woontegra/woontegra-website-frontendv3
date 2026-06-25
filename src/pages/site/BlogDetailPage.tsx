import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, User } from 'lucide-react'

import { BlogCard } from '@/components/site/BlogCard'
import { BlogContentRenderer } from '@/components/site/BlogContentRenderer'
import { BlogTableOfContents } from '@/components/site/BlogTableOfContents'
import { PageHero } from '@/components/site/PageHero'
import { SiteCtaSection } from '@/components/site/SiteCtaSection'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useSitePageMeta } from '@/hooks/usePageMeta'
import { blogService } from '@/services/api/blog'
import { getErrorMessage } from '@/services/api/client'
import { formatBlogDate } from '@/types/blog'
import {
  enrichBlogHtml,
  estimateReadingTimeMinutes,
  formatReadingTime,
} from '@/lib/blogReading'
import { resolveMediaUrl } from '@/utils/mediaUrl'

export function BlogDetailPage() {
  const { slug = '' } = useParams()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['blog', 'detail', slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: Boolean(slug.trim()),
  })

  const { data: allPosts } = useQuery({
    queryKey: ['blog', 'list'],
    queryFn: () => blogService.list(),
    enabled: Boolean(data),
  })

  useSitePageMeta({
    title: data?.title,
    description: data?.excerpt || data?.title,
  })

  const enrichedContent = useMemo(
    () => (data?.bodyHtml ? enrichBlogHtml(data.bodyHtml) : { html: '', headings: [] }),
    [data?.bodyHtml],
  )

  const readingMinutes = useMemo(
    () => estimateReadingTimeMinutes(data?.bodyHtml || data?.excerpt || ''),
    [data?.bodyHtml, data?.excerpt],
  )

  const relatedPosts = useMemo(
    () => (allPosts ?? []).filter((post) => post.slug !== slug).slice(0, 3),
    [allPosts, slug],
  )

  if (!slug.trim()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Yazı bulunamadı" description="Geçersiz adres." />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingState label="Yazı yükleniyor…" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm font-medium text-red-800">Yazı bulunamadı</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(error, 'Yazı yüklenemedi')}</p>
            <Link to="/blog" className="mt-3 inline-block text-sm font-medium text-brand-700">
              Blog listesine dön
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  const cover = resolveMediaUrl(data.featuredImage)
  const publishedLabel = formatBlogDate(data.publishedAt || data.createdAt)

  return (
    <article className="bg-slate-50">
      <PageHero
        eyebrow={data.category?.name || 'Blog'}
        title={data.title}
        description={data.excerpt || undefined}
        image={cover}
        imageAlt={data.title}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: data.title },
        ]}
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[78rem] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4 text-sm text-slate-600 sm:px-6 lg:px-8">
          {data.category ? <Badge>{data.category.name}</Badge> : null}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            {publishedLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            {formatReadingTime(readingMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-400" />
            Woontegra
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[78rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1">
            <BlogTableOfContents items={enrichedContent.headings} className="mb-6" />

            {data.bodyHtml ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
                <div className="mx-auto max-w-[52rem]">
                  <BlogContentRenderer html={enrichedContent.html} />
                </div>
              </div>
            ) : (
              <EmptyState
                title="İçerik henüz eklenmemiş"
                description="Bu yazı için detay içerik admin panelden eklenebilir."
              />
            )}
          </div>

          <aside className="hidden w-full shrink-0 lg:block lg:w-72 xl:w-80">
            <div className="sticky top-24">
              <BlogTableOfContents items={enrichedContent.headings} />
            </div>
          </aside>
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">İlgili yazılar</h2>
            <p className="mt-2 text-slate-600">Diğer blog yazılarımıza göz atın.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((post) => (
                <BlogCard key={post.id} post={post} compact />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <SiteCtaSection
        title="Projeniz için teklif alın"
        description="Size özel yazılım, web ve entegrasyon çözümleri için ekibimizle iletişime geçin."
        buttonText="Teklif al"
        buttonLink="/teklif-al"
        secondaryButtonText="İletişim"
        secondaryButtonLink="/iletisim"
      />
    </article>
  )
}
