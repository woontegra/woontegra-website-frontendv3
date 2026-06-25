import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Headphones, Mail, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react'
import { SafeImage } from '@/components/ui/SafeImage'
import { checkoutService } from '@/services/api/checkout'
import { productPricePeriodSuffix } from '@/utils/formatProductPrice'
import { formatMoney } from '@/utils/formatMoney'
import {
  alignCartLinesToCanonicalProductIds,
  readCart,
  removeFromCart,
  setLineQuantity,
  writeCart,
  type CartLine,
} from '@/lib/cartStorage'
import { mergeCartWithPreview, type MergedCartRow } from '@/lib/cartMerge'

const PAGE_WRAP = 'min-h-[calc(100vh-12rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50/90 pb-16 pt-8 sm:pb-20 sm:pt-10'
const CONTAINER = 'mx-auto w-full max-w-[1160px] px-4 sm:px-6 lg:px-8'

function isWebBasedRow(m: MergedCartRow): boolean {
  return m.productType === 'SAAS' || m.productType === 'SERVICE'
}

function CartLineImage({ coverImage, name }: { coverImage: string | null; name: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200/80 sm:aspect-square sm:h-36 sm:w-36 sm:shrink-0">
      {coverImage ? (
        <SafeImage src={coverImage} alt="" className="h-full w-full object-cover" aspectRatio="aspect-auto h-full" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center">
          <ShoppingBag className="h-10 w-10 text-slate-400" aria-hidden />
          <span className="text-xs font-medium text-slate-500">Görsel hazırlanıyor</span>
        </div>
      )}
      <span className="sr-only">{name}</span>
    </div>
  )
}

