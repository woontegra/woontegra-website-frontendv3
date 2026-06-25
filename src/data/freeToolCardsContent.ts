export const FREE_TOOL_CARDS_KEY = 'freeToolCards'

export type FreeToolCardStatus = 'active' | 'coming-soon' | 'disabled'
export type FreeToolImageKey = 'sifre-kasasi' | 'none'

export type FreeToolCardConfig = {
  id: string
  name: string
  description: string
  status: FreeToolCardStatus
  buttonText: string
  href: string
  imageKey: FreeToolImageKey
  order: number
  enabled: boolean
}

export type FreeToolCardsBundle = { cards: FreeToolCardConfig[] }

function normalizeCard(card: FreeToolCardConfig, index: number): FreeToolCardConfig {
  return {
    id: card.id || `tool-${index}`,
    name: card.name?.trim() || 'Başlıksız',
    description: card.description?.trim() || '',
    status: card.status === 'active' || card.status === 'coming-soon' || card.status === 'disabled' ? card.status : 'coming-soon',
    buttonText: card.buttonText?.trim() || 'İncele',
    href: card.href?.trim() || '#',
    imageKey: card.imageKey === 'sifre-kasasi' ? 'sifre-kasasi' : 'none',
    order: typeof card.order === 'number' ? card.order : index,
    enabled: card.enabled !== false,
  }
}

export function mergeFreeToolCards(defaults: FreeToolCardsBundle, partial?: Partial<FreeToolCardsBundle> | null): FreeToolCardsBundle {
  if (!partial?.cards?.length) return { cards: defaults.cards.map((c, i) => normalizeCard(c, i)) }
  return { cards: partial.cards.map((card, i) => normalizeCard(card, i)) }
}

export const defaultFreeToolCardsBundle: FreeToolCardsBundle = {
  cards: [
    {
      id: 'sifre-kasasi',
      name: 'Woontegra Şifre Kasası',
      description: 'Giriş bilgilerinizi yerel ve şifreli şekilde saklayan ücretsiz Windows masaüstü uygulaması.',
      status: 'active',
      buttonText: 'Aracı incele',
      href: '/ucretsiz-araclar/sifre-kasasi',
      imageKey: 'sifre-kasasi',
      order: 0,
      enabled: true,
    },
    {
      id: 'calculator',
      name: 'Dijital Hesaplayıcı Araçları',
      description: 'İş süreçleri için pratik hesaplama araçları — yakında.',
      status: 'coming-soon',
      buttonText: 'Yakında',
      href: '#',
      imageKey: 'none',
      order: 1,
      enabled: true,
    },
  ],
}

export function getActiveFreeToolCards(bundle: FreeToolCardsBundle): FreeToolCardConfig[] {
  return bundle.cards.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}

export function getToolBadge(status: FreeToolCardStatus): string {
  if (status === 'active') return 'Yayında'
  if (status === 'coming-soon') return 'Yakında'
  return 'Pasif'
}

function toolImagePath(imageKey: FreeToolImageKey): string | null {
  if (imageKey === 'sifre-kasasi') return '/images/woontegra-sifre-kasasi-ekran.png'
  return null
}

export { toolImagePath }
