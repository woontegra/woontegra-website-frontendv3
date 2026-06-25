import { useQuery } from '@tanstack/react-query'

import { BlogCard } from '@/components/site/BlogCard'

import { PageHero } from '@/components/site/PageHero'

import { Card, CardBody } from '@/components/ui/Card'

import { EmptyState } from '@/components/ui/EmptyState'

import { CardGridSkeleton } from '@/components/ui/PageSkeletons'
import { publicQueryOptions } from '@/lib/publicQueryOptions'

import { usePageMeta } from '@/hooks/usePageMeta'

import { blogService } from '@/services/api/blog'

import { getErrorMessage } from '@/services/api/client'



export function BlogListPage() {

  usePageMeta({

    title: 'Blog',

    description: 'Woontegra duyuru, güncelleme ve teknik yazıları.',

  })



  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['blog', 'list'],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })



  return (

    <div>

      <PageHero

        eyebrow="Blog"

        title="Duyurular ve teknik yazılar"

        description="Woontegra ürün güncellemeleri, sektör notları ve kullanım ipuçları."

        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Blog' }]}

      />



      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        {isPending && !data ? <CardGridSkeleton count={6} /> : null}



        {isError ? (

          <Card className="border-red-200 bg-red-50">

            <CardBody>

              <p className="text-sm font-medium text-red-800">Blog yazıları yüklenemedi</p>

              <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>

              <button type="button" onClick={() => void refetch()} className="mt-3 text-sm font-medium text-red-800 underline">

                Tekrar dene

              </button>

            </CardBody>

          </Card>

        ) : null}



        {!isPending && !isError && (!data || data.length === 0) ? (

          <EmptyState title="Henüz blog yazısı yok" description="Yayında blog yazısı bulunamadı." />

        ) : null}



        {data && data.length > 0 ? (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {data.map((post) => (

              <BlogCard key={post.id} post={post} />

            ))}

          </div>

        ) : null}

      </div>

    </div>

  )

}


