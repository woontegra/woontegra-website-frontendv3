export const ABOUT_PAGE_VERSION = 2

export type AboutHighlightCard = {
  id: string
  icon: string
  title: string
  cardClass: string
  iconClass: string
  order: number
  enabled: boolean
}

export type AboutSimpleCard = {
  id: string
  title: string
  text: string
  order: number
  enabled: boolean
}

export type AboutIconCard = {
  id: string
  icon: string
  title: string
  text: string
  gradient: string
  order: number
  enabled: boolean
}

export type AboutTimelineStep = {
  id: string
  icon: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type AboutBrandCard = {
  id: string
  name: string
  text: string
  image: string
  url: string
  order: number
  enabled: boolean
}

export type AboutStatCard = {
  id: string
  icon: string
  title: string
  text: string
  order: number
  enabled: boolean
}

export type AboutPageContent = {
  version: number
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    image: string
    highlights: AboutHighlightCard[]
  }
  whatIs: {
    title: string
    paragraphs: string[]
    highlight: string
    cards: AboutSimpleCard[]
  }
  timeline: {
    title: string
    subtitle: string
    steps: AboutTimelineStep[]
  }
  differentiators: {
    title: string
    subtitle: string
    cards: AboutIconCard[]
  }
  brands: {
    title: string
    subtitle: string
    cards: AboutBrandCard[]
  }
  workApproach: {
    title: string
    subtitle: string
    cards: AboutIconCard[]
  }
  structure: {
    title: string
    paragraphs: string[]
    stats: AboutStatCard[]
  }
  vision: {
    title: string
    paragraphs: string[]
  }
  cta: {
    title: string
    subtitle: string
    buttonText: string
    buttonHref: string
  }
  metaDescription?: string
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

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.order - b.order)
}