function QuantityControl({
  id,
  value,
  min,
  max,
  label,
  onChange,
}: {
  id: string
  value: number
  min: number
  max: number
  label: string
  onChange: (n: number) => void
}) {
  const bump = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta))
    if (next !== value) onChange(next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="inline-flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
        <button
          type="button"
          aria-label="Azalt"
          disabled={value <= min}
          onClick={() => bump(-1)}
          className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const raw = Number(e.target.value)
            if (!Number.isFinite(raw)) return
            onChange(Math.min(max, Math.max(min, Math.floor(raw) || min)))
          }}
          className="h-11 w-14 border-x border-slate-200 bg-slate-50/50 text-center text-sm font-semibold tabular-nums text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/25"
        />
        <button
          type="button"
          aria-label="Artır"
          disabled={value >= max}
          onClick={() => bump(1)}
          className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function CartPage() {
  const [lines, setLines] = useState<CartLine[]>(() => readCart())
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof checkoutService.cartPreview>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const productIds = useMemo(() => lines.map((l) => l.productId), [lines])

  useEffect(() => {
    const sync = () => setLines(readCart())
    sync()
    window.addEventListener('woontegra-cart', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('woontegra-cart', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (productIds.length === 0) {
      setPreview([])
      setLoading(false)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        const data = await checkoutService.cartPreview(productIds)
        if (!cancelled) {
          setLines((prev) => {
            const aligned = alignCartLinesToCanonicalProductIds(prev, data)
            const changed = aligned.some((l, i) => l.productId !== prev[i]?.productId)
            if (changed) {
              writeCart(aligned)
              Promise.resolve().then(() => window.dispatchEvent(new Event('woontegra-cart')))
              return aligned
            }
            return prev
          })
          setPreview(data)
          setError(null)
        }
      } catch {
        if (!cancelled) setError('Güncel ürün bilgisi alınamadı; sepetiniz kayıtlı bilgilerle gösteriliyor.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productIds.join(',')])

  const merged = useMemo(() => mergeCartWithPreview(lines, preview), [lines, preview])

  const grand = merged.reduce((s, m) => s + m.lineTotal, 0)
  const currency = merged[0]?.currency || lines[0]?.snapshot?.currency || 'TRY'
  const orderTotal = grand

  const hasWeb = merged.some(isWebBasedRow)
  const hasDesktop = merged.some((m) => m.productType === 'DOWNLOAD')

  const updateQty = (productId: string, q: number) => {
    const row = merged.find((x) => x.id === productId)
    const maxQ = row && isWebBasedRow(row) ? 10 : 99
    setLineQuantity(productId, Math.min(maxQ, Math.max(1, q)))
    setLines(readCart())
  }

  const remove = (productId: string) => {
    removeFromCart(productId)
    setLines(readCart())
  }

  if (lines.length === 0) {
    return (
      <div className={PAGE_WRAP}>
        <div className={`${CONTAINER} flex flex-col items-center justify-center py-10 sm:min-h-[420px] sm:py-14`}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/[0.04] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 text-emerald-700 ring-1 ring-emerald-100">
              <ShoppingBag className="h-10 w-10" aria-hidden />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">Sepetiniz boş</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Woontegra ürünlerini inceleyerek ihtiyacınıza uygun yazılımı sepetinize ekleyebilirsiniz.
            </p>
            <Link
              to="/yazilimlar"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 sm:text-base"
            >
              Yazılımları İncele
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={PAGE_WRAP}>
      <div className={CONTAINER}>
        <header className="border-b border-slate-200/80 pb-6 sm:pb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sepetim</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Satın almak istediğiniz ürünleri ve kullanım detaylarını kontrol edin.
          </p>
          {error ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
              {error}
            </p>
          ) : null}
          {loading && preview.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Güncel fiyat bilgisi yükleniyor…</p>
          ) : null}
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_min(380px,34%)] lg:items-start lg:gap-10 xl:gap-12">
          <section aria-labelledby="cart-items-heading" className="min-w-0 space-y-4">
            <h2 id="cart-items-heading" className="sr-only">
              Sepetteki ürünler
            </h2>
            <ul className="space-y-4">
              {merged.map((m) => {
                const web = isWebBasedRow(m)
                const maxQ = web ? 10 : 99
                const period = productPricePeriodSuffix(m.productType)
                const typeBadge = web ? 'Web tabanlı program' : 'Tek seferlik satın alma'

                return (
                  <li
                    key={m.id}
                    className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-6">
                      <CartLineImage coverImage={m.coverImage} name={m.name} />

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 space-y-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                              {typeBadge}
                            </span>
                            <Link
                              to={m.slug ? `/yazilimlar/${m.slug}` : '/yazilimlar'}
                              className="block text-lg font-bold leading-snug text-slate-900 transition hover:text-emerald-700"
                            >
                              {m.name}
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(m.id)}
                            className="shrink-0 rounded-full border border-transparent p-2 text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                            aria-label="Ürünü sepetten kaldır"
                          >
                            <Trash2 className="h-5 w-5" aria-hidden />
                          </button>
                        </div>

                        {!m.hasDownload && m.productType === 'DOWNLOAD' && (
                          <p className="mt-2 text-xs text-amber-800">İndirme dosyası eksik olabilir.</p>
                        )}

                        <dl className="mt-4 space-y-2 text-sm text-slate-700">
                          {web ? (
                            <div>
                              <span className="font-medium text-slate-600">Kullanım süresi: </span>
                              <span className="font-semibold text-slate-900">{m.quantity} yıl</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-slate-600">Adet: </span>
                              <span className="font-semibold text-slate-900">{m.quantity}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-slate-600">Birim fiyat: </span>
                            <span className="font-semibold text-slate-900">
                              {formatMoney(m.price, m.currency)}
                              {period ? <span className="font-medium text-slate-600">{period}</span> : null}
                            </span>
                          </div>
                          <div className="border-t border-slate-100 pt-3">
                            <span className="text-sm font-medium text-slate-600">Toplam: </span>
                            <span className="text-base font-bold text-emerald-800">{formatMoney(m.lineTotal, m.currency)}</span>
                          </div>
                        </dl>

                        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                          <QuantityControl
                            id={`qty-${m.id}`}
                            value={m.quantity}
                            min={1}
                            max={maxQ}
                            label={web ? 'Kullanım süresi (yıl)' : 'Adet'}
                            onChange={(n) => updateQty(m.id, n)}
                          />
                          <p className="text-xs text-slate-500 sm:text-right">
                            {web
                              ? 'Her yıl için birim fiyat uygulanır; toplam otomatik hesaplanır.'
                              : 'Adedi güncellediğinizde satır toplamı anında yenilenir.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start xl:top-28">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/[0.05] sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">Sipariş Özeti</h2>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-slate-600">
                  <dt>Ara toplam</dt>
                  <dd className="font-semibold text-slate-900">{formatMoney(grand, currency)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
                  <dt>Genel toplam</dt>
                  <dd className="text-emerald-800">{formatMoney(orderTotal, currency)}</dd>
                </div>
              </dl>

              {hasWeb ? (
                <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-100">
                  Web tabanlı programlarda giriş bilgileriniz ödeme onayından sonra e-posta ile gönderilir.
                </p>
              ) : null}
              {hasDesktop ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-100">
                  Masaüstü programlar için indirme ve kurulum bilgileri ödeme sonrası iletilir.
                </p>
              ) : null}

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-base"
              >
                Ödeme adımına geç
              </Link>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-600">
                <li className="flex gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>Güvenli ödeme (PayTR)</span>
                </li>
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>E-posta ile teslimat ve sipariş bilgisi</span>
                </li>
                <li className="flex gap-2.5">
                  <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>Woontegra destek hizmeti</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
