import {
  defaultLegalAcikRizaPage,
  defaultLegalCookiePage,
  defaultLegalKvkkPage,
  defaultLegalPrivacyPage,
  defaultLegalTermsPage,
} from '@/data/legalPageDefaults'

export const LEGAL_PAGE_KEYS = {
  kvkk: 'legalKvkkPage',
  privacy: 'legalPrivacyPage',
  cookie: 'legalCookiePage',
  refund: 'legalRefundPage',
  consent: 'legalConsentPage',
  terms: 'legalTermsPage',
} as const

export type LegalPageKey = (typeof LEGAL_PAGE_KEYS)[keyof typeof LEGAL_PAGE_KEYS]

export type LegalSectionKind =
  | 'default'
  | 'company-details'
  | 'cookie-inventory-category'
  | 'cookie-inventory-all'
  | 'cookie-preferences'

export type LegalPageSection = {
  id: string
  title: string
  body: string
  order: number
  active: boolean
  listItems?: string[]
  kind?: LegalSectionKind
  cookieCategory?: 'necessary' | 'analytics' | 'marketing' | 'functional'
}

export type LegalPageContent = {
  enabled: boolean
  title: string
  description: string
  updatedAtLabel: string
  sections: LegalPageSection[]
  seoTitle: string
  seoDescription: string
}

export type LegalPageDefinition = {
  key: LegalPageKey
  label: string
  path: string
  defaults: LegalPageContent
  loadCookies?: boolean
  showCompanyRepresentative?: boolean
}

function section(id: string, title: string, body: string, order: number): LegalPageSection {
  return { id, title, body, order, active: true }
}

const refundPlaceholder: LegalPageContent = {
  enabled: true,
  title: 'İade ve İptal Koşulları',
  description: 'Dijital ürün ve hizmetlerde iade, iptal ve cayma hakkına ilişkin koşullar.',
  updatedAtLabel: '',
  seoTitle: 'İade ve İptal Koşulları',
  seoDescription: 'Dijital ürün satışında iade ve iptal koşulları.',
  sections: [
    section(
      'admin-note',
      'İçerik admin panelden eklenecek',
      'Bu içerik Admin Panel > İçerikler bölümünden düzenlenebilir.',
      0,
    ),
  ],
}

export const LEGAL_PAGE_DEFINITIONS: LegalPageDefinition[] = [
  {
    key: LEGAL_PAGE_KEYS.kvkk,
    label: 'KVKK Aydınlatma Metni',
    path: '/kvkk-aydinlatma-metni',
    defaults: defaultLegalKvkkPage,
  },
  {
    key: LEGAL_PAGE_KEYS.privacy,
    label: 'Gizlilik Politikası',
    path: '/gizlilik-politikasi',
    defaults: defaultLegalPrivacyPage,
  },
  {
    key: LEGAL_PAGE_KEYS.cookie,
    label: 'Çerez Politikası',
    path: '/cerez-politikasi',
    defaults: defaultLegalCookiePage,
    loadCookies: true,
  },
  {
    key: LEGAL_PAGE_KEYS.refund,
    label: 'İade ve İptal Koşulları',
    path: '/iade-iptal-kosullari',
    defaults: refundPlaceholder,
  },
  {
    key: LEGAL_PAGE_KEYS.consent,
    label: 'Açık Rıza Metni',
    path: '/acik-riza-metni',
    defaults: defaultLegalAcikRizaPage,
    showCompanyRepresentative: false,
  },
  {
    key: LEGAL_PAGE_KEYS.terms,
    label: 'Kullanım Şartları',
    path: '/kullanim-sartlari',
    defaults: defaultLegalTermsPage,
    showCompanyRepresentative: false,
  },
]

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function normalizeSection(section: Partial<LegalPageSection>, index: number, fallback?: LegalPageSection): LegalPageSection {
  const base = fallback ?? {
    id: `section-${index + 1}`,
    title: '',
    body: '',
    order: index,
    active: true,
    kind: 'default' as const,
  }

  return {
    id: section.id?.trim() || base.id,
    title: section.title?.trim() || base.title,
    body: typeof section.body === 'string' ? section.body : base.body,
    order: typeof section.order === 'number' ? section.order : index,
    active: parseBoolean(section.active, base.active),
    listItems: Array.isArray(section.listItems)
      ? section.listItems.map((item) => String(item).trim()).filter(Boolean)
      : base.listItems,
    kind: section.kind ?? base.kind ?? 'default',
    cookieCategory: section.cookieCategory ?? base.cookieCategory,
  }
}

export function mergeLegalPageContent(
  defaults: LegalPageContent,
  partial?: Partial<LegalPageContent> | null,
): LegalPageContent {
  if (!partial) return structuredClone(defaults)

  const fallbackSections = defaults.sections
  const incomingSections = Array.isArray(partial.sections) ? partial.sections : fallbackSections

  const sections = incomingSections
    .map((section, index) => normalizeSection(section, index, fallbackSections[index]))
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({ ...section, order: index }))

  return {
    enabled: parseBoolean(partial.enabled, defaults.enabled),
    title: partial.title?.trim() || defaults.title,
    description: partial.description?.trim() || defaults.description,
    updatedAtLabel: partial.updatedAtLabel?.trim() || defaults.updatedAtLabel,
    sections: sections.length ? sections : structuredClone(defaults.sections),
    seoTitle: partial.seoTitle?.trim() || defaults.seoTitle,
    seoDescription: partial.seoDescription?.trim() || defaults.seoDescription,
  }
}

export function normalizeLegalPageContent(raw: unknown, defaults: LegalPageContent): LegalPageContent {
  if (!raw || typeof raw !== 'object') return structuredClone(defaults)
  return mergeLegalPageContent(defaults, raw as Partial<LegalPageContent>)
}

export function activeSections(content: LegalPageContent): LegalPageSection[] {
  return content.sections.filter(
    (s) => s.active && (s.title.trim() || s.body.trim() || (s.listItems?.length ?? 0) > 0),
  )
}

export const activeLegalSections = activeSections

export function legalTocFromSections(sections: LegalPageSection[]) {
  return sections.map((section) => ({ id: section.id, label: section.title }))
}

export const LEGAL_KVKK_PAGE_KEY = LEGAL_PAGE_KEYS.kvkk
export const LEGAL_PRIVACY_PAGE_KEY = LEGAL_PAGE_KEYS.privacy
export const LEGAL_COOKIE_PAGE_KEY = LEGAL_PAGE_KEYS.cookie
export const LEGAL_CONSENT_PAGE_KEY = LEGAL_PAGE_KEYS.consent
export const LEGAL_TERMS_PAGE_KEY = LEGAL_PAGE_KEYS.terms

export function isPlaceholderOnlyContent(content: LegalPageContent): boolean {
  const active = activeSections(content)
  return active.length === 1 && active[0]?.id === 'admin-note'
}
