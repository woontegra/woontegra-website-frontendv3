import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { Search } from 'lucide-react'

import { ProductCard } from '@/components/site/ProductCard'

import { PageHero } from '@/components/site/PageHero'

import { Card, CardBody } from '@/components/ui/Card'

import { EmptyState } from '@/components/ui/EmptyState'

import { LoadingState } from '@/components/ui/LoadingState'

import { usePageMeta } from '@/hooks/usePageMeta'

import { productsService } from '@/services/api/products'

import { getErrorMessage } from '@/services/api/client'

import type { ProductCategoryBrief, PublicProductListItem } from '@/types/product'

import { cn } from '@/utils/cn'



function extractCategories(products: PublicProductListItem[]): ProductCategoryBrief[] {

  const map = new Map<string, ProductCategoryBrief>()

  for (const p of products) {

    if (p.category) map.set(p.category.id, p.category)

  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'))

}



export function SoftwareListPage() {

  const [params] = useSearchParams()

  const [q, setQ] = useState('')

  const [categorySlug, setCategorySlug] = useState('')

  useEffect(() => {
    const k = params.get('kategori')?.trim()
    if (k) setCategorySlug(k)
  }, [params])



  usePageMeta({

    title: 'Yazılımlar',

    description: 'Woontegra yazılım ürünleri — masaüstü, web ve lisanslı kurumsal çözümler.',

  })



  const { data, isLoading, isError, error, refetch } = useQuery({

    queryKey: ['products', 'list'],

    queryFn: () => productsService.list(),

  })



  const categories = useMemo(() => extractCategories(data ?? []), [data])



  const filtered = useMemo(() => {

    let rows = data ?? []

    const term = q.trim().toLowerCase()

    if (categorySlug) {

      rows = rows.filter((p) => p.category?.slug === categorySlug)

    }

    if (term) {

      rows = rows.filter(

        (p) =>

          p.name.toLowerCase().includes(term) ||

          p.shortDescription.toLowerCase().includes(term) ||

          p.category?.name.toLowerCase().includes(term),

      )

    }

    return rows.slice().sort((a, b) => {

      const fa = a.isFeatured ? 1 : 0

      const fb = b.isFeatured ? 1 : 0

      if (fb !== fa) return fb - fa

      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)

    })

  }, [data, q, categorySlug])



  return (

    <div>

      <PageHero

        eyebrow="Yazılımlar"

        title="Kurumsal yazılım portföyü"

        description="Masaüstü, web ve lisanslı çözümler — güvenli ödeme ve merkezi lisans teslimatı ile."

        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Yazılımlar' }]}

      />



      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative max-w-md flex-1">

            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input

              type="search"

              value={q}

              onChange={(e) => setQ(e.target.value)}

              placeholder="Yazılım ara…"

              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"

            />

          </div>

          {categories.length > 0 ? (

            <div className="flex flex-wrap gap-2">

              <button

                type="button"

                onClick={() => setCategorySlug('')}

                className={cn(

                  'rounded-full px-3 py-1.5 text-xs font-medium transition',

                  !categorySlug ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',

                )}

              >

                Tümü

              </button>

              {categories.map((c) => (

                <button

                  key={c.id}

                  type="button"

                  onClick={() => setCategorySlug(c.slug)}

                  className={cn(

                    'rounded-full px-3 py-1.5 text-xs font-medium transition',

                    categorySlug === c.slug

                      ? 'bg-brand-600 text-white'

                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',

                  )}

                >

                  {c.name}

                </button>

              ))}

            </div>

          ) : null}

        </div>



        {isLoading ? <LoadingState label="Yazılımlar yükleniyor…" /> : null}



        {isError ? (

          <Card className="border-red-200 bg-red-50">

            <CardBody>

              <p className="text-sm font-medium text-red-800">Yazılımlar yüklenemedi</p>

              <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>

              <button type="button" onClick={() => void refetch()} className="mt-3 text-sm font-medium text-red-800 underline">

                Tekrar dene

              </button>

            </CardBody>

          </Card>

        ) : null}



        {!isLoading && !isError && filtered.length === 0 ? (

          <EmptyState

            title={q || categorySlug ? 'Sonuç bulunamadı' : 'Henüz yazılım yok'}

            description={

              q || categorySlug

                ? 'Arama veya filtreyi değiştirmeyi deneyin.'

                : 'Yayında aktif yazılım ürünü bulunamadı.'

            }

          />

        ) : null}



        {filtered.length > 0 ? (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filtered.map((product) => (

              <ProductCard key={product.id} product={product} />

            ))}

          </div>

        ) : null}

      </div>

    </div>

  )

}


