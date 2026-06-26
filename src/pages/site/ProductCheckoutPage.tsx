import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PaytrIframe } from '@/components/payment/PaymentPanels'
import { useSitePageMeta } from '@/hooks/usePageMeta'
import { checkoutService } from '@/services/api/checkout'
import { LegalConsentCheckbox, LegalModalLink } from '@/components/site/LegalConsentCheckbox'
import { LegalDocumentModal } from '@/components/checkout/LegalDocumentModal'
import {
  CheckoutLegalModalContent,
  CHECKOUT_LEGAL_MODAL_TITLES,
  type CheckoutLegalModalId,
} from '@/components/checkout/CheckoutLegalModalContent'
import { buildCheckoutLegalPreviewVariables } from '@/utils/buildCheckoutLegalPreviewVars'
import { ordersService } from '@/services/api/orders'
import { paymentsService } from '@/services/api/payments'
import { productsService } from '@/services/api/products'
import { getErrorMessage } from '@/services/api/client'
import { LAST_ORDER_EMAIL_KEY } from '@/types/checkout'
import { saasTotalForYears, formatProductDisplayPrice } from '@/utils/formatProductPrice'
import { formatMoney } from '@/utils/formatMoney'
import {
  checkoutLegalConsentsOk,
  resolveOrderLegalConsentFlags,
} from '@/utils/orderLegalRequirements'
import {
  canPurchaseProduct,
  isSaasSubscriptionProduct,
  licenseDisplayLabel,
  productTypeLabel,
} from '@/utils/productPurchase'
import { productCoverUrl } from '@/utils/mediaUrl'
import { TurkeyCityDistrictFields } from '@/components/checkout/TurkeyCityDistrictFields'
import { matchDistrictName, matchProvinceName } from '@/data/turkeyLocation'

type PaymentMethod = 'PAYTR' | 'BANK_TRANSFER'

