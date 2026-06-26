import type { CartPreviewRow } from '@/types/checkout'
import type { CartLine, CartSnapshot } from '@/lib/cartStorage'
import { saasTotalForYears } from '@/utils/formatProductPrice'
import { isSaasSubscriptionProduct, isSingleQuantityProduct } from '@/utils/productPurchase'

export type MergedCartRow = CartPreviewRow & { quantity: number; lineTotal: number }

function snapshotToPreview(line: CartLine, snap: CartSnapshot): CartPreviewRow {
  return {
    id: line.productId,
    name: snap.name,
    slug: snap.slug,
    productType: snap.productType,
    price: snap.price,
    currency: snap.currency || 'TRY',
    coverImage: snap.coverImage,
    hasDownload: snap.productType !== 'SAAS' && snap.productType !== 'SERVICE',
    licenseRequired: snap.licenseRequired,
    singleQuantity: snap.singleQuantity,
  }
}

function lineTotalForRow(base: CartPreviewRow, quantity: number): number {
  if (isSaasSubscriptionProduct(base.productType)) return saasTotalForYears(base.price, quantity)
  return base.price * quantity
}

export function mergedRowIsSingleQuantity(m: MergedCartRow): boolean {
  return isSingleQuantityProduct({
    productType: m.productType,
    licenseRequired: m.licenseRequired,
    singleQuantity: m.singleQuantity,
  })
}

export function mergeCartWithPreview(lines: CartLine[], preview: CartPreviewRow[]): MergedCartRow[] {
  const map = new Map<string, CartPreviewRow>()
  for (const p of preview) {
    map.set(p.id, p)
    for (const k of p.matchKeys ?? []) {
      if (k) map.set(k, p)
    }
  }
  return lines.map((line) => {
    const fromApi = map.get(line.productId)
    const base: CartPreviewRow = fromApi
      ? { ...fromApi }
      : line.snapshot
        ? snapshotToPreview(line, line.snapshot)
        : {
            id: line.productId,
            name: 'Ürün',
            slug: '',
            productType: 'DOWNLOAD',
            price: 0,
            currency: 'TRY',
            coverImage: null,
            hasDownload: true,
          }
    const qty = mergedRowIsSingleQuantity({ ...base, quantity: line.quantity, lineTotal: 0 })
      ? 1
      : line.quantity
    return {
      ...base,
      quantity: qty,
      lineTotal: lineTotalForRow(base, qty),
    }
  })
}
