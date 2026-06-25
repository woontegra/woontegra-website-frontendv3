import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/site/ProductCard'
import { PageHero } from '@/components/site/PageHero'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getErrorMessage } from '@/services/api/client'
import { publicProductCategoriesService } from '@/services/api/publicProductCategories'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const [q, setQ] = useState('')

  const categoryQuery = useQuery({
    queryKey: ['product-categories', 'public', slug],
    queryFn: () => publicProductCategoriesService.getBySlug(slug),
    enabled: Boolean(slug.trim()),
  })

  const productsQuery = useQuery({
    queryKey: ['product-categories', 'products', slug],
    queryFn: () => publicProductCategoriesService.listProducts(slug),
    enabled: Boolean(slug.trim()),
  })

  const category = categoryQuery.data
  const title = category?.name || slug

  usePageMeta({
    title,
    description: category?.description || `${title} kategorisindeki ürünler`,
  })

  const filtered = useMemo(() => {
    const rows = productsQuery.data ?? []
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term),
    )
  }, [productsQuery.data, q])

  if (!slug.trim()) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <EmptyState title="Kategori bulunamadı" description="Geçersiz kategori adresi." />
      </div>
    )
  }

  const isLoading = categoryQuery.isLoading || productsQuery.isLoading
  const isError = categoryQuery.isError || productsQuery.isError
  const notFound = !isLoading && !category

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Kategori"
        title={title}
        description={category?.description || 'Bu kategorideki ürünleri inceleyin.'}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <Card className="mb-8">
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ürün ara…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <p className="text-sm text-slate-500">{filtered.length} ürün</p>
          </CardBody>
        </Card>

        {isLoading ? <LoadingState label="Ürünler yükleniyor…" /> : null}

        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-800">
                {getErrorMessage(productsQuery.error ?? categoryQuery.error, 'Kategori yüklenemedi')}
              </p>
            </CardBody>
          </Card>
        ) : null}

        {notFound ? (
          <EmptyState
            title="Kategori bulunamadı"
            description="Bu kategori yayından kaldırılmış veya mevcut değil."
            action={
              <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
                Ana sayfaya dön
              </Link>
            }
          />
        ) : null}

        {!isLoading && !isError && category && filtered.length === 0 ? (
          <EmptyState
            title="Bu kategoride ürün yok"
            description="Henüz bu kategoriye atanmış yayında ürün bulunmuyor."
          />
        ) : null}

        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
