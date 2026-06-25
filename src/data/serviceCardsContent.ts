import { GRADIENT_OPTIONS, ICON_OPTIONS } from '@/lib/iconRegistry'

export const SERVICE_CARDS_KEY = 'serviceCards'

export type ServiceCardConfig = {
  id: string
  title: string
  description: string
  tag: string
  icon: string
  href: string
  gradient: string
  order: number
  enabled: boolean
}

export type ServiceCardsBundle = { cards: ServiceCardConfig[] }

function normalizeCard(card: ServiceCardConfig, index: number): ServiceCardConfig {
  const icon = ICON_OPTIONS.includes(card.icon as (typeof ICON_OPTIONS)[number]) ? card.icon : 'Globe'
  const gradient = GRADIENT_OPTIONS.includes(card.gradient as (typeof GRADIENT_OPTIONS)[number])
    ? card.gradient
    : GRADIENT_OPTIONS[index % GRADIENT_OPTIONS.length]
  return {
    id: card.id || `card-${index}`,
    title: card.title?.trim() || 'Başlıksız',
    description: card.description?.trim() || '',
    tag: card.tag?.trim() || '',
    icon,
    href: card.href?.trim() || '/iletisim',
    gradient,
    order: typeof card.order === 'number' ? card.order : index,
    enabled: card.enabled !== false,
  }
}

export function mergeServiceCards(
  defaults: ServiceCardsBundle,
  partial?: Partial<ServiceCardsBundle> | null,
): ServiceCardsBundle {
  if (!partial?.cards?.length) return { cards: defaults.cards.map((c, i) => normalizeCard(c, i)) }
  return { cards: partial.cards.map((card, i) => normalizeCard(card, i)) }
}

export const defaultServiceCardsBundle: ServiceCardsBundle = {
  cards: [
    { id: 'web', title: 'Web Tasarım', description: 'Modern, hızlı ve dönüşüm odaklı kurumsal web siteleri ile güçlü dijital vitrinler.', tag: 'Kurumsal', icon: 'Globe', href: '/hizmetler/web-tasarim', gradient: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
    { id: 'ecom', title: 'E-Ticaret', description: 'Satış odaklı, yönetilebilir ve ölçeklenebilir e-ticaret altyapıları kuruyoruz.', tag: 'Satış', icon: 'ShoppingCart', href: '/hizmetler/e-ticaret', gradient: 'from-emerald-500 to-teal-500', order: 1, enabled: true },
    { id: 'seo', title: 'SEO', description: 'Arama motoru görünürlüğünü artıran teknik ve içerik odaklı optimizasyon süreçleri.', tag: 'Görünürlük', icon: 'Search', href: '/iletisim', gradient: 'from-violet-500 to-purple-500', order: 2, enabled: true },
    { id: 'marketing', title: 'Dijital Pazarlama', description: 'Kampanya, dönüşüm ve performans odaklı dijital pazarlama stratejileri.', tag: 'Performans', icon: 'Megaphone', href: '/iletisim', gradient: 'from-orange-500 to-red-500', order: 3, enabled: true },
    { id: 'social', title: 'Sosyal Medya', description: 'Marka görünürlüğünü güçlendiren içerik ve sosyal medya yönetimi.', tag: 'Marka', icon: 'Share2', href: '/iletisim', gradient: 'from-pink-500 to-rose-500', order: 4, enabled: true },
    { id: 'design', title: 'Grafik Tasarım', description: 'Kurumsal kimlik, arayüz ve görsel iletişim tasarımları.', tag: 'Tasarım', icon: 'Palette', href: '/iletisim', gradient: 'from-fuchsia-500 to-purple-500', order: 5, enabled: true },
    { id: 'consult', title: 'Danışmanlık', description: 'Dijital dönüşüm, süreç iyileştirme ve teknoloji stratejisi danışmanlığı.', tag: 'Strateji', icon: 'Lightbulb', href: '/hizmetler/dijital-danismanlik', gradient: 'from-amber-500 to-orange-500', order: 6, enabled: true },
    { id: 'custom', title: 'Özel Yazılım', description: 'İşletmenize özel, performans odaklı ve ölçeklenebilir yazılım sistemleri.', tag: 'Yazılım', icon: 'Code2', href: '/hizmetler/yazilim-gelistirme', gradient: 'from-slate-700 to-slate-900', order: 7, enabled: true },
  ],
}

export function getActiveServiceCards(bundle: ServiceCardsBundle): ServiceCardConfig[] {
  return bundle.cards.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}
