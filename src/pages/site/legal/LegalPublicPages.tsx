import { Navigate, useParams } from 'react-router-dom'
import { CMS_ADMIN_HINT } from '@/constants/adminContentHints'
import { LegalCmsPage } from '@/components/legal/LegalCmsPage'
import {
  defaultLegalAcikRizaPage,
  defaultLegalCookiePage,
  defaultLegalKvkkPage,
  defaultLegalPrivacyPage,
  defaultLegalTermsPage,
} from '@/data/legalPageDefaults'
import {
  LEGAL_CONSENT_PAGE_KEY,
  LEGAL_COOKIE_PAGE_KEY,
  LEGAL_KVKK_PAGE_KEY,
  LEGAL_PAGE_KEYS,
  LEGAL_PRIVACY_PAGE_KEY,
  LEGAL_TERMS_PAGE_KEY,
} from '@/types/legalPageContent'
import { isLegalCheckoutDocSlug } from '@/types/legalDocuments'
import { LegalCheckoutDocumentPage } from '@/pages/site/legal/LegalCheckoutDocumentPage'

export function PreInformationPage() {
  return <LegalCheckoutDocumentPage slug="on-bilgilendirme-formu" />
}

export function DistanceSalesPage() {
  return <LegalCheckoutDocumentPage slug="mesafeli-satis-sozlesmesi" />
}

export function KvkkPage() {
  return <LegalCmsPage pageKey={LEGAL_KVKK_PAGE_KEY} defaults={defaultLegalKvkkPage} />
}

export function PrivacyPage() {
  return <LegalCmsPage pageKey={LEGAL_PRIVACY_PAGE_KEY} defaults={defaultLegalPrivacyPage} />
}

export function CookiePolicyPage() {
  return <LegalCmsPage pageKey={LEGAL_COOKIE_PAGE_KEY} defaults={defaultLegalCookiePage} loadCookies />
}

export function RefundPolicyPage() {
  const def = { key: LEGAL_PAGE_KEYS.refund, label: 'İade ve İptal Koşulları', path: '/iade-iptal-kosullari' }
  return (
    <LegalCmsPage
      pageKey={def.key}
      defaults={{
        enabled: true,
        title: 'İade ve İptal Koşulları',
        description: 'Dijital ürün ve hizmetlerde iade, iptal ve cayma hakkına ilişkin koşullar.',
        updatedAtLabel: '',
        seoTitle: 'İade ve İptal Koşulları',
        seoDescription: 'Dijital ürün satışında iade ve iptal koşulları.',
        sections: [
          {
            id: 'admin-note',
            title: 'İçerik admin panelden eklenecek',
            body: CMS_ADMIN_HINT,
            order: 0,
            active: true,
          },
        ],
      }}
    />
  )
}

export function AcikRizaMetniPage() {
  return (
    <LegalCmsPage
      pageKey={LEGAL_CONSENT_PAGE_KEY}
      defaults={defaultLegalAcikRizaPage}
      showCompanyRepresentative={false}
    />
  )
}

export function KullanimSartlariPage() {
  return (
    <LegalCmsPage
      pageKey={LEGAL_TERMS_PAGE_KEY}
      defaults={defaultLegalTermsPage}
      showCompanyRepresentative={false}
    />
  )
}

export function LegalCheckoutDocumentBySlugPage() {
  const { slug = '' } = useParams()
  if (!isLegalCheckoutDocSlug(slug)) return <Navigate to="/" replace />
  return <LegalCheckoutDocumentPage slug={slug} />
}
