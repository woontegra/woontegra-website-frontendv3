import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Lock, ShieldCheck } from 'lucide-react'
import { PaytrIframe } from '@/components/payment/PaymentPanels'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { LegalConsentCheckbox, LegalExternalLink } from '@/components/site/LegalConsentCheckbox'
import { checkoutService } from '@/services/api/checkout'
import { ordersService } from '@/services/api/orders'
import { paymentsService } from '@/services/api/payments'
import { getErrorMessage } from '@/services/api/client'
import { LAST_ORDER_EMAIL_KEY } from '@/types/checkout'
import {
  alignCartLinesToCanonicalProductIds,
  clearCart,
  readCart,
  writeCart,
  type CartLine,
} from '@/lib/cartStorage'
import { mergeCartWithPreview, mergedRowIsSingleQuantity } from '@/lib/cartMerge'
import { formatMoney } from '@/utils/formatMoney'
import { checkoutLegalConsentsOk, resolveOrderLegalConsentFlags } from '@/utils/orderLegalRequirements'
import { isSaasSubscriptionProduct } from '@/utils/productPurchase'
import { TurkeyCityDistrictFields } from '@/components/checkout/TurkeyCityDistrictFields'
import { matchDistrictName, matchProvinceName } from '@/data/turkeyLocation'

const inputCls =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

function CartCheckoutGate() {
  const [lines] = useState(() => readCart())
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (lines.length === 0) {
      setReady(true)
      return
    }
    if (lines.length === 1) {
      const snap = lines[0].snapshot
      if (snap?.slug) {
        const web = isSaasSubscriptionProduct(snap.productType)
        setRedirectTo(web ? `/satinal/${snap.slug}?y=${lines[0].quantity}` : `/satinal/${snap.slug}`)
        setReady(true)
        return
      }
      let cancelled = false
      void (async () => {
        try {
          const preview = await checkoutService.cartPreview([lines[0].productId])
          const row = preview[0]
          if (cancelled || !row?.slug) {
            setReady(true)
            return
          }
          const web = isSaasSubscriptionProduct(row.productType)
          setRedirectTo(web ? `/satinal/${row.slug}?y=${lines[0].quantity}` : `/satinal/${row.slug}`)
        } catch {
          /* fall through to multi checkout */
        } finally {
          if (!cancelled) setReady(true)
        }
      })()
      return () => {
        cancelled = true
      }
    }
    setReady(true)
  }, [lines])

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <LoadingState label="Ödeme hazırlanıyor…" />
      </div>
    )
  }

  if (lines.length === 0) return <Navigate to="/sepet" replace />
  if (redirectTo) return <Navigate to={redirectTo} replace />
  return <CartMultiCheckoutPage />
}

