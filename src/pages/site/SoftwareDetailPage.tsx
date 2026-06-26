import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  KeyRound,
  Mail,
  Monitor,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductDetailSkeleton } from '@/components/ui/PageSkeletons'
import { PageHero } from '@/components/site/PageHero'
import { useSitePageMeta } from '@/hooks/usePageMeta'
import { productsService } from '@/services/api/products'
import { getErrorMessage } from '@/services/api/client'
import { formatProductDisplayPrice } from '@/utils/formatProductPrice'
import { formatMoney, hasCompareDiscount } from '@/utils/formatMoney'
import { addToCart } from '@/lib/cartStorage'
import {
  buildCartSnapshot,
  canPurchaseProduct,
  hasValidPrice,
  isFreeDownloadProduct,
  isSaasSubscriptionProduct,
  licenseDisplayLabel,
  productTypeLabel,
  shouldShowQuoteCta,
} from '@/utils/productPurchase'
import { SafeImage } from '@/components/ui/SafeImage'
import { resolveMediaUrl } from '@/lib/resolveMediaUrl'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { ProductFreeDownloadButton } from '@/components/site/ProductFreeDownloadButton'
import { getPublicProductDownloadFiles } from '@/lib/freeProductDownload'

const TYPE_LEAD = {
  DOWNLOAD:
    'Masaüstü kullanım için hazırlanmış yazılım. Satın alma sonrası lisans ve teslimat bilgileri e-posta ile iletilir.',
  SAAS: 'Çoklu kullanıcı / abonelik yapısına uygun yazılım hizmeti.',
  SERVICE: 'Woontegra tarafından sunulan hizmet.',
} as const

