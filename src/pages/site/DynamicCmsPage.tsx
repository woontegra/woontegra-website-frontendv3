import { useEffect, useState } from 'react'

import { Link, Navigate, useParams } from 'react-router-dom'

import { PageHeroSkeleton, ArticleContentSkeleton } from '@/components/ui/PageSkeletons'

import { PageHero } from '@/components/site/PageHero'

import { usePageMeta } from '@/hooks/usePageMeta'

import { isReservedCmsSlug } from '@/lib/cmsReservedSlugs'
import { canonicalServicePath, isKnownServiceSlug } from '@/lib/serviceSlugs'

import { cmsPagesPublicService, type PublicCmsPage } from '@/services/api/cmsPagesPublic'



type Props = {

  slugOverride?: string

}



export function DynamicCmsPage({ slugOverride }: Props = {}) {

  const params = useParams()

  const slug = slugOverride ?? params.slug ?? ''

  const reserved = isReservedCmsSlug(slug)
  const serviceSlug = slug.trim().toLowerCase()

  const [page, setPage] = useState<PublicCmsPage | null>(null)

  const [loading, setLoading] = useState(true)

  const [notFound, setNotFound] = useState(false)



  useEffect(() => {

    if (!slug || reserved || isKnownServiceSlug(serviceSlug)) {

      setLoading(false)

      return

    }

    setLoading(true)

    setNotFound(false)

    void cmsPagesPublicService

      .getBySlug(slug)

      .then((data) => {

        if (!data) setNotFound(true)

        else setPage(data)

      })

      .catch(() => setNotFound(true))

      .finally(() => setLoading(false))

  }, [slug, reserved, serviceSlug])



  usePageMeta({

    title: page?.title || 'Sayfa',

    description: page?.title,

  })



  if (isKnownServiceSlug(serviceSlug)) {
    return <Navigate to={canonicalServicePath(serviceSlug)} replace />
  }

  if (reserved) {

    return <Navigate to={`/${slug}`} replace />

  }



  if (loading) {
    return (
      <div>
        <PageHeroSkeleton />
        <ArticleContentSkeleton />
      </div>
    )
  }



  if (notFound || !page) {

    return (

      <div className="mx-auto max-w-3xl px-4 py-20 text-center">

        <h1 className="text-2xl font-semibold text-slate-900">Sayfa bulunamadı</h1>

        <p className="mt-2 text-sm text-slate-600">Bu adres yayında değil veya henüz oluşturulmamış.</p>

        <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">

          Ana sayfaya dön

        </Link>

      </div>

    )

  }



  return (

    <div>

      <PageHero

        eyebrow="Sayfa"

        title={page.title}

        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: page.title }]}

      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

        <div

          className="legal-prose prose prose-slate max-w-none text-slate-800"

          dangerouslySetInnerHTML={{ __html: page.content }}

        />

      </div>

    </div>

  )

}


