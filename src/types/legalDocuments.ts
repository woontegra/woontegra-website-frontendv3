export type LegalDocType =
  | 'PRE_INFORMATION'
  | 'DISTANCE_SALES'
  | 'KVKK_CLARIFICATION'
  | 'EXPLICIT_CONSENT'
  | 'COMMERCIAL_ELECTRONIC_MESSAGE'
  | 'TERMS_OF_USE'
  | 'PRIVACY_POLICY'
  | 'SOFTWARE_LICENSE'
  | 'SAAS_SUBSCRIPTION'
  | 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER'

export type PublicLegalDocument = {
  type: string
  title: string
  content: string
  version: number
}

export type AdminLegalDocument = PublicLegalDocument & {
  id: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export const ALL_LEGAL_DOC_TYPES: LegalDocType[] = [
  'PRE_INFORMATION',
  'DISTANCE_SALES',
  'KVKK_CLARIFICATION',
  'EXPLICIT_CONSENT',
  'COMMERCIAL_ELECTRONIC_MESSAGE',
  'TERMS_OF_USE',
  'PRIVACY_POLICY',
  'SOFTWARE_LICENSE',
  'SAAS_SUBSCRIPTION',
  'DIGITAL_IMMEDIATE_DELIVERY_WAIVER',
]

export const LEGAL_DOC_TYPE_LABELS: Record<LegalDocType, string> = {
  PRE_INFORMATION: 'Ön bilgilendirme formu',
  DISTANCE_SALES: 'Mesafeli satış sözleşmesi',
  KVKK_CLARIFICATION: 'KVKK aydınlatma metni',
  EXPLICIT_CONSENT: 'Pazarlama açık rıza metni',
  COMMERCIAL_ELECTRONIC_MESSAGE: 'Elektronik ticari ileti bilgilendirmesi',
  TERMS_OF_USE: 'Kullanım şartları',
  PRIVACY_POLICY: 'Gizlilik politikası',
  SOFTWARE_LICENSE: 'Yazılım lisans sözleşmesi',
  SAAS_SUBSCRIPTION: 'SaaS abonelik sözleşmesi',
  DIGITAL_IMMEDIATE_DELIVERY_WAIVER: 'Dijital teslim / cayma istisnası',
}

/** Public sitede legal-documents API ile beslenen route (CMS sayfaları ayrı). */
export function legalDocPublicPath(type: LegalDocType): string | null {
  const fromCheckout = Object.entries(LEGAL_CHECKOUT_DOC).find(([, cfg]) => cfg.type === type)?.[0]
  if (fromCheckout) {
    if (fromCheckout === 'on-bilgilendirme-formu' || fromCheckout === 'mesafeli-satis-sozlesmesi') {
      return `/${fromCheckout}`
    }
    return `/yasal/${fromCheckout}`
  }
  if (
    type === 'SOFTWARE_LICENSE' ||
    type === 'SAAS_SUBSCRIPTION' ||
    type === 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER' ||
    type === 'TERMS_OF_USE' ||
    type === 'KVKK_CLARIFICATION' ||
    type === 'PRIVACY_POLICY'
  ) {
    return `/yasal-belge/${type}`
  }
  return null
}

export type AdminLegalDocumentInput = {
  type: LegalDocType
  title: string
  content: string
  version: number
  isActive: boolean
}

export function normalizeAdminLegalDocument(raw: unknown): AdminLegalDocument | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? '').trim()
  if (!id) return null
  return {
    id,
    type: String(o.type ?? '') as LegalDocType,
    title: String(o.title ?? ''),
    content: String(o.content ?? ''),
    version: Number(o.version) || 1,
    isActive: o.isActive !== false,
    createdAt: o.createdAt ? String(o.createdAt) : undefined,
    updatedAt: o.updatedAt ? String(o.updatedAt) : undefined,
  }
}

export const LEGAL_CHECKOUT_SLUGS = {
  preInfo: 'on-bilgilendirme-formu',
  distance: 'mesafeli-satis-sozlesmesi',
} as const

export const LEGAL_CHECKOUT_DOC: Record<
  string,
  { type: LegalDocType; title: string; subtitle: string; seoTitle: string; seoDescription: string }
> = {
  'on-bilgilendirme-formu': {
    type: 'PRE_INFORMATION',
    title: 'Ön Bilgilendirme Formu',
    subtitle: 'Satın alma öncesi ürün, satıcı ve ödeme bilgileri.',
    seoTitle: 'Ön Bilgilendirme Formu',
    seoDescription: 'Mesafeli satın alma öncesi yasal ön bilgilendirme metni.',
  },
  'mesafeli-satis-sozlesmesi': {
    type: 'DISTANCE_SALES',
    title: 'Mesafeli Satış Sözleşmesi',
    subtitle: 'Dijital ürün satışına ilişkin mesafeli satış sözleşmesi.',
    seoTitle: 'Mesafeli Satış Sözleşmesi',
    seoDescription: 'Mesafeli satış sözleşmesi ve tarafların hakları.',
  },
  'elektronik-ileti-bilgilendirme': {
    type: 'COMMERCIAL_ELECTRONIC_MESSAGE',
    title: 'Elektronik Ticari İleti Bilgilendirme Metni',
    subtitle: 'Kampanya ve duyurular için elektronik ileti iznine ilişkin bilgilendirme.',
    seoTitle: 'Elektronik Ticari İleti Bilgilendirmesi',
    seoDescription: 'Ticari elektronik ileti onayı ve geri çekme hakkı hakkında bilgilendirme.',
  },
  'pazarlama-acik-riza-metni': {
    type: 'EXPLICIT_CONSENT',
    title: 'Pazarlama Amaçlı Kişisel Veri İşleme Açık Rıza Metni',
    subtitle: 'Kişisel verilerinizin pazarlama amacıyla işlenmesine ilişkin açık rıza metni.',
    seoTitle: 'Pazarlama Açık Rıza Metni',
    seoDescription: 'Pazarlama ve kişiselleştirilmiş teklifler için açık rıza ve geri çekme.',
  },
}

export function isLegalCheckoutDocSlug(slug: string): slug is keyof typeof LEGAL_CHECKOUT_DOC {
  return slug in LEGAL_CHECKOUT_DOC
}

export const CHECKOUT_EXTRA_LEGAL_TYPES: Partial<Record<string, LegalDocType>> = {
  software: 'SOFTWARE_LICENSE',
  saas: 'SAAS_SUBSCRIPTION',
  digitalProduct: 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER',
  digitalService: 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER',
}

export function legalCheckoutPreviewVariables(): Record<string, string> {
  return {
    customerName: '—',
    customerEmail: '—',
    orderNo: 'Ödeme onayından sonra sipariş numaranız oluşturulur.',
    orderTotal: '—',
    currency: '₺',
    productList: '<p>Sipariş özetindeki ürünler ödeme adımında gösterilir.</p>',
  }
}

export function normalizePublicLegalDocument(raw: unknown): PublicLegalDocument | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const content = String(o.content ?? '')
  const title = String(o.title ?? 'Yasal metin')
  if (!content.trim() && !title.trim()) return null
  return {
    type: String(o.type ?? ''),
    title,
    content,
    version: Number(o.version) || 1,
  }
}
