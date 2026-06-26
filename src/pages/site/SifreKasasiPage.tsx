import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardBody } from '@/components/ui/Card'
import { PageHero } from '@/components/site/PageHero'
import { SafeImage } from '@/components/ui/SafeImage'
import { useSitePageMeta } from '@/hooks/usePageMeta'
import { productsService } from '@/services/api/products'
import { ProductFreeDownloadButton } from '@/components/site/ProductFreeDownloadButton'
import { getPublicProductDownloadFiles } from '@/lib/freeProductDownload'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { resolveMediaUrl } from '@/lib/resolveMediaUrl'

const DEFAULT_SCREENSHOT = '/images/woontegra-sifre-kasasi-ekran.png'
const PRODUCT_SLUG = 'sifre-kasasi'

export function SifreKasasiPage() {
  useSitePageMeta({
    title: 'Woontegra Şifre Kasası | Ücretsiz Araç',
    description: 'Windows için ücretsiz masaüstü şifre kasası.',
  })

  const { data: product } = useQuery({
    queryKey: ['products', 'detail', PRODUCT_SLUG],
    queryFn: () => productsService.getBySlug(PRODUCT_SLUG),
    ...publicQueryOptions,
  })

  const downloadFiles = product ? getPublicProductDownloadFiles(product) : []
  const bullets = (product?.featureBullets ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
  <div className="bg-white">
    <PageHero
      eyebrow="Ücretsiz Araç"
      title={product?.name ?? 'Woontegra Şifre Kasası'}
      description={
        product?.shortDescription ??
        'Windows için ücretsiz masaüstü şifre kasası. Veriler bilgisayarınızda kalır.'
      }
      breadcrumbs={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Ücretsiz Araçlar', href: '/ucretsiz-araclar' },
        { label: 'Şifre Kasası' },
      ]}
    />

    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <SafeImage
          src={resolveMediaUrl(product?.coverImage, { placeholder: true }) || DEFAULT_SCREENSHOT}
          alt="Woontegra Şifre Kasası"
          aspectRatio="aspect-[4/3]"
          wrapperClassName="rounded-2xl border border-slate-200"
        />

        <Card>
          <CardBody className="space-y-4">
            <p className="text-3xl font-bold text-emerald-700">Ücretsiz</p>
            {product?.version ? <p className="text-sm text-slate-500">Sürüm {product.version}</p> : null}
            <p className="text-sm text-slate-600">
              Veriler kullanıcının kendi bilgisayarında saklanır. Woontegra sunucularına gönderilmez. Ana şifre
              unutulursa kayıtlar kurtarılamaz.
            </p>
            <div className="flex flex-wrap gap-3">
              {downloadFiles.map((file) => (
                <ProductFreeDownloadButton key={`${file.type ?? file.label}-${file.downloadPath}`} file={file} />
              ))}
            </div>
            <Link to={`/yazilimlar/${PRODUCT_SLUG}`} className="text-sm font-medium text-brand-700 hover:underline">
              Ürün detay sayfasına git
            </Link>
          </CardBody>
        </Card>
      </div>

      {bullets.length > 0 ? (
        <Card className="mt-8">
          <CardBody>
            <h2 className="text-lg font-semibold text-slate-900">Öne çıkan özellikler</h2>
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

      {product?.description ? (
        <section className="mt-8 whitespace-pre-line text-sm leading-relaxed text-slate-700">{product.description}</section>
      ) : null}
    </div>
  </div>
  )
}
