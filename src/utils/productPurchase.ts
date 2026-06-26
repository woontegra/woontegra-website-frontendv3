import type { CartSnapshot } from '@/lib/cartStorage'
import type { ProductType, PublicProductDetail, PublicProductListItem } from '@/types/product'

export type ProductPurchaseFields = Pick<
  PublicProductListItem,
  'purchaseEnabled' | 'price' | 'productType'
>

export function hasValidPrice(product: Pick<PublicProductListItem, 'price'>): boolean {
  return Number.isFinite(product.price) && product.price > 0
}

export function canPurchaseProduct(product: ProductPurchaseFields): boolean {
  if (isFreeDownloadProduct(product)) return false
  if (product.purchaseEnabled === false) return false
  if (!hasValidPrice(product)) return false
  return (
    product.productType === 'DOWNLOAD' ||
    product.productType === 'SAAS' ||
    product.productType === 'SERVICE'
  )
}

/** Ücretsiz indirilebilir masaüstü ürün (satış kapalı, fiyat 0). */
export function isFreeDownloadProduct(product: ProductPurchaseFields): boolean {
  return (
    product.productType === 'DOWNLOAD' &&
    product.purchaseEnabled === false &&
    !hasValidPrice(product)
  )
}

/** Teklif CTA yalnızca satış kapalı veya fiyatsız ürünlerde gösterilir (ücretsiz indirme hariç). */
export function shouldShowQuoteCta(product: ProductPurchaseFields): boolean {
  if (isFreeDownloadProduct(product)) return false
  if (product.purchaseEnabled === false) return true
  return !hasValidPrice(product)
}

export function buildCartSnapshot(
  product: Pick<
    PublicProductListItem,
    'name' | 'slug' | 'price' | 'currency' | 'productType' | 'coverImage' | 'licenseMonths'
  >,
): CartSnapshot {
  return {
    name: product.name,
    slug: product.slug,
    price: product.price,
    currency: product.currency,
    productType: product.productType,
    coverImage: product.coverImage,
    licenseDurationMonths: product.licenseMonths,
  }
}

export function productTypeLabel(productType: ProductType): string {
  switch (productType) {
    case 'DOWNLOAD':
      return 'Masaüstü Program'
    case 'SAAS':
      return 'Çoklu Kullanıcı / SaaS'
    case 'SERVICE':
      return 'Hizmet'
    default:
      return 'Yazılım'
  }
}

export function licenseDisplayLabel(product: PublicProductDetail): string {
  if (product.licenseRequired) return 'Merkezi Lisans'
  const isFree = !Number.isFinite(product.price) || product.price <= 0
  if (isFree && product.purchaseEnabled === false) return 'Ücretsiz'
  if (product.productType === 'SAAS' || product.productType === 'SERVICE') return 'Manuel Teslim'
  return 'Lisanssız'
}

export function isWebProductType(productType: ProductType): boolean {
  return productType === 'SAAS' || productType === 'SERVICE'
}

export function isSaasOrderDeliveryUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.startsWith('saas:')
}

export function formatIbanDisplay(iban: string): string {
  const compact = iban.replace(/\s+/g, '').toUpperCase()
  if (!compact) return iban
  return compact.replace(/(.{4})/g, '$1 ').trim()
}
