import { LEGAL_PAGE_DEFINITIONS } from '@/types/legalPageContent'
import { PAGE_CONTENT_KEYS } from '@/types/pageContent'
import { MARKETING_PAGE_KEYS } from '@/types/marketingPageContent'

export type SitePageKind = 'about' | 'contact' | 'legal' | 'marketing' | 'faq'

export type SitePageDefinition = {
  key: string
  title: string
  path: string
  kind: SitePageKind
  pageTypeLabel: string
}

export const SITE_PAGE_DEFINITIONS: SitePageDefinition[] = [
  {
    key: PAGE_CONTENT_KEYS.about,
    title: 'Hakkımızda',
    path: '/hakkimizda',
    kind: 'about',
    pageTypeLabel: 'Kurumsal',
  },
  {
    key: PAGE_CONTENT_KEYS.contact,
    title: 'İletişim',
    path: '/iletisim',
    kind: 'contact',
    pageTypeLabel: 'Kurumsal',
  },
  {
    key: MARKETING_PAGE_KEYS.services,
    title: 'Hizmetler',
    path: '/hizmetler',
    kind: 'marketing',
    pageTypeLabel: 'Kurumsal',
  },
  {
    key: MARKETING_PAGE_KEYS.solutions,
    title: 'Çözümler',
    path: '/cozumler',
    kind: 'marketing',
    pageTypeLabel: 'Kurumsal',
  },
  {
    key: MARKETING_PAGE_KEYS.faq,
    title: 'SSS',
    path: '/sss',
    kind: 'faq',
    pageTypeLabel: 'Kurumsal',
  },
  {
    key: MARKETING_PAGE_KEYS.quote,
    title: 'Teklif Al',
    path: '/teklif-al',
    kind: 'marketing',
    pageTypeLabel: 'Kurumsal',
  },
  {
    key: MARKETING_PAGE_KEYS.tools,
    title: 'Ücretsiz Araçlar',
    path: '/ucretsiz-araclar',
    kind: 'marketing',
    pageTypeLabel: 'Kurumsal',
  },
  ...LEGAL_PAGE_DEFINITIONS.map((d) => ({
    key: d.key,
    title: d.label,
    path: d.path,
    kind: 'legal' as const,
    pageTypeLabel: d.key === 'legalRefundPage' ? 'Politika' : 'Yasal CMS',
  })),
]

export function getSitePageByKey(key: string): SitePageDefinition | undefined {
  return SITE_PAGE_DEFINITIONS.find((p) => p.key === key)
}

export function getSitePagePath(key: string): string | null {
  return getSitePageByKey(key)?.path ?? null
}
