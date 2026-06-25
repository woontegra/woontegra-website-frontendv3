import { useMemo } from 'react'
import { LegalCompanyDetails } from './LegalCompanyDetails'
import { CookieCategorySection, CookieInventoryTable } from './CookieInventoryTable'
import { LegalList, LegalSection } from './LegalPageLayout'
import type { LegalCompanyInfo } from '@/data/legalCompanyInfo'
import type { LegalPageSection } from '@/types/legalPageContent'
import { openCookiePreferences } from '@/lib/cookieConsent'
import type { PublicCookieItem } from '@/lib/cookieInventory'
import { renderLegalBody } from '@/lib/legalBodyRenderer'

type LegalPageRendererProps = {
  sections: LegalPageSection[]
  companyInfo: LegalCompanyInfo
  cookies?: PublicCookieItem[]
  cookiesLoading?: boolean
  lastScannedAt?: string | null
  showCompanyRepresentative?: boolean
}

const CATEGORY_TITLES: Record<string, string> = {
  necessary: 'Zorunlu çerez envanteri',
  analytics: 'Analitik çerez envanteri',
  marketing: 'Pazarlama çerez envanteri',
  functional: 'Fonksiyonel çerez envanteri',
}

export function LegalPageRenderer({
  sections,
  companyInfo,
  cookies = [],
  cookiesLoading = false,
  lastScannedAt = null,
  showCompanyRepresentative = true,
}: LegalPageRendererProps) {
  const byCategory = useMemo(
    () => ({
      necessary: cookies.filter((c) => c.category === 'necessary'),
      analytics: cookies.filter((c) => c.category === 'analytics'),
      marketing: cookies.filter((c) => c.category === 'marketing'),
      functional: cookies.filter((c) => c.category === 'functional'),
    }),
    [cookies],
  )

  return (
    <>
      {sections.map((section) => {
        const kind = section.kind ?? 'default'

        return (
          <LegalSection key={section.id} id={section.id} title={section.title}>
            {section.body ? renderLegalBody(section.body, companyInfo, section.id) : null}

            {section.listItems?.length ? <LegalList items={section.listItems} /> : null}

            {kind === 'company-details' ? (
              <LegalCompanyDetails info={companyInfo} showRepresentative={showCompanyRepresentative} />
            ) : null}

            {kind === 'cookie-preferences' ? (
              <button
                type="button"
                onClick={openCookiePreferences}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Çerez Tercihlerinizi Yönetin
              </button>
            ) : null}

            {kind === 'cookie-inventory-category' && section.cookieCategory ? (
              <CookieCategorySection
                title={CATEGORY_TITLES[section.cookieCategory] ?? 'Çerez envanteri'}
                cookies={byCategory[section.cookieCategory]}
              />
            ) : null}

            {kind === 'cookie-inventory-all' ? (
              <>
                {lastScannedAt ? (
                  <p className="text-sm text-slate-500">
                    Son tarama: {new Date(lastScannedAt).toLocaleString('tr-TR')}
                  </p>
                ) : null}
                <CookieInventoryTable cookies={cookies} loading={cookiesLoading} />
              </>
            ) : null}
          </LegalSection>
        )
      })}
    </>
  )
}
