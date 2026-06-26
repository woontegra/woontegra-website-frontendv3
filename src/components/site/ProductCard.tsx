import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PublicProductListItem } from '@/types/product'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { SafeImage } from '@/components/ui/SafeImage'
import { addToCart } from '@/lib/cartStorage'
import { formatMoney, hasCompareDiscount } from '@/utils/formatMoney'
import {
  buildCartSnapshot,
  canPurchaseProduct,
  isFreeDownloadProduct,
  productTypeLabel,
  shouldShowQuoteCta,
} from '@/utils/productPurchase'
import { cn } from '@/utils/cn'

type Props = {
  product: PublicProductListItem
}

function licenseListNote(product: PublicProductListItem): string | null {
  if (product.productType === 'DOWNLOAD') return 'Merkezi lisans destekli'
  if (product.productType === 'SAAS') return 'Abonelik / merkezi lisans'
  return null
}

export function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false)
  const [cartMsg, setCartMsg] = useState<string | null>(null)
  const onSale = hasCompareDiscount(product.price, product.compareAtPrice)
  const canPurchase = canPurchaseProduct(product)
  const isFreeDownload = isFreeDownloadProduct(product)
  const showQuote = shouldShowQuoteCta(product)
  const licenseNote = licenseListNote(product)
  const detailHref = `/yazilimlar/${product.slug}`
  const teklifHref = `/iletisim?konu=${encodeURIComponent(`Teklif: ${product.name}`)}`
  const hasPrice = Number.isFinite(product.price) && product.price > 0
  const showFreeLabel = isFreeDownload

  useEffect(() => {
    if (!added && !cartMsg) return
    const t = window.setTimeout(() => {
      setAdded(false)
      setCartMsg(null)
    }, 2000)
    return () => window.clearTimeout(t)
  }, [added, cartMsg])

  const handleAddToCart = () => {
    if (!canPurchase) return
    const result = addToCart(product.id, 1, { snapshot: buildCartSnapshot(product) })
    if (result === 'already_in_cart') {
      setCartMsg('Sepette')
      setAdded(false)
    } else {
      setAdded(true)
      setCartMsg(null)
    }
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-200/80 transition hover:border-brand-200 hover:shadow-lg">
      <Link to={detailHref} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          <SafeImage
            src={product.coverImage}
            alt={product.name}
            className="transition duration-500 group-hover:scale-[1.03]"
            aspectRatio="aspect-[4/3]"
            productPlaceholder
            placeholder
            loading="lazy"
          />
        </div>
      </Link>

      <CardBody className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {product.isFeatured ? <Badge tone="brand">Öne çıkan</Badge> : null}
          <Badge>{productTypeLabel(product.productType)}</Badge>
          {product.category ? <Badge tone="default">{product.category.name}</Badge> : null}
        </div>

        <div className="flex-1">
          <Link to={detailHref}>
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 transition group-hover:text-brand-700">
              {product.name}
            </h3>
          </Link>
          {product.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{product.shortDescription}</p>
          ) : null}
          {licenseNote ? <p className="mt-2 text-xs text-slate-400">{licenseNote}</p> : null}
        </div>

        <div className="flex flex-wrap items-baseline gap-2 border-t border-slate-100 pt-3">
          {showFreeLabel ? (
            <p className="text-xl font-bold text-emerald-700">Ücretsiz</p>
          ) : hasPrice ? (
            <>
              <p className="text-xl font-bold text-slate-900">{formatMoney(product.price, product.currency)}</p>
              {onSale ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatMoney(product.compareAtPrice!, product.currency)}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm font-medium text-slate-500">Fiyat için teklif alın</p>
          )}
        </div>

        <div className={cn('grid gap-2', canPurchase || showQuote || isFreeDownload ? 'grid-cols-2' : 'grid-cols-1')}>
          <Link to={detailHref}>
            <Button variant="secondary" size="sm" className="w-full">
              {isFreeDownload ? 'Detay & İndir' : 'Detay İncele'}
            </Button>
          </Link>
          {canPurchase ? (
            <Button size="sm" className="w-full" onClick={handleAddToCart}>
              {cartMsg ?? (added ? 'Sepete eklendi' : 'Sepete Ekle')}
            </Button>
          ) : showQuote ? (
            <Link to={teklifHref}>
              <Button variant="secondary" size="sm" className="w-full">
                Teklif Al
              </Button>
            </Link>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}