export const defaultAboutPageContent: AboutPageContent = {
  version: ABOUT_PAGE_VERSION,
  hero: {
    eyebrow: 'Hakkımızda',
    title: "Woontegra'yı Tanıyın",
    subtitle:
      'Yazılım, e-ticaret ve dijital sistemler alanında kendi ürünlerini geliştiren, markalarını yöneten ve işletmelere sürdürülebilir dijital altyapılar sunan bir teknoloji şirketiyiz.',
    image: '/images/hakkimizda-hero.jpg',
    highlights: [
      {
        id: uid(),
        icon: 'boxes',
        title: 'Kendi ürünlerini geliştiren yapı',
        cardClass: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
        iconClass: 'text-emerald-400',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'sparkles',
        title: 'Gerçek kullanım deneyiminden doğan çözümler',
        cardClass: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
        iconClass: 'text-blue-400',
        order: 1,
        enabled: true,
      },
    ],
  },
  whatIs: {
    title: 'Woontegra Nedir?',
    paragraphs: [
      'Woontegra, klasik bir ajans ya da yalnızca hizmet sunan bir yapı değildir. Kendi markalarını kuran, ürünler geliştiren ve bu ürünleri aktif olarak yöneten bir teknoloji şirketidir.',
      'Yazılım geliştirme, e-ticaret ve dijital sistemler alanında sadece müşteriler için değil, kendi projeleri için de üretim yapan bir yapı kurduk. Bu sayede teorik değil, gerçek kullanım üzerinden deneyim kazanan ve bunu projelere yansıtan bir sistem oluşturduk.',
    ],
    highlight:
      'Amacımız, işletmelere sadece bir hizmet sunmak değil, sürdürülebilir bir dijital yapı kurmalarını sağlamaktır.',
    cards: [
      {
        id: uid(),
        title: 'Ürün Geliştiren Yapı',
        text: 'Kendi markalarını ve dijital ürünlerini geliştiren, yalnızca müşteri işi yapan klasik ajans modelinden ayrılan yapı.',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        title: 'Gerçek Deneyim',
        text: 'E-ticaret, yazılım ve dijital operasyon süreçlerinde kendi projelerinden kazandığı deneyimi müşterilerine aktarır.',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        title: 'Sürdürülebilir Sistem',
        text: 'İşletmelere sadece web sitesi değil, yönetilebilir ve büyüyebilir dijital altyapılar kurmayı hedefler.',
        order: 2,
        enabled: true,
      },
    ],
  },
  timeline: {
    title: 'Nasıl Başladık?',
    subtitle: 'Woontegra, piyasadaki klasik ajans modelinin eksikliklerini gözlemleyerek ortaya çıktı.',
    steps: [
      {
        id: uid(),
        icon: 'eye',
        title: 'Klasik ajans modelinin eksikliklerini gördük',
        text: 'Çoğu ajans müşteri projeleri üzerinde çalışır ancak kendi ürünlerini geliştirmez. Bu durum, gerçek kullanıcı deneyimi ve operasyonel zorlukları anlamayı zorlaştırır.',
        color: 'bg-blue-500',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'rocket',
        title: 'Kendi ürünlerimizi geliştirmeye başladık',
        text: 'Farklı bir yol seçtik: Kendi ürünlerimizi geliştiren, markalarımızı yöneten ve bu süreçte edindiğimiz deneyimi müşteri projelerine aktaran bir yapı kurmak.',
        color: 'bg-purple-500',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'settings',
        title: 'Gerçek operasyon deneyimini sisteme dönüştürdük',
        text: 'Yazılım geliştirme, e-ticaret ve dijital sistemler alanında hem kendi markalarını yöneten hem de işletmelere çözümler sunan bir teknoloji yapısına dönüştük.',
        color: 'bg-emerald-500',
        order: 2,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'building-2',
        title: 'Bugün işletmelere sürdürülebilir dijital yapı sunuyoruz',
        text: 'Sadece kod yazmıyor, sistem kuruyoruz. Sadece tasarım yapmıyor, marka oluşturuyoruz. Sadece danışmanlık vermiyor, gerçek projeler yönetiyoruz.',
        color: 'bg-orange-500',
        order: 3,
        enabled: true,
      },
    ],
  },
  differentiators: {
    title: 'Bizi Farklı Yapan Ne?',
    subtitle: 'Klasik ajans modelinden ayrılan, ürün ve deneyim odaklı teknoloji yaklaşımımız.',
    cards: [
      {
        id: uid(),
        icon: 'package',
        title: 'Sadece Hizmet Değil, Ürün',
        text: 'Klasik ajanslar müşteri projeleri üzerinde çalışır. Biz ise kendi ürünlerimizi geliştiriyor, gerçek kullanıcılarla test ediyor ve piyasaya sunuyoruz. Bu deneyim, müşteri projelerinde de fark yaratıyor.',
        gradient: 'from-blue-500 to-cyan-500',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'award',
        title: 'Gerçek Deneyim',
        text: 'Kendi markalarımızı aktif olarak yönetiyoruz. E-ticaret, SaaS yazılım, danışmanlık gibi farklı sektörlerde operasyonel deneyime sahibiz. Teorik bilgi değil, gerçek iş deneyimi sunuyoruz.',
        gradient: 'from-purple-500 to-pink-500',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'layers',
        title: 'Tek Yapı',
        text: 'Yazılım geliştirme, satış süreçleri ve operasyonel yönetimi tek çatı altında birleştiriyoruz. Bu entegre yapı sayesinde projeler daha hızlı, daha verimli ve daha sürdürülebilir şekilde hayata geçiyor.',
        gradient: 'from-emerald-500 to-teal-500',
        order: 2,
        enabled: true,
      },
    ],
  },
  brands: {
    title: 'Aktif Olarak Yönettiğimiz Markalar',
    subtitle:
      'Woontegra yalnızca hizmet sunan bir yapı değil; kendi markalarını yöneten ve bu deneyimi müşterilerine aktaran bir teknoloji şirketidir.',
    cards: [
      {
        id: uid(),
        name: 'Bilirkişi',
        image: '/images/brand-bilirkisi.jpg',
        text: 'Hukuk ve aktüerya alanında kullanılan profesyonel hesaplama yazılımı. İşçi alacakları, kıdem-ihbar tazminatı ve tazminat hesaplamalarını otomatik gerçekleştirir.',
        url: 'https://www.bilirkisihesap.com/',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        name: 'Optimoon',
        image: '/images/brand-optimoon.jpg',
        text: 'Doğal taş takılar, kristaller ve özel tasarım ürünlerin satışını gerçekleştiren e-ticaret markası.',
        url: 'https://optimoon.com/',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        name: 'Datça Tropikal',
        image: '/images/brand-datca.jpg',
        text: "Datça'nın yerel üretim ve doğal ürünlerini satışa sunan e-ticaret markası.",
        url: 'https://datcatropikal.com/',
        order: 2,
        enabled: true,
      },
      {
        id: uid(),
        name: 'Mercan Danışmanlık',
        image: '/images/brand-mercan.jpg',
        text: 'Marka tescil, patent başvuruları ve fikri mülkiyet haklarını profesyonel şekilde yöneten danışmanlık markası.',
        url: 'https://mercandanismanlik.com/',
        order: 3,
        enabled: true,
      },
    ],
  },
  workApproach: {
    title: 'Çalışma Yaklaşımımız',
    subtitle: 'Projeleri yalnızca teslim etmek değil; ölçülebilir ve sürdürülebilir sistemler kurmak.',
    cards: [
      { id: uid(), icon: 'search', title: 'Analiz ederiz', text: 'İhtiyaçları, hedefleri ve mevcut yapıyı doğru şekilde değerlendiririz.', gradient: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
      { id: uid(), icon: 'wrench', title: 'Sistemi kurarız', text: 'Yazılım, e-ticaret ve dijital operasyon bileşenlerini entegre bir yapıda inşa ederiz.', gradient: 'from-purple-500 to-pink-500', order: 1, enabled: true },
      { id: uid(), icon: 'bar-chart-3', title: 'Ölçer ve geliştiririz', text: 'Performansı izler, kullanıcı deneyimini ve iş sonuçlarını sürekli iyileştiririz.', gradient: 'from-emerald-500 to-teal-500', order: 2, enabled: true },
      { id: uid(), icon: 'refresh-cw', title: 'Sürdürülebilir hale getiririz', text: 'Projeyi yayına almakla kalmaz; yönetilebilir ve büyüyebilir bir sistem olarak teslim ederiz.', gradient: 'from-orange-500 to-red-500', order: 3, enabled: true },
    ],
  },
  structure: {
    title: 'Nasıl Bir Yapı Kurduk?',
    paragraphs: [
      'Woontegra içinde, yazılım geliştirme, satış, operasyon ve marka yönetimi süreçlerini birbirinden bağımsız değil, tek bir sistem olarak ele alıyoruz.',
      'Bu yaklaşım sayesinde geliştirilen projeler sadece teknik olarak değil, ticari olarak da sürdürülebilir hale gelir.',
    ],
    stats: [
      { id: uid(), icon: 'target', title: 'Kendi markalarını yöneten yapı', text: 'Aktif olarak geliştirdiğimiz ve yönettiğimiz markalar üzerinden gerçek operasyon deneyimi.', order: 0, enabled: true },
      { id: uid(), icon: 'code-2', title: 'Yazılım + e-ticaret + dijital operasyon', text: 'Teknik geliştirme, satış ve operasyon süreçlerini birbirinden bağımsız değil, tek sistem olarak ele alıyoruz.', order: 1, enabled: true },
      { id: uid(), icon: 'lightbulb', title: 'Ürün odaklı geliştirme yaklaşımı', text: 'Geliştirilen projeler sadece teknik olarak değil, ticari olarak da sürdürülebilir hale gelir.', order: 2, enabled: true },
    ],
  },
  vision: {
    title: 'Nereye Gidiyoruz?',
    paragraphs: [
      "Woontegra'nın hedefi, yalnızca hizmet veren bir yapı olmak değil, kendi ürünleriyle büyüyen ve global ölçekte rekabet eden bir teknoloji şirketine dönüşmektir.",
      'Her geliştirdiğimiz proje, bu yapının bir parçası olarak ilerler.',
    ],
  },
  cta: {
    title: 'İşletmeniz için sürdürülebilir bir dijital yapı kuralım.',
    subtitle:
      'Web sitesi, e-ticaret altyapısı, özel yazılım ve dijital operasyon süreçlerinde size yalnızca hizmet değil, yönetilebilir bir sistem sunalım.',
    buttonText: 'İletişime Geç',
    buttonHref: '/iletisim',
  },
  metaDescription:
    'Yazılım, e-ticaret ve dijital sistemler alanında kendi ürünlerini geliştiren, markalarını yöneten bir teknoloji şirketiyiz.',
}

function mergeAbout(base: AboutPageContent, partial: Partial<AboutPageContent>): AboutPageContent {
  return {
    ...base,
    ...partial,
    hero: { ...base.hero, ...partial.hero, highlights: partial.hero?.highlights ?? base.hero.highlights },
    whatIs: { ...base.whatIs, ...partial.whatIs, paragraphs: partial.whatIs?.paragraphs ?? base.whatIs.paragraphs, cards: partial.whatIs?.cards ?? base.whatIs.cards },
    timeline: { ...base.timeline, ...partial.timeline, steps: partial.timeline?.steps ?? base.timeline.steps },
    differentiators: { ...base.differentiators, ...partial.differentiators, cards: partial.differentiators?.cards ?? base.differentiators.cards },
    brands: { ...base.brands, ...partial.brands, cards: partial.brands?.cards ?? base.brands.cards },
    workApproach: { ...base.workApproach, ...partial.workApproach, cards: partial.workApproach?.cards ?? base.workApproach.cards },
    structure: { ...base.structure, ...partial.structure, paragraphs: partial.structure?.paragraphs ?? base.structure.paragraphs, stats: partial.structure?.stats ?? base.structure.stats },
    vision: { ...base.vision, ...partial.vision, paragraphs: partial.vision?.paragraphs ?? base.vision.paragraphs },
    cta: { ...base.cta, ...partial.cta },
  }
}

function applyBuilderSections(row: Record<string, unknown>, base: AboutPageContent): AboutPageContent {
  const next = structuredClone(base)
  const sections = row.sections
  if (!Array.isArray(sections)) return next

  for (const section of sections) {
    if (!section || typeof section !== 'object') continue
    const s = section as Record<string, unknown>
    const data = s.data
    if (s.type !== 'hero' || !data || typeof data !== 'object') continue
    const d = data as Record<string, unknown>
    if (toStr(d.tag)) next.hero.eyebrow = toStr(d.tag)
    if (toStr(d.title)) next.hero.title = toStr(d.title)
    if (toStr(d.subtitle)) next.hero.subtitle = toStr(d.subtitle)
    if (toStr(d.image)) next.hero.image = toStr(d.image)
  }

  return next
}

function applyLegacyFlat(row: Record<string, unknown>, base: AboutPageContent): AboutPageContent {
  const next = structuredClone(base)
  if (toStr(row.heroTitle)) {
    next.hero.title = toStr(row.heroTitle)
    next.hero.subtitle = toStr(row.heroSubtitle, next.hero.subtitle)
  }
  if (toStr(row.whatIsTitle)) next.whatIs.title = toStr(row.whatIsTitle)
  const p1 = toStr(row.whatIsParagraph1)
  const p2 = toStr(row.whatIsParagraph2)
  const p3 = toStr(row.whatIsParagraph3)
  const p4 = toStr(row.whatIsParagraph4)
  if (p1 || p2) next.whatIs.paragraphs = [p1, p2, p3, p4].filter(Boolean)
  if (toStr(row.whatIsParagraph5)) next.whatIs.highlight = toStr(row.whatIsParagraph5)
  if (toStr(row.storyTitle)) {
    next.timeline.title = toStr(row.storyTitle)
    const steps = [...next.timeline.steps]
    const texts = [row.storyParagraph1, row.storyParagraph2, row.storyParagraph3, row.storyParagraph4].map((t) => toStr(t))
    texts.forEach((text, i) => {
      if (text && steps[i]) steps[i] = { ...steps[i], text }
    })
    next.timeline.steps = steps
  }
  if (toStr(row.differenceTitle)) next.differentiators.title = toStr(row.differenceTitle)
  const diffs = [
    { t: row.diff1Title, d: row.diff1Desc },
    { t: row.diff2Title, d: row.diff2Desc },
    { t: row.diff3Title, d: row.diff3Desc },
  ]
  diffs.forEach((d, i) => {
    if (toStr(d.t) && next.differentiators.cards[i]) {
      next.differentiators.cards[i] = { ...next.differentiators.cards[i], title: toStr(d.t), text: toStr(d.d) || next.differentiators.cards[i].text }
    }
  })
  if (toStr(row.brandsTitle)) next.brands.title = toStr(row.brandsTitle)
  const brandRows = [
    { n: row.brand1Name, d: row.brand1Desc1 },
    { n: row.brand2Name, d: row.brand2Desc1 },
    { n: row.brand3Name, d: row.brand3Desc1 },
    { n: row.brand4Name, d: row.brand4Desc1 },
  ]
  brandRows.forEach((b, i) => {
    if (toStr(b.n) && next.brands.cards[i]) {
      next.brands.cards[i] = { ...next.brands.cards[i], name: toStr(b.n), text: toStr(b.d) || next.brands.cards[i].text }
    }
  })
  return next
}

export function normalizeAboutContent(raw: unknown): AboutPageContent {
  const base = structuredClone(defaultAboutPageContent)
  if (!raw || typeof raw !== 'object') return base
  const row = raw as Record<string, unknown>

  const fromBuilder = applyBuilderSections(row, base)

  if (toNum(row.version, 0) >= ABOUT_PAGE_VERSION && row.hero && typeof row.hero === 'object') {
    const partial = row as unknown as Partial<AboutPageContent>
    return mergeAbout(fromBuilder, {
      ...partial,
      version: ABOUT_PAGE_VERSION,
      hero: {
        ...fromBuilder.hero,
        ...(partial.hero ?? {}),
        image: toStr(partial.hero?.image, fromBuilder.hero.image) || fromBuilder.hero.image,
        highlights: sortByOrder((partial.hero?.highlights ?? fromBuilder.hero.highlights).map((c, i) => normalizeHighlight(c, i)).filter(Boolean) as AboutHighlightCard[]),
      },
      whatIs: {
        ...fromBuilder.whatIs,
        ...(partial.whatIs ?? {}),
        cards: sortByOrder((partial.whatIs?.cards ?? fromBuilder.whatIs.cards).map((c, i) => normalizeSimpleCard(c, i)).filter(Boolean) as AboutSimpleCard[]),
      },
      timeline: {
        ...fromBuilder.timeline,
        ...(partial.timeline ?? {}),
        steps: sortByOrder((partial.timeline?.steps ?? fromBuilder.timeline.steps).map((s, i) => normalizeTimelineStep(s, i)).filter(Boolean) as AboutTimelineStep[]),
      },
      differentiators: {
        ...fromBuilder.differentiators,
        ...(partial.differentiators ?? {}),
        cards: sortByOrder((partial.differentiators?.cards ?? fromBuilder.differentiators.cards).map((c, i) => normalizeIconCard(c, i)).filter(Boolean) as AboutIconCard[]),
      },
      brands: {
        ...fromBuilder.brands,
        ...(partial.brands ?? {}),
        cards: sortByOrder((partial.brands?.cards ?? fromBuilder.brands.cards).map((c, i) => normalizeBrand(c, i)).filter(Boolean) as AboutBrandCard[]),
      },
      workApproach: {
        ...fromBuilder.workApproach,
        ...(partial.workApproach ?? {}),
        cards: sortByOrder((partial.workApproach?.cards ?? fromBuilder.workApproach.cards).map((c, i) => normalizeIconCard(c, i)).filter(Boolean) as AboutIconCard[]),
      },
      structure: {
        ...fromBuilder.structure,
        ...(partial.structure ?? {}),
        stats: sortByOrder((partial.structure?.stats ?? fromBuilder.structure.stats).map((c, i) => normalizeStat(c, i)).filter(Boolean) as AboutStatCard[]),
      },
      vision: { ...fromBuilder.vision, ...(partial.vision ?? {}) },
      cta: { ...fromBuilder.cta, ...(partial.cta ?? {}) },
      metaDescription: toStr(partial.metaDescription, fromBuilder.metaDescription),
    })
  }

  return applyLegacyFlat(row, fromBuilder)
}

function toNum(v: unknown, fb: number): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fb
}

