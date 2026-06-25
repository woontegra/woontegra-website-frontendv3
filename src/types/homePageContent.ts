export const HOME_PAGE_KEY = 'home' as const
export const HOME_PAGE_CONTENT_VERSION = 4

import { sanitizeUntrustedMediaPath } from '@/lib/mediaUrlGuards'

export type HomeServiceCard = {
  id: string
  icon: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type HomeBrandCard = {
  id: string
  name: string
  text: string
  image: string
  url: string
  order: number
  enabled: boolean
}

export type HomeWhyCard = {
  id: string
  icon: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type HomeProcessStep = {
  id: string
  step: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type HomeIntroCard = {
  id: string
  title: string
  description: string
  icon?: string
  order: number
  enabled: boolean
}

export type HomePageContent = {
  version: number
  hero: {
    enabled: boolean
    tag: string
    title: string
    subtitle: string
    image: string
    button1Text: string
    button1Href: string
    button2Text: string
    button2Href: string
  }
  intro: {
    enabled: boolean
    /** küçük üst metin */
    eyebrow: string
    /** ana vurgu */
    title: string
    /** geriye uyumluluk (eski iki satır alanları) */
    text1?: string
    text2?: string
    cards: HomeIntroCard[]
  }
  services: {
    enabled: boolean
    title: string
    subtitle: string
    cards: HomeServiceCard[]
  }
  brands: {
    enabled: boolean
    title: string
    subtitle: string
    cards: HomeBrandCard[]
  }
  why: {
    enabled: boolean
    title: string
    subtitle: string
    cards: HomeWhyCard[]
  }
  process: {
    enabled: boolean
    title: string
    subtitle: string
    steps: HomeProcessStep[]
  }
  cta: {
    enabled: boolean
    title: string
    subtitle: string
    buttonText: string
    buttonHref: string
  }
}

function uid(): string {
  return crypto.randomUUID()
}

function toStr(v: unknown, fb = ''): string {
  return v == null ? fb : String(v).trim()
}

function toBool(v: unknown, fb: boolean): boolean {
  return typeof v === 'boolean' ? v : fb
}

function toNum(v: unknown, fb: number): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fb
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.order - b.order)
}

export const defaultHomePageContent: HomePageContent = {
  version: HOME_PAGE_CONTENT_VERSION,
  hero: {
    enabled: true,
    tag: 'Woontegra',
    title: 'Dijital Dünyada Gerçek Çözümler Üretiyoruz',
    subtitle:
      'Sadece yazılım geliştirmiyoruz, kendi ürünlerimizi yaratıyor ve yönetiyoruz. E-ticaret, SaaS, danışmanlık – hepsini deneyimliyoruz.',
    image: '/images/hero-dashboard.jpg',
    button1Text: 'Çözümleri İncele',
    button1Href: '#hizmetler',
    button2Text: 'İletişime Geç',
    button2Href: '/iletisim',
  },
  intro: {
    enabled: true,
    eyebrow: 'Bir web sitesinden fazlası',
    title:
      'Woontegra, fikrinizi yalnızca yayına almakla kalmaz; onu çalışan, ölçülebilir ve sürdürülebilir bir dijital sisteme dönüştürür.',
    text1: 'Modern işletmeler sadece bir web sitesine değil, doğru kurgulanmış bir dijital sisteme ihtiyaç duyar.',
    text2: 'Woontegra, fikir aşamasından canlı yayına kadar tüm süreci planlar, geliştirir ve yönetir.',
    cards: [
      {
        id: uid(),
        title: 'Planlarız',
        description: 'İhtiyacı, hedefi ve doğru teknolojiyi birlikte netleştiririz.',
        icon: '01',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        title: 'Geliştiririz',
        description: 'Web, e-ticaret ve yazılım çözümlerini temiz ve sürdürülebilir şekilde üretiriz.',
        icon: '02',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        title: 'Yönetiriz',
        description: 'Yayın sonrası destek, bakım ve geliştirme sürecini takip ederiz.',
        icon: '03',
        order: 2,
        enabled: true,
      },
    ],
  },
  services: {
    enabled: true,
    title: 'İşinizi Büyüten Dijital Çözümler',
    subtitle: 'Tam kapsamlı teknoloji hizmetleri',
    cards: [
      { id: uid(), icon: 'code', title: 'Yazılım Geliştirme', text: 'İşletmenize özel, performans odaklı ve ölçeklenebilir yazılım sistemleri geliştiriyoruz.', color: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
      { id: uid(), icon: 'palette', title: 'Web Tasarım', text: 'Modern, hızlı ve kullanıcı deneyimi yüksek web arayüzleri tasarımlıyoruz.', color: 'from-purple-500 to-pink-500', order: 1, enabled: true },
      { id: uid(), icon: 'shopping-cart', title: 'E-Ticaret', text: 'Satış odaklı, yönetilebilir ve güçlü altyapılara sahip e-ticaret sistemleri kuruyoruz.', color: 'from-green-500 to-emerald-500', order: 2, enabled: true },
      { id: uid(), icon: 'cloud', title: 'SaaS', text: 'Kendi yazılım ürününüzü sıfırdan geliştirmeniz için altyapı sağlıyoruz.', color: 'from-orange-500 to-red-500', order: 3, enabled: true },
      { id: uid(), icon: 'scale', title: 'Marka & Patent', text: 'Marka tescil ve danışmanlık süreçlerini profesyonel şekilde yönetiyoruz.', color: 'from-yellow-500 to-orange-500', order: 4, enabled: true },
      { id: uid(), icon: 'lightbulb', title: 'Danışmanlık', text: 'Dijital büyüme için doğru stratejileri birlikte oluşturuyoruz.', color: 'from-teal-500 to-green-500', order: 5, enabled: true },
    ],
  },
  brands: {
    enabled: true,
    title: 'Woontegra Çatısı Altında Geliştirilen Markalar',
    subtitle: 'Gerçek projelerle kanıtlanmış deneyim',
    cards: [
      { id: uid(), name: 'Bilirkişi', image: '/images/brand-bilirkisi.jpg', text: 'Hukuk ve aktüerya alanında kullanılan profesyonel hesaplama yazılımıdır.', url: 'https://www.bilirkisihesap.com/', order: 0, enabled: true },
      { id: uid(), name: 'Optimoon', image: '/images/brand-optimoon.jpg', text: 'Doğal taş ve özel tasarım ürünlerin yer aldığı e-ticaret markamızdır.', url: 'https://optimoon.com/', order: 1, enabled: true },
      { id: uid(), name: 'Datça Tropikal', image: '/images/brand-datca.jpg', text: 'Yerel üretim ve doğal ürünlerin satışını gerçekleştiren markamızdır.', url: 'https://datcatropikal.com/', order: 2, enabled: true },
      { id: uid(), name: 'Mercan Danışmanlık', image: '/images/brand-mercan.jpg', text: 'Marka tescil ve patent danışmanlık süreçlerini yöneten markamızdır.', url: 'https://mercandanismanlik.com/', order: 3, enabled: true },
    ],
  },
  why: {
    enabled: true,
    title: 'Neden Woontegra?',
    subtitle: 'Gerçek projelerle kanıtlanmış uzmanlık',
    cards: [
      { id: uid(), icon: 'award', title: 'Gerçek Ürün Deneyimi', text: 'Sadece hizmet sunmuyor, kendi ürünlerimizi de geliştiriyoruz.', color: 'bg-gradient-to-br from-yellow-500 to-orange-500', order: 0, enabled: true },
      { id: uid(), icon: 'target', title: 'Uçtan Uca Sistem', text: 'Yazılım, satış ve operasyon süreçlerini tek yapı altında kuruyoruz.', color: 'bg-gradient-to-br from-blue-500 to-cyan-500', order: 1, enabled: true },
      { id: uid(), icon: 'zap', title: 'Performans', text: 'Hızlı, stabil ve sürdürülebilir sistemler geliştiriyoruz.', color: 'bg-gradient-to-br from-purple-500 to-pink-500', order: 2, enabled: true },
      { id: uid(), icon: 'code', title: 'Modern Teknoloji', text: 'Güncel yazılım teknolojileri ile çalışıyoruz.', color: 'bg-gradient-to-br from-green-500 to-emerald-500', order: 3, enabled: true },
      { id: uid(), icon: 'trending-up', title: 'Aktif Markalar', text: 'Kendi markalarımızı aktif olarak yönetiyoruz.', color: 'bg-gradient-to-br from-red-500 to-pink-500', order: 4, enabled: true },
      { id: uid(), icon: 'check-circle', title: 'Sürekli Gelişim', text: 'Projeleri yayına almakla kalmıyor, sürekli geliştiriyoruz.', color: 'bg-gradient-to-br from-teal-500 to-green-500', order: 5, enabled: true },
    ],
  },
  process: {
    enabled: true,
    title: 'Çalışma Sürecimiz',
    subtitle: 'Profesyonel ve şeffaf süreç yönetimi',
    steps: [
      { id: uid(), step: '01', title: 'Analiz', text: 'İhtiyaçları doğru şekilde belirliyoruz.', color: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
      { id: uid(), step: '02', title: 'Planlama', text: 'Proje yapısını ve stratejisini oluşturuyoruz.', color: 'from-purple-500 to-pink-500', order: 1, enabled: true },
      { id: uid(), step: '03', title: 'Geliştirme', text: 'Sistemi modern teknolojilerle inşa ediyoruz.', color: 'from-green-500 to-emerald-500', order: 2, enabled: true },
      { id: uid(), step: '04', title: 'Yayın', text: 'Test süreçlerinden sonra canlıya alıyoruz.', color: 'from-orange-500 to-red-500', order: 3, enabled: true },
    ],
  },
  cta: {
    enabled: true,
    title: 'Projenizi Hayata Geçirmeye Hazır mısınız?',
    subtitle: 'İşinize en uygun dijital yapıyı birlikte kuralım.',
    buttonText: 'İletişime Geç',
    buttonHref: '/iletisim',
  },
}

function isWrongV3Format(raw: Record<string, unknown>): boolean {
  return Boolean(raw.showcase || raw.trust || raw.advantages || (raw.hero && typeof raw.hero === 'object' && 'showSideCards' in (raw.hero as object)))
}

function normalizeServiceCard(raw: unknown, index: number): HomeServiceCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return {
    id: toStr(r.id, uid()),
    icon: toStr(r.icon, 'code'),
    title,
    text: toStr(r.text ?? r.desc ?? r.description),
    color: toStr(r.color, 'from-blue-500 to-cyan-500'),
    order: toNum(r.order, index),
    enabled: toBool(r.enabled, true),
  }
}

function normalizeBrandCard(raw: unknown, index: number): HomeBrandCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const name = toStr(r.name ?? r.title)
  if (!name) return null
  return {
    id: toStr(r.id, uid()),
    name,
    text: toStr(r.text ?? r.desc ?? r.description),
    image: toStr(r.image ?? r.imageUrl, '/images/brand-bilirkisi.jpg'),
    url: toStr(r.url, '#'),
    order: toNum(r.order, index),
    enabled: toBool(r.enabled, true),
  }
}

function normalizeWhyCard(raw: unknown, index: number): HomeWhyCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return {
    id: toStr(r.id, uid()),
    icon: toStr(r.icon, 'award'),
    title,
    text: toStr(r.text ?? r.desc ?? r.description),
    color: toStr(r.color, 'bg-gradient-to-br from-yellow-500 to-orange-500'),
    order: toNum(r.order, index),
    enabled: toBool(r.enabled, true),
  }
}

