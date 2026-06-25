import type { ApiSuccess } from '@/types/api'
import type { PublicProductListItem } from '@/types/product'
import { normalizePublicList } from '@/types/product'
import { publicApi } from '@/services/api/client'

export type PublicProductCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

function normalizeCategory(raw: unknown): PublicProductCategory | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = String(row.id ?? '')
  const slug = String(row.slug ?? '')
  if (!id || !slug) return null
  return {
    id,
    name: String(row.name ?? ''),
    slug,
    description: row.description == null || row.description === '' ? null : String(row.description),
    sortOrder: Number(row.sortOrder) || 0,
  }
}

export const publicProductCategoriesService = {
  async list(): Promise<PublicProductCategory[]> {
    const res = await publicApi.get<ApiSuccess<PublicProductCategory[]>>('/product-categories')
    const data = unwrap<unknown>(res.data)
    if (!Array.isArray(data)) return []
    return data.map(normalizeCategory).filter((x): x is PublicProductCategory => x !== null)
  },

  async getBySlug(slug: string): Promise<PublicProductCategory | null> {
    const rows = await this.list()
    return rows.find((c) => c.slug === slug) ?? null
  },

  async listProducts(slug: string): Promise<PublicProductListItem[]> {
    const res = await publicApi.get<ApiSuccess<PublicProductListItem[]>>(
      `/product-categories/${encodeURIComponent(slug)}/products`,
    )
    return normalizePublicList(unwrap(res.data))
  },
}
