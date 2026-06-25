export type MarketingPageContent = {
  enabled: boolean
  heroEyebrow: string
  heroTitle: string
  heroDescription: string
  heroImage: string
  highlight1: string
  highlight2: string
  sectionEyebrow: string
  sectionTitle: string
  sectionDescription: string
  ctaTitle: string
  ctaDescription: string
  ctaButtonText: string
  ctaButtonLink: string
  ctaSecondaryButtonText: string
  ctaSecondaryButtonLink: string
  seoTitle: string
  seoDescription: string
}

export function mergeMarketingPageContent(
  defaults: MarketingPageContent,
  partial?: Partial<MarketingPageContent> | Record<string, unknown> | null,
): MarketingPageContent {
  if (!partial || typeof partial !== 'object') return { ...defaults }
  const p = partial as Partial<MarketingPageContent>
  const str = (key: keyof MarketingPageContent, fallback: string) => {
    const v = p[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
    const legacy = (partial as Record<string, unknown>)[key === 'heroTitle' ? 'heroTitle' : key]
    if (typeof legacy === 'string' && legacy.trim()) return legacy.trim()
    return fallback
  }
  return {
    enabled: p.enabled ?? defaults.enabled,
    heroEyebrow: str('heroEyebrow', defaults.heroEyebrow),
    heroTitle: str('heroTitle', defaults.heroTitle),
    heroDescription: str('heroDescription', defaults.heroDescription),
    heroImage: str('heroImage', defaults.heroImage),
    highlight1: str('highlight1', defaults.highlight1),
    highlight2: str('highlight2', defaults.highlight2),
    sectionEyebrow: str('sectionEyebrow', defaults.sectionEyebrow),
    sectionTitle: str('sectionTitle', defaults.sectionTitle),
    sectionDescription: str('sectionDescription', defaults.sectionDescription),
    ctaTitle: str('ctaTitle', defaults.ctaTitle),
    ctaDescription: str('ctaDescription', defaults.ctaDescription),
    ctaButtonText: str('ctaButtonText', defaults.ctaButtonText),
    ctaButtonLink: str('ctaButtonLink', defaults.ctaButtonLink),
    ctaSecondaryButtonText: str('ctaSecondaryButtonText', defaults.ctaSecondaryButtonText),
    ctaSecondaryButtonLink: str('ctaSecondaryButtonLink', defaults.ctaSecondaryButtonLink),
    seoTitle: str('seoTitle', defaults.seoTitle),
    seoDescription: str('seoDescription', defaults.seoDescription),
  }
}

export const MARKETING_PAGE_KEYS = {
  services: 'servicesPage',
  solutions: 'solutionsPage',
  faq: 'faq',
  quote: 'quotePage',
  tools: 'ucretsizAraclarPage',
} as const

export const defaultServicesPageContent: MarketingPageContent = {
  enabled: true,
  heroEyebrow: 'Hizmetler',
  heroTitle: 'İşinizi Büyüten Dijital Hizmetler',
  heroDescription:
    'Yazılım geliştirmeden e-ticarete, dijital pazarlamadan özel yazılıma kadar tüm süreçlerinizi tek çatı altında planlıyor ve yönetiyoruz.',
  heroImage: '/images/services-hero.jpg',
  highlight1: 'Uçtan uca teknoloji çözümleri',
  highlight2: 'Ölçülebilir ve sürdürülebilir yapı',
  sectionEyebrow: 'Uzmanlık Alanları',
  sectionTitle: 'Hizmet Kategorileri',
  sectionDescription: 'İşletmenizin ihtiyacına göre modüler veya entegre hizmet paketleri sunuyoruz.',
  ctaTitle: 'Projenizi birlikte hayata geçirelim',
  ctaDescription: 'Kısa bir brief ile size en uygun dijital yapıyı planlayalım.',
  ctaButtonText: 'İletişime Geç',
  ctaButtonLink: '/iletisim',
  ctaSecondaryButtonText: 'Teklif Al',
  ctaSecondaryButtonLink: '/teklif-al',
  seoTitle: 'Hizmetler | Woontegra',
  seoDescription: 'Woontegra dijital hizmetler: web tasarım, e-ticaret, SEO, yazılım ve danışmanlık.',
}

export const defaultSolutionsPageContent: MarketingPageContent = {
  enabled: true,
  heroEyebrow: 'Çözümler',
  heroTitle: 'İşletmeniz İçin Dijital Sistemler',
  heroDescription:
    'Woontegra; e-ticaret, operasyon ve özel yazılım süreçlerini tek merkezden yönetilebilir dijital yapılara dönüştürür.',
  heroImage: '/images/solutions-hero.jpg',
  highlight1: 'SaaS ve operasyon odaklı mimari',
  highlight2: 'Gerçek marka deneyiminden doğan çözümler',
  sectionEyebrow: 'Ürün Mantığı',
  sectionTitle: 'Çözüm Alanlarımız',
  sectionDescription: 'İşletmenizin dijital omurgasını modüler veya entegre şekilde kuruyoruz.',
  ctaTitle: 'Dijital altyapınızı birlikte kuralım',
  ctaDescription: 'E-ticaret, entegrasyon veya özel yazılım ihtiyacınız için sürdürülebilir bir sistem tasarlayalım.',
  ctaButtonText: 'İletişime Geç',
  ctaButtonLink: '/iletisim',
  ctaSecondaryButtonText: 'Bilirkişi Hesaplama',
  ctaSecondaryButtonLink: '/cozumler/bilirkisi-hesaplama',
  seoTitle: 'Çözümler | Woontegra',
  seoDescription: 'Woontegra dijital çözümler: e-ticaret altyapısı, entegrasyon, operasyon ve özel yazılım.',
}

export const defaultToolsPageContent: MarketingPageContent = {
  enabled: true,
  heroEyebrow: 'Ücretsiz Araçlar',
  heroTitle: 'Pratik Dijital Araçlar',
  heroDescription: 'Woontegra tarafından geliştirilen, ücretsiz kullanıma açık masaüstü ve web araçları.',
  heroImage: '/images/tools-hero.jpg',
  highlight1: 'Güvenli ve yerel kullanım',
  highlight2: 'Woontegra deneyiminden doğan araçlar',
  sectionEyebrow: 'Araçlar',
  sectionTitle: 'Ücretsiz Araçlarımız',
  sectionDescription: 'İşletmenizin günlük dijital ihtiyaçları için pratik çözümler.',
  ctaTitle: 'Özel bir araç mı arıyorsunuz?',
  ctaDescription: 'İşletmenize özel araç veya entegrasyon için bizimle iletişime geçin.',
  ctaButtonText: 'İletişime Geç',
  ctaButtonLink: '/iletisim',
  ctaSecondaryButtonText: 'Teklif Al',
  ctaSecondaryButtonLink: '/teklif-al',
  seoTitle: 'Ücretsiz Araçlar | Woontegra',
  seoDescription: 'Woontegra ücretsiz dijital araçlar ve masaüstü uygulamalar.',
}

export const defaultQuotePageContent: MarketingPageContent = {
  enabled: true,
  heroEyebrow: 'Teklif',
  heroTitle: 'Projeniz İçin Teklif Alın',
  heroDescription: 'Birkaç adımda projenizi anlatın; size en uygun dijital çözümü birlikte planlayalım.',
  heroImage: '',
  highlight1: '',
  highlight2: '',
  sectionEyebrow: '',
  sectionTitle: '',
  sectionDescription: '',
  ctaTitle: '',
  ctaDescription: '',
  ctaButtonText: '',
  ctaButtonLink: '',
  ctaSecondaryButtonText: '',
  ctaSecondaryButtonLink: '',
  seoTitle: 'Teklif Al | Woontegra',
  seoDescription: 'Woontegra proje teklif formu — yazılım, web, e-ticaret ve danışmanlık.',
}