function CartMultiCheckoutPage() {
  const navigate = useNavigate()
  const [lines, setLines] = useState<CartLine[]>(() => readCart())
  const productIds = useMemo(() => lines.map((l) => l.productId), [lines])

  const previewQuery = useQuery({
    queryKey: ['checkout', 'cart-preview', productIds.join(',')],
    queryFn: () => checkoutService.cartPreview(productIds),
    enabled: productIds.length > 0,
  })

  useEffect(() => {
    const sync = () => setLines(readCart())
    sync()
    window.addEventListener('woontegra-cart', sync)
    return () => window.removeEventListener('woontegra-cart', sync)
  }, [])

  useEffect(() => {
    if (!previewQuery.data?.length) return
    setLines((prev) => {
      const aligned = alignCartLinesToCanonicalProductIds(prev, previewQuery.data!)
      const changed = aligned.some((l, i) => l.productId !== prev[i]?.productId)
      if (changed) {
        writeCart(aligned)
        Promise.resolve().then(() => window.dispatchEvent(new Event('woontegra-cart')))
        return aligned
      }
      return prev
    })
  }, [previewQuery.data])

  const merged = useMemo(
    () => mergeCartWithPreview(lines, previewQuery.data ?? []),
    [lines, previewQuery.data],
  )

  const grand = merged.reduce((s, m) => s + m.lineTotal, 0)
  const currency = merged[0]?.currency || 'TRY'

  const legalFlags = useMemo(
    () => resolveOrderLegalConsentFlags(merged.map((m) => m.productType)),
    [merged],
  )

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    billingType: '' as '' | 'Bireysel' | 'Kurumsal',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
    deliveryCity: '',
    deliveryDistrict: '',
    deliveryLine: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'PAYTR' | 'BANK_TRANSFER'>('PAYTR')
  const [acceptPre, setAcceptPre] = useState(false)
  const [acceptDistance, setAcceptDistance] = useState(false)
  const [acceptKvkk, setAcceptKvkk] = useState(false)
  const [acceptSoftwareLicense, setAcceptSoftwareLicense] = useState(false)
  const [acceptSaasSubscription, setAcceptSaasSubscription] = useState(false)
  const [acceptDigitalProductWaiver, setAcceptDigitalProductWaiver] = useState(false)
  const [acceptDigitalServiceWaiver, setAcceptDigitalServiceWaiver] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [explicitConsent, setExplicitConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [iframeToken, setIframeToken] = useState<string | null>(null)
  const [orderNo, setOrderNo] = useState<string | null>(null)

  const bankQuery = useQuery({
    queryKey: ['payments', 'bank-transfer-display'],
    queryFn: () => paymentsService.getBankTransferDisplay(),
  })

  const havaleEnabled = bankQuery.data?.bankTransferEnabled === true

  const legalOk = checkoutLegalConsentsOk(legalFlags, {
    pre: acceptPre,
    distance: acceptDistance,
    kvkk: acceptKvkk,
    softwareLicense: acceptSoftwareLicense,
    saasSubscription: acceptSaasSubscription,
    digitalProductWaiver: acceptDigitalProductWaiver,
    digitalServiceWaiver: acceptDigitalServiceWaiver,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0 || merged.length === 0) return
    if (!form.customerName.trim() || !form.customerEmail.trim()) {
      setFormError('Ad soyad ve e-posta zorunludur.')
      return
    }
    if (!legalOk) {
      setFormError('Devam etmek için zorunlu sözleşme onaylarını işaretleyin.')
      return
    }
    if (paymentMethod === 'BANK_TRANSFER' && !havaleEnabled) {
      setFormError('Havale/EFT şu anda kullanılamıyor.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      const created = await ordersService.create({
        items: merged.map((m) => ({ productId: m.id, quantity: m.quantity })),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        billingType: form.billingType || undefined,
        companyName: form.companyName.trim() || undefined,
        taxOffice: form.taxOffice.trim() || undefined,
        taxNumber: form.taxNumber.trim() || undefined,
        deliveryCity: matchProvinceName(form.deliveryCity) || form.deliveryCity.trim() || undefined,
        deliveryDistrict:
          matchDistrictName(form.deliveryCity, form.deliveryDistrict) ||
          form.deliveryDistrict.trim() ||
          undefined,
        deliveryLine: form.deliveryLine.trim() || undefined,
        acceptPreInfo: acceptPre,
        acceptDistanceSales: acceptDistance,
        acceptKvkk: acceptKvkk,
        acceptSoftwareLicense: legalFlags.needsSoftwareLicense ? acceptSoftwareLicense : undefined,
        acceptSaasSubscription: legalFlags.needsSaasSubscription ? acceptSaasSubscription : undefined,
        acceptDigitalProductWaiver: legalFlags.needsDigitalProductWaiver ? acceptDigitalProductWaiver : undefined,
        acceptDigitalServiceWaiver: legalFlags.needsDigitalServiceWaiver ? acceptDigitalServiceWaiver : undefined,
        marketingConsent,
        explicitConsent,
        paymentMethod,
      })

      sessionStorage.setItem(LAST_ORDER_EMAIL_KEY, form.customerEmail.trim().toLowerCase())
      clearCart()
      window.dispatchEvent(new Event('woontegra-cart'))

      if (paymentMethod === 'BANK_TRANSFER' || created.paymentProvider === 'BANK_TRANSFER') {
        navigate(`/odeme/basarili/${encodeURIComponent(created.orderNo)}`)
        return
      }

      setOrderNo(created.orderNo)
      const token = await paymentsService.startPaytr(created.orderNo)
      setIframeToken(token)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Sipariş veya ödeme başlatılamadı'))
    } finally {
      setSubmitting(false)
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-700">Sepetiniz boş.</p>
        <Link to="/sepet" className="mt-6 inline-block font-semibold text-brand-600 hover:underline">
          Sepete dön
        </Link>
      </div>
    )
  }

  if (iframeToken && orderNo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <PaytrIframe orderNo={orderNo} token={iframeToken} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-slate-200/90 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ödeme</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Bilgilerinizi kontrol edin, yasal onayları tamamlayın ve güvenli ödeme adımına geçin.
        </p>
      </header>

      <div className="mb-6 mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Lock className="h-4 w-4" />
        Güvenli ödeme — kart bilgileriniz PayTR altyapısında işlenir
      </div>

      {formError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <form className="min-w-0 space-y-6" onSubmit={(e) => void handleSubmit(e)}>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Müşteri bilgileri</h2>
            <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Hesabınız var mı?{' '}
              <Link
                to={`/musteri-giris?return=${encodeURIComponent('/checkout')}`}
                className="font-semibold text-brand-600 underline"
              >
                Giriş yapın
              </Link>
              . Üye olmadan da devam edebilirsiniz.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Ad soyad *"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                required
              />
              <Input
                label="E-posta *"
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                required
              />
              <Input
                label="Telefon"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Fatura tipi</label>
                <select
                  value={form.billingType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      billingType: e.target.value as '' | 'Bireysel' | 'Kurumsal',
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">Seçin</option>
                  <option value="Bireysel">Bireysel</option>
                  <option value="Kurumsal">Kurumsal</option>
                </select>
              </div>
            </div>
            {form.billingType === 'Kurumsal' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Firma adı" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
                <Input label="Vergi dairesi" value={form.taxOffice} onChange={(e) => setForm((f) => ({ ...f, taxOffice: e.target.value }))} />
                <Input label="Vergi no / TCKN" value={form.taxNumber} onChange={(e) => setForm((f) => ({ ...f, taxNumber: e.target.value }))} />
              </div>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TurkeyCityDistrictFields
                idPrefix="cart-checkout"
                city={form.deliveryCity}
                district={form.deliveryDistrict}
                onCityChange={(deliveryCity) => setForm((f) => ({ ...f, deliveryCity }))}
                onDistrictChange={(deliveryDistrict) => setForm((f) => ({ ...f, deliveryDistrict }))}
                selectClassName={inputCls}
              />
            </div>
            <Input
              className="mt-4"
              label="Adres"
              value={form.deliveryLine}
              onChange={(e) => setForm((f) => ({ ...f, deliveryLine: e.target.value }))}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Ödeme yöntemi</h2>
            <div className="mt-4 space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'PAYTR'}
                  onChange={() => setPaymentMethod('PAYTR')}
                />
                <span className="text-sm font-medium text-slate-800">Kredi / banka kartı (PayTR)</span>
              </label>
              {havaleEnabled ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                  />
                  <span className="text-sm font-medium text-slate-800">Havale / EFT</span>
                </label>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Yasal onaylar</h2>
            <div className="mt-4 space-y-3">
              <LegalConsentCheckbox checked={acceptPre} onChange={setAcceptPre}>
                <LegalExternalLink href="/on-bilgilendirme-formu">Ön bilgilendirme formunu</LegalExternalLink> okudum, kabul ediyorum.
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={acceptDistance} onChange={setAcceptDistance}>
                <LegalExternalLink href="/mesafeli-satis-sozlesmesi">Mesafeli satış sözleşmesini</LegalExternalLink> okudum, kabul ediyorum.
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={acceptKvkk} onChange={setAcceptKvkk}>
                <LegalExternalLink href="/kvkk-aydinlatma-metni">KVKK aydınlatma metnini</LegalExternalLink> okudum.
              </LegalConsentCheckbox>
              {legalFlags.needsSoftwareLicense ? (
                <LegalConsentCheckbox checked={acceptSoftwareLicense} onChange={setAcceptSoftwareLicense}>
                  Yazılım lisans sözleşmesini kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsSaasSubscription ? (
                <LegalConsentCheckbox checked={acceptSaasSubscription} onChange={setAcceptSaasSubscription}>
                  SaaS abonelik sözleşmesini kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsDigitalProductWaiver ? (
                <LegalConsentCheckbox checked={acceptDigitalProductWaiver} onChange={setAcceptDigitalProductWaiver}>
                  Dijital ürün anında ifa beyanını kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsDigitalServiceWaiver ? (
                <LegalConsentCheckbox checked={acceptDigitalServiceWaiver} onChange={setAcceptDigitalServiceWaiver}>
                  Dijital hizmet anında ifa beyanını kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              <LegalConsentCheckbox checked={marketingConsent} onChange={setMarketingConsent}>
                Ticari elektronik ileti almak istiyorum.
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={explicitConsent} onChange={setExplicitConsent}>
                Açık rıza metnini onaylıyorum.
              </LegalConsentCheckbox>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting || !legalOk}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <ShieldCheck className="h-5 w-5" aria-hidden />
            {submitting ? 'İşleniyor…' : paymentMethod === 'BANK_TRANSFER' ? 'Siparişi oluştur' : 'Ödemeye geç'}
          </button>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-slate-900">Sipariş özeti</h2>
          {previewQuery.isLoading ? (
            <p className="mt-4 text-sm text-slate-500">Yükleniyor…</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {merged.map((m) => (
                <li key={m.id} className="flex justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-slate-700">
                    {m.name}
                    {mergedRowIsSingleQuantity(m)
                      ? ' — 1 lisans'
                      : isSaasSubscriptionProduct(m.productType)
                        ? ` × ${m.quantity} yıl`
                        : ` × ${m.quantity}`}
                  </span>
                  <span className="shrink-0 font-medium text-slate-900">{formatMoney(m.lineTotal, m.currency)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
            <span>Toplam</span>
            <span className="text-emerald-800">{formatMoney(grand, currency)}</span>
          </div>
          <Link to="/sepet" className="mt-4 block text-center text-sm font-medium text-brand-600 hover:underline">
            Sepete dön
          </Link>
        </aside>
      </div>
    </div>
  )
}

export function CartCheckoutPage() {
  return <CartCheckoutGate />
}