function normalizeHighlight(raw: unknown, index: number): AboutHighlightCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'sparkles'), title, cardClass: toStr(r.cardClass), iconClass: toStr(r.iconClass), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeSimpleCard(raw: unknown, index: number): AboutSimpleCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), title, text: toStr(r.text ?? r.desc), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeIconCard(raw: unknown, index: number): AboutIconCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'sparkles'), title, text: toStr(r.text ?? r.desc), gradient: toStr(r.gradient, 'from-blue-500 to-cyan-500'), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeTimelineStep(raw: unknown, index: number): AboutTimelineStep | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'eye'), title, text: toStr(r.text ?? r.desc), color: toStr(r.color, 'bg-blue-500'), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeBrand(raw: unknown, index: number): AboutBrandCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const name = toStr(r.name)
  if (!name) return null
  return { id: toStr(r.id, uid()), name, text: toStr(r.text ?? r.desc), image: toStr(r.image, '/images/brand-bilirkisi.jpg'), url: toStr(r.url, '#'), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeStat(raw: unknown, index: number): AboutStatCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'target'), title, text: toStr(r.text ?? r.desc), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

export function enabledSimpleCards(cards: AboutSimpleCard[]): AboutSimpleCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledIconCards(cards: AboutIconCard[]): AboutIconCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledTimelineSteps(steps: AboutTimelineStep[]): AboutTimelineStep[] {
  return sortByOrder(steps).filter((s) => s.enabled)
}

export function enabledBrands(cards: AboutBrandCard[]): AboutBrandCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledStats(cards: AboutStatCard[]): AboutStatCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledHighlights(cards: AboutHighlightCard[]): AboutHighlightCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

/** @deprecated use defaultAboutPageContent */
export const defaultAboutContent = defaultAboutPageContent
