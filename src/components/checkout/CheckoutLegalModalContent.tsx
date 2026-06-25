import { useQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/ui/LoadingState'
import { LegalHtmlBody, LegalSectionsBody } from '@/components/site/LegalPageLayout'
import { resolveLegalDocumentHtml } from '@/data/legalDocumentApiFallbacks'
import { defaultLegalKvkkPage, defaultLegalPrivacyPage } from '@/data/legalPageDefaults'
import { legalDocumentsService } from '@/services/api/legalDocuments'
import { pageContentService } from '@/services/api/pageContent'
import {
  activeSections,
  isPlaceholderOnlyContent,
  LEGAL_PAGE_KEYS,
  type LegalPageContent,
} from '@/types/legalPageContent'
import type { LegalDocType } from '@/types/legalDocuments'

export type CheckoutLegalModalId =
  | 'PRE_INFO'
  | 'DISTANCE'
  | 'KVKK'
  | 'PRIVACY'
  | 'SOFTWARE_LICENSE'
  | 'SAAS_SUBSCRIPTION'
  | 'DIGITAL_PRODUCT_WAIVER'
  | 'DIGITAL_SERVICE_WAIVER'
  | 'COMMERCIAL'
  | 'MARKETING'

const LEGAL_DOC_MAP: Partial<
  Record<CheckoutLegalModalId, { type: LegalDocType; variant?: 'DOWNLOAD' | 'SAAS' }>
> = {
  PRE_INFO: { type: 'PRE_INFORMATION' },
  DISTANCE: { type: 'DISTANCE_SALES' },
  SOFTWARE_LICENSE: { type: 'SOFTWARE_LICENSE' },
  SAAS_SUBSCRIPTION: { type: 'SAAS_SUBSCRIPTION' },
  DIGITAL_PRODUCT_WAIVER: { type: 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER', variant: 'DOWNLOAD' },
  DIGITAL_SERVICE_WAIVER: { type: 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER', variant: 'SAAS' },
  COMMERCIAL: { type: 'COMMERCIAL_ELECTRONIC_MESSAGE' },
  MARKETING: { type: 'EXPLICIT_CONSENT' },
}

const PAGE_CONTENT_MAP: Partial<
  Record<CheckoutLegalModalId, { key: typeof LEGAL_PAGE_KEYS.kvkk | typeof LEGAL_PAGE_KEYS.privacy; defaults: LegalPageContent }>
> = {
  KVKK: { key: LEGAL_PAGE_KEYS.kvkk, defaults: defaultLegalKvkkPage },
  PRIVACY: { key: LEGAL_PAGE_KEYS.privacy, defaults: defaultLegalPrivacyPage },
}

function AdminHint() {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
      Bu metin admin panelden düzenlenebilir.
    </p>
  )
}

function LegalDocPreviewBody({
  type,
  variant,
  variables,
}: {
  type: LegalDocType
  variant?: 'DOWNLOAD' | 'SAAS'
  variables?: Record<string, string>
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['checkout-legal-preview', type, variant, variables],
    queryFn: () => legalDocumentsService.preview(type, variant, variables),
  })

  if (isLoading) return <LoadingState label="Yasal metin yükleniyor…" />
  if (isError) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Metin yüklenemedi. Varsayılan metin gösteriliyor.
        </p>
        <LegalHtmlBody html={resolveLegalDocumentHtml(type, null)} />
      </div>
    )
  }

  const html = resolveLegalDocumentHtml(type, data?.content)
  const showHint = !data?.content?.trim()

  return (
    <div className="space-y-3">
      {showHint ? <AdminHint /> : null}
      <LegalHtmlBody html={html} />
    </div>
  )
}

function LegalPageContentBody({ pageKey, defaults }: { pageKey: string; defaults: LegalPageContent }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['checkout-legal-page', pageKey],
    queryFn: () => pageContentService.getLegalPage(pageKey as typeof LEGAL_PAGE_KEYS.kvkk, defaults),
  })

  if (isLoading) return <LoadingState label="Metin yükleniyor…" />

  const content = data ?? defaults
  const sections = activeSections(content)

  if (isError || sections.length === 0 || isPlaceholderOnlyContent(content)) {
    return (
      <div className="space-y-3">
        <AdminHint />
        {sections.length > 0 ? <LegalSectionsBody sections={sections} /> : null}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {content.description ? <p className="text-sm text-slate-600">{content.description}</p> : null}
      <LegalSectionsBody sections={sections} />
    </div>
  )
}

type Props = {
  modalId: CheckoutLegalModalId
  previewVariables?: Record<string, string>
}

export function CheckoutLegalModalContent({ modalId, previewVariables }: Props) {
  const pageCfg = PAGE_CONTENT_MAP[modalId]
  if (pageCfg) {
    return <LegalPageContentBody pageKey={pageCfg.key} defaults={pageCfg.defaults} />
  }

  const docCfg = LEGAL_DOC_MAP[modalId]
  if (docCfg) {
    return (
      <LegalDocPreviewBody type={docCfg.type} variant={docCfg.variant} variables={previewVariables} />
    )
  }

  return <AdminHint />
}

export const CHECKOUT_LEGAL_MODAL_TITLES: Record<CheckoutLegalModalId, string> = {
  PRE_INFO: 'Ön Bilgilendirme Formu',
  DISTANCE: 'Mesafeli Satış Sözleşmesi',
  KVKK: 'KVKK Aydınlatma Metni',
  PRIVACY: 'Gizlilik Politikası',
  SOFTWARE_LICENSE: 'Yazılım Lisans Sözleşmesi',
  SAAS_SUBSCRIPTION: 'SaaS Abonelik Sözleşmesi',
  DIGITAL_PRODUCT_WAIVER: 'Dijital Ürün Teslim ve Cayma Hakkı İstisnası',
  DIGITAL_SERVICE_WAIVER: 'Dijital Hizmet Aktivasyon ve Cayma Hakkı İstisnası',
  COMMERCIAL: 'Elektronik Ticari İleti Bilgilendirmesi',
  MARKETING: 'Pazarlama Amaçlı Açık Rıza Metni',
}

export function checkoutLegalModalAcceptsCheckbox(modalId: CheckoutLegalModalId): boolean {
  return (
    modalId === 'PRE_INFO' ||
    modalId === 'DISTANCE' ||
    modalId === 'KVKK' ||
    modalId === 'PRIVACY' ||
    modalId === 'SOFTWARE_LICENSE' ||
    modalId === 'SAAS_SUBSCRIPTION' ||
    modalId === 'DIGITAL_PRODUCT_WAIVER' ||
    modalId === 'DIGITAL_SERVICE_WAIVER'
  )
}