function normalizeProcessStep(raw: unknown, index: number): HomeProcessStep | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return {
    id: toStr(r.id, uid()),
    step: toStr(r.step ?? r.number, String(index + 1).padStart(2, '0')),
    title,
    text: toStr(r.text ?? r.desc ?? r.description),
    color: toStr(r.color, 'from-blue-500 to-cyan-500'),
    order: toNum(r.order, index),
    enabled: toBool(r.enabled, true),
  }
}

export function normalizeHomePageContent(raw: unknown): HomePageContent {
  const base = structuredClone(defaultHomePageContent)
  if (!raw || typeof raw !== 'object') return base
  const row = raw as Record<string, unknown>

  if (toNum(row.version, 0) < HOME_PAGE_CONTENT_VERSION && isWrongV3Format(row)) {
    return base
  }

  if (!row.intro && !row.services && row.heroTitle) {
    return {
      ...base,
      hero: {
        ...base.hero,
        tag: toStr(row.heroTag, base.hero.tag),
        title: toStr(row.heroTitle, base.hero.title),
        subtitle: toStr(row.heroSubtitle, base.hero.subtitle),
        button1Text: toStr(row.heroButton1Text, base.hero.button1Text),
        button2Text: toStr(row.heroButton2Text, base.hero.button2Text),
      },
      intro: {
        ...base.intro,
        text1: toStr(row.introParagraph1, base.intro.text1),
        text2: toStr(row.introParagraph2, base.intro.text2),
      },
      services: {
        ...base.services,
        title: toStr(row.servicesTitle, base.services.title),
        subtitle: toStr(row.servicesSubtitle, base.services.subtitle),
      },
      brands: { ...base.brands, title: toStr(row.brandsTitle, base.brands.title), subtitle: toStr(row.brandsSubtitle, base.brands.subtitle) },
      why: { ...base.why, title: toStr(row.whyTitle, base.why.title), subtitle: toStr(row.whySubtitle, base.why.subtitle) },
      process: { ...base.process, title: toStr(row.processTitle, base.process.title), subtitle: toStr(row.processSubtitle, base.process.subtitle) },
    }
  }

  if (!row.hero || typeof row.hero !== 'object') return base

  const hero = row.hero as Record<string, unknown>
  const intro = (row.intro as Record<string, unknown>) ?? {}
  const services = (row.services as Record<string, unknown>) ?? {}
  const brands = (row.brands as Record<string, unknown>) ?? {}
  const why = (row.why as Record<string, unknown>) ?? {}
  const process = (row.process as Record<string, unknown>) ?? {}
  const cta = (row.cta as Record<string, unknown>) ?? {}

  const serviceCards = Array.isArray(services.cards)
    ? sortByOrder(services.cards.map(normalizeServiceCard).filter((c): c is HomeServiceCard => c != null))
    : base.services.cards
  const brandCards = Array.isArray(brands.cards)
    ? sortByOrder(brands.cards.map(normalizeBrandCard).filter((c): c is HomeBrandCard => c != null))
    : base.brands.cards
  const whyCards = Array.isArray(why.cards)
    ? sortByOrder(why.cards.map(normalizeWhyCard).filter((c): c is HomeWhyCard => c != null))
    : base.why.cards
  const steps = Array.isArray(process.steps)
    ? sortByOrder(process.steps.map(normalizeProcessStep).filter((s): s is HomeProcessStep => s != null))
    : base.process.steps

  const introCards = (() => {
    if (!Array.isArray(intro.cards)) return base.intro.cards
    const mapped: Array<HomeIntroCard | null> = intro.cards.map((rawCard, index) => {
      if (!rawCard || typeof rawCard !== 'object') return null
      const c = rawCard as Record<string, unknown>
      const title = toStr(c.title)
      const description = toStr(c.description ?? c.text)
      if (!title) return null
      const icon = toStr(c.icon)
      return {
        id: toStr(c.id, uid()),
        title,
        description,
        icon: icon || undefined,
        order: toNum(c.order, index),
        enabled: toBool(c.enabled, true),
      }
    })
    const cleaned = mapped.filter((c): c is HomeIntroCard => c !== null)
    return sortByOrder(cleaned)
  })()

  return {
    version: HOME_PAGE_CONTENT_VERSION,
    hero: {
      enabled: toBool(hero.enabled, true),
      tag: toStr(hero.tag ?? hero.eyebrow, base.hero.tag),
      title: toStr(hero.title, base.hero.title),
      subtitle: toStr(hero.subtitle ?? hero.description, base.hero.subtitle),
      image: (() => {
        const candidate = toStr(hero.image ?? hero.imageUrl, base.hero.image)
        return sanitizeUntrustedMediaPath(candidate) || base.hero.image
      })(),
      button1Text: toStr(hero.button1Text, base.hero.button1Text),
      button1Href: toStr(hero.button1Href, base.hero.button1Href),
      button2Text: toStr(hero.button2Text, base.hero.button2Text),
      button2Href: toStr(hero.button2Href, base.hero.button2Href),
    },
    intro: {
      enabled: toBool(intro.enabled, true),
      eyebrow: toStr(intro.eyebrow ?? intro.kicker ?? intro.text1, base.intro.eyebrow),
      title: toStr(intro.title ?? intro.headline ?? intro.text2, base.intro.title),
      text1: toStr(intro.text1, base.intro.text1),
      text2: toStr(intro.text2, base.intro.text2),
      cards: introCards.length ? introCards : base.intro.cards,
    },
    services: {
      enabled: toBool(services.enabled, true),
      title: toStr(services.title, base.services.title),
      subtitle: toStr(services.subtitle, base.services.subtitle),
      cards: serviceCards.length ? serviceCards : base.services.cards,
    },
    brands: {
      enabled: toBool(brands.enabled, true),
      title: toStr(brands.title, base.brands.title),
      subtitle: toStr(brands.subtitle, base.brands.subtitle),
      cards: brandCards.length ? brandCards : base.brands.cards,
    },
    why: {
      enabled: toBool(why.enabled, true),
      title: toStr(why.title, base.why.title),
      subtitle: toStr(why.subtitle, base.why.subtitle),
      cards: whyCards.length ? whyCards : base.why.cards,
    },
    process: {
      enabled: toBool(process.enabled, true),
      title: toStr(process.title, base.process.title),
      subtitle: toStr(process.subtitle, base.process.subtitle),
      steps: steps.length ? steps : base.process.steps,
    },
    cta: {
      enabled: toBool(cta.enabled, true),
      title: toStr(cta.title, base.cta.title),
      subtitle: toStr(cta.subtitle ?? cta.description, base.cta.subtitle),
      buttonText: toStr(cta.buttonText ?? cta.button1Text, base.cta.buttonText),
      buttonHref: toStr(cta.buttonHref ?? cta.button1Href, base.cta.buttonHref),
    },
  }
}

export function enabledServices(cards: HomeServiceCard[]): HomeServiceCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledBrands(cards: HomeBrandCard[]): HomeBrandCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledWhy(cards: HomeWhyCard[]): HomeWhyCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledProcessSteps(steps: HomeProcessStep[]): HomeProcessStep[] {
  return sortByOrder(steps).filter((s) => s.enabled)
}
