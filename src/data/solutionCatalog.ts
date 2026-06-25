export type SolutionDetailContent = {
  slug: string
  title: string
  description: string
  logo?: string
  logoAlt?: string
  externalUrl?: string
  enabled: boolean
  seoTitle: string
  seoDescription: string
}

export const SOLUTION_PAGE_CONTENT_KEY = 'solutionPages'

export const SOLUTION_CATALOG: SolutionDetailContent[] = [
  {
    slug: 'bilirkisi-hesaplama',
    title: 'Bilirkişi Hesap',
    description:
      'Bilirkişi raporları için hızlı ve güvenilir hesaplama yazılımı. Hukuk ve aktüerya alanında kullanılan profesyonel bir hesaplama aracıdır.',
    logo: '/images/brand-bilirkisi.jpg',
    logoAlt: 'Bilirkişi Hesap',
    externalUrl: 'https://www.bilirkisihesap.com/',
    enabled: true,
    seoTitle: 'Bilirkişi Hesaplama Programı | Woontegra',
    seoDescription: 'Bilirkişi raporları için hızlı ve güvenilir hesaplama yazılımı.',
  },
  {
    slug: 'datca-topikal',
    title: 'Datça Tropikal',
    description:
      'Datça bölgesine ait doğal ve yerel ürünlerin satışını gerçekleştiren e-ticaret markasıdır.',
    logo: '/images/brand-datca.jpg',
    logoAlt: 'Datça Tropikal',
    externalUrl: 'https://datcatropikal.com/',
    enabled: true,
    seoTitle: 'Datça Tropikal | Woontegra Çözümler',
    seoDescription: 'Datça Tropikal — doğal ve tropikal ürünler e-ticaret markası.',
  },
]

export const SOLUTION_DETAIL_BY_SLUG: Record<string, SolutionDetailContent> = Object.fromEntries(
  SOLUTION_CATALOG.map((s) => [s.slug, s]),
)

export function getSolutionBySlug(slug: string): SolutionDetailContent | undefined {
  return SOLUTION_DETAIL_BY_SLUG[slug]
}
