import type { ApiSuccess } from '@/types/api'
import type { AboutPageContent, ContactPageContent, PageContentKey } from '@/types/pageContent'
import {
  normalizeAboutContent,
  normalizeContactContent,
  PAGE_CONTENT_KEYS,
} from '@/types/pageContent'
import { HOME_PAGE_KEY, normalizeHomePageContent, type HomePageContent } from '@/types/homePageContent'
import {
  mergeMarketingPageContent,
  type MarketingPageContent,
} from '@/types/marketingPageContent'
import {
  normalizeLegalPageContent,
  type LegalPageContent,
  type LegalPageKey,
} from '@/types/legalPageContent'
import {
  normalizeFaqPageContent,
  defaultFaqPageContent,
  type FaqPageContent,
} from '@/types/faqPageContent'
import { adminApi, publicApi } from '@/services/api/client'

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<unknown>).data
  }
  return payload
}

export const pageContentService = {
  async getRawByKey(key: string): Promise<Record<string, unknown> | null> {
    const res = await publicApi.get<ApiSuccess<Record<string, unknown> | null>>(`/page-content/${key}`)
    const data = unwrapData(res.data)
    if (data == null) return null
    if (typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>
    return null
  },

  async getLegalPage(key: LegalPageKey, defaults: LegalPageContent): Promise<LegalPageContent> {
    const raw = await this.getRawByKey(key)
    return normalizeLegalPageContent(raw, defaults)
  },

  async updateByKey(key: string, content: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await adminApi.put<ApiSuccess<Record<string, unknown>>>(`/page-content/${key}`, { content })
    const data = unwrapData(res.data)
    if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>
    return content
  },

  async updateLegalPage(key: LegalPageKey, content: LegalPageContent, defaults: LegalPageContent): Promise<LegalPageContent> {
    const merged = normalizeLegalPageContent(content, defaults)
    const saved = await this.updateByKey(key, merged as unknown as Record<string, unknown>)
    return normalizeLegalPageContent(saved, defaults)
  },

  async getRaw(key: PageContentKey): Promise<Record<string, unknown> | null> {
    const res = await publicApi.get<ApiSuccess<Record<string, unknown> | null>>(`/page-content/${key}`)
    const data = unwrapData(res.data)
    if (data == null) return null
    if (typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>
    return null
  },

  async getAbout(): Promise<AboutPageContent> {
    const raw = await this.getRaw(PAGE_CONTENT_KEYS.about)
    return normalizeAboutContent(raw)
  },

  async getContact(): Promise<ContactPageContent> {
    const raw = await this.getRaw(PAGE_CONTENT_KEYS.contact)
    return normalizeContactContent(raw)
  },

  async update(key: PageContentKey, content: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await adminApi.put<ApiSuccess<Record<string, unknown>>>(`/page-content/${key}`, { content })
    const data = unwrapData(res.data)
    if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>
    return content
  },

  async updateAbout(content: AboutPageContent): Promise<AboutPageContent> {
    const normalized = normalizeAboutContent(content)
    const saved = await this.update(PAGE_CONTENT_KEYS.about, normalized as unknown as Record<string, unknown>)
    return normalizeAboutContent(saved)
  },

  async updateContact(content: ContactPageContent): Promise<ContactPageContent> {
    const saved = await this.update(PAGE_CONTENT_KEYS.contact, content)
    return normalizeContactContent(saved)
  },

  async getHome(): Promise<HomePageContent> {
    const raw = await this.getRawByKey(HOME_PAGE_KEY)
    return normalizeHomePageContent(raw)
  },

  async updateHome(content: HomePageContent): Promise<HomePageContent> {
    const normalized = normalizeHomePageContent(content)
    const saved = await this.updateByKey(HOME_PAGE_KEY, normalized as unknown as Record<string, unknown>)
    return normalizeHomePageContent(saved)
  },

  async getMarketingPage(key: string, defaults: MarketingPageContent): Promise<MarketingPageContent> {
    const raw = await this.getRawByKey(key)
    return mergeMarketingPageContent(defaults, raw)
  },

  async updateMarketingPage(key: string, content: MarketingPageContent, defaults: MarketingPageContent): Promise<MarketingPageContent> {
    const normalized = mergeMarketingPageContent(defaults, content)
    const saved = await this.updateByKey(key, normalized as unknown as Record<string, unknown>)
    return mergeMarketingPageContent(defaults, saved)
  },

  async getFaqPage(): Promise<FaqPageContent> {
    const raw = await this.getRawByKey('faq')
    return normalizeFaqPageContent(raw ?? defaultFaqPageContent)
  },

  async updateFaqPage(content: FaqPageContent): Promise<FaqPageContent> {
    const normalized = normalizeFaqPageContent(content)
    const saved = await this.updateByKey('faq', normalized as unknown as Record<string, unknown>)
    return normalizeFaqPageContent(saved)
  },
}