export function SoftwareDetailPage() {
  const { slug = '' } = useParams()
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [webUsageYears, setWebUsageYears] = useState(1)
  const [toast, setToast] = useState<string | null>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['products', 'detail', slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: Boolean(slug.trim()),
    ...publicQueryOptions,
  })

  const gallery = useMemo(() => {
    if (!data) return [] as string[]
    const cover = resolveMediaUrl(data.coverImage, { placeholder: true, productPlaceholder: true })
    const fromGallery = (data.galleryImages ?? [])
      .map((g) => resolveMediaUrl(g.url, { productPlaceholder: true }))
      .filter(Boolean)
    return [cover, ...fromGallery].filter((url, i, arr) => url && arr.indexOf(url) === i)
  }, [data])

  const heroImage = activeImage || gallery[0] || resolveMediaUrl(null, { placeholder: true, productPlaceholder: true })
  const bullets = (data?.featureBullets ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const isSaasProduct = data ? isSaasSubscriptionProduct(data.productType) : false
  const isFreeDownload = data ? isFreeDownloadProduct(data) : false
  const publicDownloadFiles = data ? getPublicProductDownloadFiles(data) : []
  const canPurchase = data ? canPurchaseProduct(data) : false
  const onSale = data ? hasCompareDiscount(data.price, data.compareAtPrice) : false

  const priceDisplay = data
    ? formatProductDisplayPrice(data.price, data.currency, data.productType, isSaasProduct ? webUsageYears : 1, {
        purchaseEnabled: data.purchaseEnabled,
      })
    : null


  const compareDisplay =
    data && onSale
      ? isSaasProduct && webUsageYears > 1
        ? formatMoney(data.compareAtPrice! * webUsageYears, data.currency)
        : formatMoney(data.compareAtPrice!, data.currency)
      : null

  const teklifHref = data
    ? `/iletisim?konu=${encodeURIComponent(`Teklif: ${data.name}`)}`
    : '/iletisim'

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  useSitePageMeta({
    title: data?.seoTitle || data?.name,
    description: data?.seoDescription || data?.shortDescription || undefined,
  })

  const handleAddToCart = () => {
    if (!data || !canPurchase) return
    const snapshot = buildCartSnapshot(data)
    if (isSaasProduct) {
      addToCart(data.id, webUsageYears, { snapshot, replaceLine: true })
      setToast('Ürün sepete eklendi.')
      return
    }
    const result = addToCart(data.id, 1, { snapshot, replaceLine: true })
    setToast(result === 'already_in_cart' ? 'Bu ürün zaten sepetinizde.' : 'Ürün sepete eklendi.')
  }

  if (!slug.trim()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="Yazılım bulunamadı" description="Geçersiz adres." />
      </div>
    )
  }

  if (isPending && !data) {
    return <ProductDetailSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm font-medium text-red-800">Yazılım bulunamadı</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(error, 'Yazılım yüklenemedi')}</p>
            <Link to="/yazilimlar" className="mt-3 inline-block text-sm font-medium text-brand-700">
              Yazılımlara dön
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  const lead = data.shortDescription?.trim() || TYPE_LEAD[data.productType]
  const showQuote = shouldShowQuoteCta(data)

  return (
    <>
      <div className="bg-white">
        <PageHero
          eyebrow="Yazılım"
          title={data.name}
          description={lead}
          breadcrumbs={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Yazılımlar', href: '/yazilimlar' },
            { label: data.name },
          ]}
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <SafeImage
              src={heroImage}
              alt={data.name}
              loading="eager"
              productPlaceholder
              placeholder
              aspectRatio="aspect-[4/3]"
              wrapperClassName="rounded-2xl"
            />
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {gallery.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`overflow-hidden rounded-lg border ${heroImage === url ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}`}
                >
                  <SafeImage src={url} alt="" aspectRatio="aspect-square" productPlaceholder placeholder loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-2">
            <Badge tone="default">{productTypeLabel(data.productType)}</Badge>
            <Badge tone="brand">{licenseDisplayLabel(data)}</Badge>
            {data.isFeatured ? <Badge tone="brand">Öne çıkan</Badge> : null}
            {isFreeDownload ? <Badge tone="success">Ücretsiz</Badge> : null}
            {data.purchaseEnabled === false && !isFreeDownload ? (
              <Badge tone="warning">Satış kapalı</Badge>
            ) : null}
            {data.category ? <Badge>{data.category.name}</Badge> : null}
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl sr-only">{data.name}</h2>
          <p className="mt-3 text-base text-slate-600 sr-only">{lead}</p>

          {data.productType === 'DOWNLOAD' && data.version?.trim() ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
              <Monitor className="h-4 w-4" />
              Sürüm: {data.version.trim()}
            </p>
          ) : null}

          <Card className="mt-6 border-emerald-100 shadow-sm">
            <CardBody className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                {isFreeDownload ? 'Ücretsiz indirme' : 'Satın alma'}
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-3xl font-bold text-emerald-700">{priceDisplay?.main}</span>
                {priceDisplay?.period ? (
                  <span className="text-sm font-medium text-slate-500">{priceDisplay.period}</span>
                ) : null}
                {compareDisplay ? (
                  <span className="text-lg text-slate-400 line-through">{compareDisplay}</span>
                ) : null}
              </div>
              {priceDisplay?.hint ? <p className="text-sm text-slate-500">{priceDisplay.hint}</p> : null}

              {data.licenseRequired ? (
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 shrink-0 text-emerald-600" />
                    Merkezi lisans — Woontegra Lisans Server üzerinden yönetilir; ödeme sonrası e-posta ile iletilir
                  </li>
                  {data.licenseDays != null && data.licenseDays > 0 ? (
                    <li>Lisans süresi: {data.licenseDays} gün</li>
                  ) : null}
                  {data.licenseMaxDevices != null && data.licenseMaxDevices > 0 ? (
                    <li>Cihaz hakkı: {data.licenseMaxDevices}</li>
                  ) : null}
                  {data.licenseMonths != null && data.licenseMonths > 0 && isSaasProduct ? (
                    <li>Abonelik dönemi: {data.licenseMonths} ay / yıl</li>
                  ) : null}
                </ul>
              ) : null}

              {data.licenseRequired ? (
                <p className="text-xs text-slate-500">
                  Lisans merkezi Woontegra Lisans Server üzerinden yönetilir; website içinde lisans üretilmez.
                </p>
              ) : null}

              {data.productType === 'DOWNLOAD' && data.hasDownload && !isFreeDownload ? (
                <ul className="space-y-1 text-sm leading-relaxed text-slate-600">
                  <li>Ödeme sonrası indirme bilgileri e-posta ile gönderilir.</li>
                  <li>
                    <Link to="/hesabim/siparisler" className="font-medium text-brand-700 hover:underline">
                      Müşteri hesabınızdan
                    </Link>{' '}
                    sipariş ve indirme bilgilerinize ulaşabilirsiniz.
                  </li>
                </ul>
              ) : null}

              {isSaasProduct && canPurchase ? (
                <div className="space-y-2">
                  <label htmlFor="web-years" className="block text-sm font-medium text-slate-800">
                    Kullanım süresi
                  </label>
                  <select
                    id="web-years"
                    value={webUsageYears}
                    onChange={(e) => setWebUsageYears(Number(e.target.value))}
                    className="h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
                      <option key={y} value={y}>
                        {y} yıl ({(data.licenseMonths ?? 12) * y} ay)
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {isFreeDownload && !data.licenseRequired ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
                  Ücretsiz Windows aracıdır. Verileriniz bilgisayarınızda kalır; Woontegra sunucularına
                  gönderilmez. Ana şifre unutulursa kayıtlar kurtarılamaz.
                </p>
              ) : null}

              {!canPurchase && !isFreeDownload ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {data.purchaseEnabled === false
                    ? 'Bu yazılım şu anda satın almaya kapalıdır.'
                    : !hasValidPrice(data)
                      ? 'Fiyat tanımlı değil; online satın alma kullanılamıyor.'
                      : 'Bu yazılım için satın alma şu an kullanılamıyor.'}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {isFreeDownload && publicDownloadFiles.length > 0
                  ? publicDownloadFiles.map((file) => (
                      <ProductFreeDownloadButton key={`${file.type ?? file.label}-${file.downloadPath}`} file={file} />
                    ))
                  : null}
                {canPurchase ? (
                  <Button className="min-w-[160px]" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4" />
                    Sepete Ekle
                  </Button>
                ) : null}
                {showQuote ? (
                  <Link to={teklifHref}>
                    <Button variant="secondary" className="min-w-[160px]">
                      <Mail className="h-4 w-4" />
                      Teklif Al
                    </Button>
                  </Link>
                ) : null}
              </div>

              {canPurchase ? (
                <p className="flex items-start gap-2 text-xs text-slate-500">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
                  Ödeme PayTR veya Havale/EFT ile alınır. Teslimat bilgileri onay sonrası e-posta ile gönderilir.
                </p>
              ) : null}
            </CardBody>
          </Card>

          {bullets.length > 0 ? (
            <Card className="mt-6">
              <CardBody>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Özellikler</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {bullets.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-brand-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>

          {data.description ? (
            <section className="mt-12 border-t border-slate-200 pt-10">
              <h2 className="text-xl font-semibold text-slate-900">Açıklama</h2>
              <div className="prose prose-slate mt-4 max-w-none whitespace-pre-line text-slate-700">{data.description}</div>
            </section>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  )
}