const inputCls =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function ProductCheckoutPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialYears = Math.min(10, Math.max(1, Number(searchParams.get('y')) || 1))

  const [webYears, setWebYears] = useState(initialYears)
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYTR')
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
  const [legalModal, setLegalModal] = useState<CheckoutLegalModalId | null>(null)

  const productQuery = useQuery({
    queryKey: ['products', 'checkout', slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: Boolean(slug.trim()),
  })

  const product = productQuery.data
  const isSaas = product ? isSaasSubscriptionProduct(product.productType) : false
  const quantity = isSaas ? webYears : 1

  const previewQuery = useQuery({
    queryKey: ['checkout', 'preview', product?.id],
    queryFn: () => checkoutService.cartPreview([product!.id]),
    enabled: Boolean(product?.id),
  })

  const previewRow = previewQuery.data?.[0]
  const canonicalId = previewRow?.id ?? product?.id

  const unitPrice = previewRow?.price ?? product?.price ?? 0
  const currency = previewRow?.currency ?? product?.currency ?? 'TRY'
  const lineTotal = isSaas ? saasTotalForYears(unitPrice, webYears) : unitPrice

  const priceDisplay = product
    ? formatProductDisplayPrice(unitPrice, currency, product.productType, isSaas ? webYears : 1)
    : null

  const legalFlags = useMemo(
    () => resolveOrderLegalConsentFlags(product ? [product.productType] : []),
    [product],
  )

  const legalOk = checkoutLegalConsentsOk(legalFlags, {
    pre: acceptPre,
    distance: acceptDistance,
    kvkk: acceptKvkk,
    softwareLicense: acceptSoftwareLicense,
    saasSubscription: acceptSaasSubscription,
    digitalProductWaiver: acceptDigitalProductWaiver,
    digitalServiceWaiver: acceptDigitalServiceWaiver,
  })

  const bankQuery = useQuery({
    queryKey: ['payments', 'bank-transfer-display'],
    queryFn: () => paymentsService.getBankTransferDisplay(),
  })

  useSitePageMeta({
    title: product ? `Satın al: ${product.name}` : 'Satın alma',
    description: product?.shortDescription || product?.name,
  })

  const havaleEnabled = bankQuery.data?.bankTransferEnabled === true

  useEffect(() => {
    if (!havaleEnabled && paymentMethod === 'BANK_TRANSFER') {
      setPaymentMethod('PAYTR')
    }
  }, [havaleEnabled, paymentMethod])

  const canPurchase = product ? canPurchaseProduct(product) : false

  const legalPreviewVariables = useMemo(() => {
    if (!product) return undefined
    return buildCheckoutLegalPreviewVariables({
      form,
      product,
      quantity,
      lineTotal,
      currency,
    })
  }, [form, product, quantity, lineTotal, currency])

  const openLegalModal = (e: React.MouseEvent, id: CheckoutLegalModalId) => {
    e.preventDefault()
    e.stopPropagation()
    setLegalModal(id)
  }

  const acceptLegalModal = () => {
    if (!legalModal) return
    switch (legalModal) {
      case 'PRE_INFO':
        setAcceptPre(true)
        break
      case 'DISTANCE':
        setAcceptDistance(true)
        break
      case 'KVKK':
      case 'PRIVACY':
        setAcceptKvkk(true)
        break
      case 'SOFTWARE_LICENSE':
        setAcceptSoftwareLicense(true)
        break
      case 'SAAS_SUBSCRIPTION':
        setAcceptSaasSubscription(true)
        break
      case 'DIGITAL_PRODUCT_WAIVER':
        setAcceptDigitalProductWaiver(true)
        break
      case 'DIGITAL_SERVICE_WAIVER':
        setAcceptDigitalServiceWaiver(true)
        break
      case 'COMMERCIAL':
        setMarketingConsent(true)
        break
      case 'MARKETING':
        setExplicitConsent(true)
        break
      default:
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !canonicalId || !canPurchase) return
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
        items: [{ productId: canonicalId, quantity }],
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

  if (!slug.trim()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <EmptyState title="Geçersiz adres" description="Satın alınacak yazılım seçilmedi." />
      </div>
    )
  }

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <LoadingState label="Sipariş bilgileri yükleniyor…" />
      </div>
    )
  }

  if (productQuery.isError || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-800">Yazılım bulunamadı veya yüklenemedi.</p>
            <Link to="/yazilimlar" className="mt-3 inline-block text-sm font-medium text-brand-700">
              Yazılımlara dön
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!canPurchase) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <EmptyState
          title="Satın alma kullanılamıyor"
          description={
            product.purchaseEnabled === false
              ? 'Bu yazılım şu anda satın almaya kapalı.'
              : 'Fiyat tanımlı değil veya ürün tipi satın almaya uygun değil.'
          }
        />
        <div className="mt-4 text-center">
          <Link to={`/yazilimlar/${product.slug}`}>
            <Button variant="secondary">Ürün sayfasına dön</Button>
          </Link>
        </div>
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

  const cover = productCoverUrl(product)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to={`/yazilimlar/${product.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Ürün sayfasına dön
      </Link>

      <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Lock className="h-4 w-4" />
        Güvenli ödeme — kart bilgileriniz PayTR altyapısında işlenir
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Alıcı bilgileri</h2>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Firma adı"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  />
                  <Input
                    label="Vergi dairesi"
                    value={form.taxOffice}
                    onChange={(e) => setForm((f) => ({ ...f, taxOffice: e.target.value }))}
                  />
                  <Input
                    label="Vergi no / TCKN"
                    value={form.taxNumber}
                    onChange={(e) => setForm((f) => ({ ...f, taxNumber: e.target.value }))}
                  />
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <TurkeyCityDistrictFields
                  idPrefix="product-checkout"
                  city={form.deliveryCity}
                  district={form.deliveryDistrict}
                  onCityChange={(deliveryCity) => setForm((f) => ({ ...f, deliveryCity }))}
                  onDistrictChange={(deliveryDistrict) => setForm((f) => ({ ...f, deliveryDistrict }))}
                  selectClassName={inputCls}
                />
              </div>
              <Input
                label="Adres"
                value={form.deliveryLine}
                onChange={(e) => setForm((f) => ({ ...f, deliveryLine: e.target.value }))}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Ödeme yöntemi</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${paymentMethod === 'PAYTR' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'PAYTR'}
                    onChange={() => setPaymentMethod('PAYTR')}
                    className="mt-1"
                  />
                  <span>
                    <span className="flex items-center gap-2 font-medium text-slate-900">
                      <CreditCard className="h-4 w-4" />
                      Kredi / banka kartı (PayTR)
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">Anında onay</span>
                  </span>
                </label>
                {havaleEnabled ? (
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${paymentMethod === 'BANK_TRANSFER' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium text-slate-900">Havale / EFT</span>
                      <span className="mt-1 block text-xs text-slate-500">Manuel onay</span>
                    </span>
                  </label>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Sözleşme onayları</h2>
              <p className="text-xs text-slate-500">
                Zorunlu onaylar. Metinleri aynı sayfada okuyabilirsiniz; ödeme backend validasyonu ile uyumludur.
              </p>
              <LegalConsentCheckbox checked={acceptPre} onChange={setAcceptPre}>
                <LegalModalLink onOpen={(e) => openLegalModal(e, 'PRE_INFO')}>Ön Bilgilendirme Formu</LegalModalLink>
                &apos;nu okudum ve kabul ediyorum.
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={acceptDistance} onChange={setAcceptDistance}>
                <LegalModalLink onOpen={(e) => openLegalModal(e, 'DISTANCE')}>Mesafeli Satış Sözleşmesi</LegalModalLink>
                &apos;ni okudum ve kabul ediyorum.
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={acceptKvkk} onChange={setAcceptKvkk}>
                <LegalModalLink onOpen={(e) => openLegalModal(e, 'KVKK')}>KVKK Aydınlatma Metni</LegalModalLink>
                &apos;ni ve{' '}
                <LegalModalLink onOpen={(e) => openLegalModal(e, 'PRIVACY')}>Gizlilik Politikası</LegalModalLink>
                &apos;nı okudum.
              </LegalConsentCheckbox>
              {legalFlags.needsSoftwareLicense ? (
                <LegalConsentCheckbox checked={acceptSoftwareLicense} onChange={setAcceptSoftwareLicense}>
                  <LegalModalLink onOpen={(e) => openLegalModal(e, 'SOFTWARE_LICENSE')}>
                    Yazılım lisans sözleşmesini
                  </LegalModalLink>{' '}
                  kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsSaasSubscription ? (
                <LegalConsentCheckbox checked={acceptSaasSubscription} onChange={setAcceptSaasSubscription}>
                  <LegalModalLink onOpen={(e) => openLegalModal(e, 'SAAS_SUBSCRIPTION')}>
                    SaaS abonelik sözleşmesini
                  </LegalModalLink>{' '}
                  kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsDigitalProductWaiver ? (
                <LegalConsentCheckbox checked={acceptDigitalProductWaiver} onChange={setAcceptDigitalProductWaiver}>
                  <LegalModalLink onOpen={(e) => openLegalModal(e, 'DIGITAL_PRODUCT_WAIVER')}>
                    Dijital ürün teslim ve cayma hakkı istisnasını
                  </LegalModalLink>{' '}
                  kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsDigitalServiceWaiver ? (
                <LegalConsentCheckbox checked={acceptDigitalServiceWaiver} onChange={setAcceptDigitalServiceWaiver}>
                  <LegalModalLink onOpen={(e) => openLegalModal(e, 'DIGITAL_SERVICE_WAIVER')}>
                    Dijital hizmet aktivasyon ve cayma hakkı istisnasını
                  </LegalModalLink>{' '}
                  kabul ediyorum.
                </LegalConsentCheckbox>
              ) : null}
              <p className="pt-1 text-xs font-medium text-slate-500">Opsiyonel onaylar</p>
              <LegalConsentCheckbox checked={marketingConsent} onChange={setMarketingConsent}>
                Kampanya ve duyurular için elektronik ileti almak istiyorum. (
                <LegalModalLink onOpen={(e) => openLegalModal(e, 'COMMERCIAL')}>bilgi</LegalModalLink>)
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={explicitConsent} onChange={setExplicitConsent}>
                Kişisel verilerimin pazarlama amacıyla işlenmesine açık rıza veriyorum. (
                <LegalModalLink onOpen={(e) => openLegalModal(e, 'MARKETING')}>metin</LegalModalLink>)
              </LegalConsentCheckbox>
            </CardBody>
          </Card>

          {formError ? (
            <Card className="border-red-200 bg-red-50">
              <CardBody>
                <p className="text-sm text-red-700">{formError}</p>
              </CardBody>
            </Card>
          ) : null}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting || !legalOk}>
            <ShieldCheck className="h-4 w-4" />
            {submitting ? 'İşleniyor…' : paymentMethod === 'BANK_TRANSFER' ? 'Siparişi oluştur' : 'Ödemeye geç'}
          </Button>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sipariş özeti</h2>
              <div className="flex gap-3">
                <img src={cover} alt="" className="h-20 w-24 rounded-lg border object-cover" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{productTypeLabel(product.productType)}</p>
                  <p className="text-xs text-brand-700">{licenseDisplayLabel(product)}</p>
                </div>
              </div>

              {isSaas ? (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Kullanım süresi</label>
                  <select
                    value={webYears}
                    onChange={(e) => setWebYears(Number(e.target.value))}
                    className={inputCls}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
                      <option key={y} value={y}>
                        {y} yıl ({(product.licenseMonths ?? 12) * y} ay)
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-slate-900">{priceDisplay?.main}</span>
                  {priceDisplay?.period ? (
                    <span className="text-sm text-slate-500">{priceDisplay.period}</span>
                  ) : null}
                </div>
                {priceDisplay?.hint ? <p className="mt-1 text-xs text-slate-500">{priceDisplay.hint}</p> : null}
                <p className="mt-2 text-sm font-medium text-slate-700">Toplam: {formatMoney(lineTotal, currency)}</p>
              </div>

              {product.licenseRequired ? (
                <ul className="space-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-brand-600" />
                    Merkezi lisans — Woontegra Lisans Server; e-posta ile teslimat
                  </li>
                  {product.licenseDays != null && product.licenseDays > 0 ? (
                    <li>Lisans süresi: {product.licenseDays} gün</li>
                  ) : null}
                  {product.licenseMaxDevices != null && product.licenseMaxDevices > 0 ? (
                    <li>Cihaz limiti: {product.licenseMaxDevices}</li>
                  ) : null}
                </ul>
              ) : null}

              {product.licenseRequired ? (
                <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">
                  Lisans merkezi Woontegra Lisans Server üzerinden hazırlanır; website lisans üretmez.
                </p>
              ) : null}

              {product.productType === 'DOWNLOAD' && product.hasDownload ? (
                <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">
                  İndirme bağlantısı ödeme onayı sonrası e-posta ile gönderilir.
                </p>
              ) : null}

              {product.productType === 'SAAS' || product.productType === 'SERVICE' ? (
                <p className="text-xs text-slate-500">Hesap kurulum bilgileri ödeme onayı sonrası iletilir.</p>
              ) : null}
            </CardBody>
          </Card>
        </aside>
      </div>

      {legalModal ? (
        <LegalDocumentModal
          open
          title={CHECKOUT_LEGAL_MODAL_TITLES[legalModal]}
          onClose={() => setLegalModal(null)}
          onAccept={acceptLegalModal}
          acceptLabel={
            legalModal === 'COMMERCIAL' || legalModal === 'MARKETING'
              ? 'Onaylıyorum'
              : 'Okudum ve kabul ediyorum'
          }
        >
          <CheckoutLegalModalContent modalId={legalModal} previewVariables={legalPreviewVariables} />
        </LegalDocumentModal>
      ) : null}
    </div>
  )
}
