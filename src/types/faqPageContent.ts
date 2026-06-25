export type FaqItem = { question: string; answer: string }
export type FaqCategory = { category: string; questions: FaqItem[] }

export type FaqPageContent = {
  heroEyebrow: string
  heroTitle: string
  heroDescription: string
  heroImage: string
  categories: FaqCategory[]
  ctaTitle: string
  ctaDescription: string
  ctaButtonText: string
  ctaButtonLink: string
  seoTitle: string
  seoDescription: string
}

export const defaultFaqPageContent: FaqPageContent = {
  heroEyebrow: 'SSS',
  heroTitle: 'Sık Sorulan Sorular',
  heroDescription: 'Hizmetlerimiz ve süreçlerimiz hakkında en çok merak edilen sorular.',
  heroImage: '/images/faq-hero.jpg',
  categories: [
    {
      category: 'Genel',
      questions: [
        {
          question: 'Woontegra tam olarak ne yapıyor?',
          answer:
            'Woontegra, yazılım geliştirme, e-ticaret altyapıları ve dijital sistemler kuran bir teknoloji şirketidir. Aynı zamanda kendi markalarını da geliştirir ve yönetir.',
        },
        {
          question: 'Sadece hizmet mi veriyorsunuz?',
          answer: 'Hayır. Hizmet vermenin yanında kendi ürünlerimizi ve e-ticaret markalarımızı da aktif olarak yönetiyoruz.',
        },
        {
          question: 'Hangi sektörlere hizmet veriyorsunuz?',
          answer: 'E-ticaret, SaaS, hukuk teknolojileri, danışmanlık ve kurumsal dijital dönüşüm projelerinde deneyimimiz bulunmaktadır.',
        },
      ],
    },
    {
      category: 'Hizmetler',
      questions: [
        {
          question: 'Web sitesi ve e-ticaret projelerinde süreç nasıl işliyor?',
          answer: 'İhtiyaç analizi, planlama, geliştirme ve yayın sonrası destek adımlarından oluşan şeffaf bir süreç izliyoruz.',
        },
        {
          question: 'Özel yazılım projelerinde destek veriyor musunuz?',
          answer: 'Evet. İşletmenize özel, ölçeklenebilir yazılım sistemleri geliştiriyor ve sürdürülebilir hale getiriyoruz.',
        },
      ],
    },
  ],
  ctaTitle: 'Yanıtını bulamadınız mı?',
  ctaDescription: 'Sorularınız için ekibimizle doğrudan iletişime geçebilirsiniz.',
  ctaButtonText: 'İletişime Geç',
  ctaButtonLink: '/iletisim',
  seoTitle: 'SSS | Woontegra',
  seoDescription: 'Woontegra hizmetleri hakkında sık sorulan sorular.',
}

export function normalizeFaqPageContent(raw: unknown): FaqPageContent {
  const base = defaultFaqPageContent
  if (!raw || typeof raw !== 'object') return base
  const row = raw as Record<string, unknown>
  const str = (k: string, fallback: string) => {
    const v = row[k]
    return typeof v === 'string' && v.trim() ? v.trim() : fallback
  }
  let categories = base.categories
  if (Array.isArray(row.categories)) {
    categories = row.categories
      .map((c) => {
        if (!c || typeof c !== 'object') return null
        const cat = c as Record<string, unknown>
        const name = typeof cat.category === 'string' ? cat.category : 'Genel'
        const questions = Array.isArray(cat.questions)
          ? cat.questions
              .map((q) => {
                if (!q || typeof q !== 'object') return null
                const item = q as Record<string, unknown>
                const question = typeof item.question === 'string' ? item.question : ''
                const answer = typeof item.answer === 'string' ? item.answer : ''
                if (!question.trim()) return null
                return { question: question.trim(), answer: answer.trim() }
              })
              .filter(Boolean)
          : []
        if (!questions.length) return null
        return { category: name, questions: questions as FaqItem[] }
      })
      .filter(Boolean) as FaqCategory[]
  }
  if (!categories.length) categories = base.categories
  return {
    heroEyebrow: str('heroEyebrow', base.heroEyebrow),
    heroTitle: str('heroTitle', base.heroTitle),
    heroDescription: str('heroDescription', str('heroSubtitle', base.heroDescription)),
    heroImage: str('heroImage', base.heroImage),
    categories,
    ctaTitle: str('ctaTitle', base.ctaTitle),
    ctaDescription: str('ctaDescription', str('ctaSubtitle', base.ctaDescription)),
    ctaButtonText: str('ctaButtonText', base.ctaButtonText),
    ctaButtonLink: str('ctaButtonLink', '/iletisim'),
    seoTitle: str('seoTitle', base.seoTitle),
    seoDescription: str('seoDescription', base.seoDescription),
  }
}
