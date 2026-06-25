export const PAGE_CONTENT_KEYS = {

  about: 'about',

  contact: 'contact',

} as const



export type PageContentKey = (typeof PAGE_CONTENT_KEYS)[keyof typeof PAGE_CONTENT_KEYS]



export type {

  AboutPageContent,

} from '@/types/aboutPageContent'



export {

  defaultAboutPageContent,

  defaultAboutContent,

  normalizeAboutContent,

} from '@/types/aboutPageContent'



export type ContactPageContent = {

  heroTitle?: string

  heroSubtitle?: string

  heroImage?: string

  email?: string

  phone?: string

  address?: string

  formTitle?: string

  mapEmbedUrl?: string

  whatsApp?: string

}



function toString(value: unknown): string {

  return value == null ? '' : String(value).trim()

}



export function normalizeContactContent(raw: unknown): ContactPageContent {

  if (!raw || typeof raw !== 'object') return {}

  const row = raw as Record<string, unknown>

  return {

    heroTitle: toString(row.heroTitle),

    heroSubtitle: toString(row.heroSubtitle),

    heroImage: toString(row.heroImage),

    email: toString(row.email),

    phone: toString(row.phone),

    address: toString(row.address),

    formTitle: toString(row.formTitle),

    mapEmbedUrl: toString(row.mapEmbedUrl),

    whatsApp: toString(row.whatsApp),

  }

}



export const defaultContactContent: ContactPageContent = {

  heroTitle: 'İletişim',

  heroSubtitle: 'Projeleriniz için bizimle iletişime geçin.',

  heroImage: '/images/contact-hero.jpg',

  email: 'info@woontegra.com',

  phone: '0532 317 17 55',

  address: 'İskele Mahallesi Bademli Caddesi 43/6 Datça-Muğla',

}


