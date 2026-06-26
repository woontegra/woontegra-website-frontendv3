import type { ProductType } from '@/types/product'
import { isSaasSubscriptionProduct, isSingleQuantityProduct } from '@/utils/productPurchase'

const CART_KEY_V1 = 'woontegra_cart_v1'
const CART_KEY = 'woontegra_cart_v2'

export type CartSnapshot = {
  name: string
  slug: string
  price: number
  currency: string
  productType: ProductType
  coverImage: string | null
  licenseDurationMonths?: number
  licenseRequired?: boolean
  singleQuantity?: boolean
}

export type CartLine = {
  productId: string
  quantity: number
  snapshot?: CartSnapshot
}

export type AddToCartResult = 'added' | 'already_in_cart'

export function alignCartLinesToCanonicalProductIds(
  lines: CartLine[],
  preview: { id: string; matchKeys?: string[]; licenseRequired?: boolean; singleQuantity?: boolean }[],
): CartLine[] {
  if (preview.length === 0) return lines
  const rawToCanonical = new Map<string, string>()
  const previewById = new Map(preview.map((p) => [p.id, p]))
  for (const p of preview) {
    rawToCanonical.set(p.id, p.id)
    for (const k of p.matchKeys ?? []) {
      if (k) rawToCanonical.set(k, p.id)
    }
  }
  return lines.map((l) => {
    const cid = rawToCanonical.get(l.productId)
    const canonicalId = cid && cid !== l.productId ? cid : l.productId
    const pv = previewById.get(canonicalId)
    const snap = l.snapshot
      ? {
          ...l.snapshot,
          licenseRequired: pv?.licenseRequired ?? l.snapshot.licenseRequired,
          singleQuantity:
            pv?.singleQuantity ??
            l.snapshot.singleQuantity ??
            isSingleQuantityProduct({
              productType: l.snapshot.productType,
              licenseRequired: pv?.licenseRequired ?? l.snapshot.licenseRequired,
            }),
        }
      : l.snapshot
    const line: CartLine = {
      productId: canonicalId,
      quantity: l.quantity,
      snapshot: snap,
    }
    return { ...line, quantity: clampQuantity(line, line.quantity) }
  })
}

export type AddToCartOptions = {
  snapshot?: CartSnapshot
  replaceLine?: boolean
}

function lineIsSingleQuantity(line: Pick<CartLine, 'snapshot'>): boolean {
  const snap = line.snapshot
  if (!snap) return false
  return isSingleQuantityProduct({
    productType: snap.productType,
    licenseRequired: snap.licenseRequired,
    singleQuantity: snap.singleQuantity,
  })
}

export function maxQuantityForLine(line: Pick<CartLine, 'snapshot'>): number {
  if (lineIsSingleQuantity(line)) return 1
  if (isSaasSubscriptionProduct(line.snapshot?.productType ?? 'DOWNLOAD')) return 10
  return 99
}

function clampQuantity(line: Pick<CartLine, 'snapshot'>, q: number): number {
  const maxQ = maxQuantityForLine(line)
  return Math.min(maxQ, Math.max(1, Math.floor(q) || 1))
}

function parseSnapshot(o: Record<string, unknown>): CartSnapshot | undefined {
  const snap = o.snapshot
  if (!snap || typeof snap !== 'object') return undefined
  const s = snap as Record<string, unknown>
  const name = String(s.name ?? '').trim()
  const slug = String(s.slug ?? '').trim()
  if (!name) return undefined
  const pt = s.productType
  const productType: ProductType =
    pt === 'SAAS' || pt === 'DOWNLOAD' || pt === 'SERVICE' ? pt : 'DOWNLOAD'
  const price = Number(s.price)
  const currency = String(s.currency ?? 'TRY').trim() || 'TRY'
  const coverRaw = s.coverImage
  const coverImage = typeof coverRaw === 'string' && coverRaw.trim() ? coverRaw.trim() : null
  const lm = s.licenseDurationMonths
  const licenseDurationMonths =
    typeof lm === 'number' && Number.isFinite(lm) ? lm : typeof lm === 'string' && lm.trim() ? Number(lm) : undefined
  const licenseRequired = typeof s.licenseRequired === 'boolean' ? s.licenseRequired : undefined
  const singleQuantity =
    typeof s.singleQuantity === 'boolean'
      ? s.singleQuantity
      : isSingleQuantityProduct({ productType, licenseRequired })
  return {
    name,
    slug,
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    currency,
    productType,
    coverImage,
    licenseDurationMonths: Number.isFinite(licenseDurationMonths) ? licenseDurationMonths : undefined,
    licenseRequired,
    singleQuantity,
  }
}

