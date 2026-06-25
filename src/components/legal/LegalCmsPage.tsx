import { useEffect, useState } from 'react'
import { LegalPageRenderer } from './LegalPageRenderer'
import { LegalPageLayout } from './LegalPageLayout'
import {
  activeLegalSections,
  legalTocFromSections,
  type LegalPageContent,
} from '@/types/legalPageContent'
import { useLegalCompanyInfo } from '@/hooks/useLegalCompanyInfo'
import { useLegalPageContent } from '@/hooks/useLegalPageContent'
import { fetchPublicCookies, type PublicCookieItem } from '@/lib/cookieInventory'

type LegalCmsPageProps = {
  pageKey: string
  defaults: LegalPageContent
  showCompanyRepresentative?: boolean
  loadCookies?: boolean
}

export function LegalCmsPage({
  pageKey,
  defaults,
  showCompanyRepresentative = true,
  loadCookies = false,
}: LegalCmsPageProps) {
  const content = useLegalPageContent(pageKey, defaults)
  const companyInfo = useLegalCompanyInfo()
  const [cookies, setCookies] = useState<PublicCookieItem[]>([])
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null)
  const [cookiesLoading, setCookiesLoading] = useState(loadCookies)

  useEffect(() => {
    if (!loadCookies) return
    void fetchPublicCookies()
      .then((data) => {
        setCookies(data.cookies)
        setLastScannedAt(data.lastScannedAt)
      })
      .finally(() => setCookiesLoading(false))
  }, [loadCookies])

  if (!content.enabled) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Sayfa geçici olarak kullanılamıyor</h1>
        <p className="mt-3 text-slate-600">Bu yasal sayfa şu anda yayında değil.</p>
      </div>
    )
  }

  const sections = activeLegalSections(content)
  const updatedAt = content.updatedAtLabel?.trim() || companyInfo.lastUpdated

  return (
    <LegalPageLayout
      title={content.title}
      subtitle={content.description}
      seoTitle={content.seoTitle}
      seoDescription={content.seoDescription}
      updatedAt={updatedAt}
      toc={legalTocFromSections(sections)}
    >
      <LegalPageRenderer
        sections={sections}
        companyInfo={companyInfo}
        cookies={cookies}
        cookiesLoading={cookiesLoading}
        lastScannedAt={lastScannedAt}
        showCompanyRepresentative={showCompanyRepresentative}
      />
    </LegalPageLayout>
  )
}
