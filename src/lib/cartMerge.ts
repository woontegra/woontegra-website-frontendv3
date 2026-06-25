import type { CartPreviewRow } from '@/types/checkout'
import type { CartLine, CartSnapshot } from '@/lib/cartStorage'
import { saasTotalForYears } from '@/utils/formatProductPrice'
import { isWebProductType } from '@/utils/productPurchase'

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
  }
}

function lineTotalForRow(base: CartPreviewRow, quantity: number): number {
  if (isWebProductType(base.productType)) return saasTotalForYears(base.price, quantity)
  return base.price * quantity
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
    return {
      ...base,
      quantity: line.quantity,
      lineTotal: lineTotalForRow(base, line.quantity),
    }
  })
}