function parseCartArray(parsed: unknown): CartLine[] {
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((x) => {
      if (!x || typeof x !== 'object') return null
      const o = x as Record<string, unknown>
      const productId = String(o.productId ?? '').trim()
      if (!productId) return null
      const snapshot = parseSnapshot(o)
      const tmpLine: CartLine = { productId, quantity: 1, snapshot }
      const q = clampQuantity(tmpLine, Number(o.quantity))
      return { productId, quantity: q, snapshot }
    })
    .filter(Boolean) as CartLine[]
}

export function readCart(): CartLine[] {
  try {
    let raw = localStorage.getItem(CART_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(CART_KEY_V1)
      if (!legacy) return []
      const lines = parseCartArray(JSON.parse(legacy) as unknown)
      writeCart(lines)
      localStorage.removeItem(CART_KEY_V1)
      return lines
    }
    return parseCartArray(JSON.parse(raw) as unknown)
  } catch {
    return []
  }
}

export function writeCart(lines: CartLine[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
  localStorage.removeItem(CART_KEY_V1)
  window.dispatchEvent(new Event('woontegra-cart'))
}

export function isProductInCart(productId: string): boolean {
  const id = productId.trim()
  return readCart().some((l) => l.productId === id)
}

export function addToCart(productId: string, quantity = 1, options?: AddToCartOptions): AddToCartResult {
  const id = productId.trim()
  if (!id) return 'added'
  const lines = readCart()
  const idx = lines.findIndex((l) => l.productId === id)
  const mergedSnap = idx >= 0 ? options?.snapshot ?? lines[idx].snapshot : options?.snapshot
  const draft: CartLine = { productId: id, quantity: 1, snapshot: mergedSnap }
  const singleQty = lineIsSingleQuantity(draft)

  if (idx >= 0 && singleQty) {
    lines[idx] = {
      productId: id,
      quantity: 1,
      snapshot: mergedSnap,
    }
    writeCart(lines)
    window.dispatchEvent(new Event('woontegra-cart'))
    return 'already_in_cart'
  }

  if (idx >= 0) {
    const replace = options?.replaceLine === true
    const rawTarget = replace ? quantity : lines[idx].quantity + quantity
    const newQty = clampQuantity(draft, rawTarget)
    lines[idx] = { productId: id, quantity: newQty, snapshot: mergedSnap }
  } else {
    const newQty = clampQuantity(draft, quantity)
    lines.push({ productId: id, quantity: newQty, snapshot: options?.snapshot })
  }
  writeCart(lines)
  window.dispatchEvent(new Event('woontegra-cart'))
  return 'added'
}

export function setLineQuantity(productId: string, quantity: number): void {
  const lines = readCart().map((l) => {
    if (l.productId !== productId) return l
    return { ...l, quantity: clampQuantity(l, quantity) }
  })
  writeCart(lines)
  window.dispatchEvent(new Event('woontegra-cart'))
}

export function removeFromCart(productId: string): void {
  writeCart(readCart().filter((l) => l.productId !== productId))
  window.dispatchEvent(new Event('woontegra-cart'))
}

export function cartItemCount(): number {
  return readCart().reduce((s, l) => s + l.quantity, 0)
}
