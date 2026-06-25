import { Link, useParams } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { PageHero } from '@/components/site/PageHero'

import { Badge } from '@/components/ui/Badge'

import { Card, CardBody } from '@/components/ui/Card'

import { EmptyState } from '@/components/ui/EmptyState'

import { LoadingState } from '@/components/ui/LoadingState'

import { useSitePageMeta } from '@/hooks/usePageMeta'

import { blogService } from '@/services/api/blog'

import { getErrorMessage } from '@/services/api/client'

import { formatBlogDate } from '@/types/blog'

import { resolveMediaUrl } from '@/utils/mediaUrl'



export function BlogDetailPage() {

  const { slug = '' } = useParams()



  const { data, isLoading, isError, error } = useQuery({

    queryKey: ['blog', 'detail', slug],

    queryFn: () => blogService.getBySlug(slug),

    enabled: Boolean(slug.trim()),

  })



  useSitePageMeta({
    title: data?.title,
    description: data?.excerpt || data?.title,
  })



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

  const isHtml = /<[a-z][\s\S]*>/i.test(data.bodyHtml)



  return (

    <article className="bg-white">

      <PageHero
        eyebrow="Blog"
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

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {data.category ? <Badge>{data.category.name}</Badge> : null}
          <span className="text-sm text-slate-500">{formatBlogDate(data.publishedAt || data.createdAt)}</span>
        </div>

        {data.bodyHtml ? (

          <div className="mt-10">

            {isHtml ? (

              <div

                className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-brand-700"

                dangerouslySetInnerHTML={{ __html: data.bodyHtml }}

              />

            ) : (

              <div className="whitespace-pre-line text-base leading-relaxed text-slate-700">{data.bodyHtml}</div>

            )}

          </div>

        ) : (

          <EmptyState

            className="mt-10"

            title="İçerik henüz eklenmemiş"

            description="Bu yazı için detay içerik admin panelden eklenebilir."

          />

        )}

      </div>

    </article>

  )

}


