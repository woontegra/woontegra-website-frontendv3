import type { ApiSuccess } from '@/types/api'
import type { PublicProductDetail, PublicProductListItem } from '@/types/product'
import { normalizePublicDetail, normalizePublicList } from '@/types/product'
import { publicApi } from '@/services/api/client'

function unwrapData<T>(payload: unknown, label: string): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  if (Array.isArray(payload)) return payload
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const productsService = {
  async list(): Promise<PublicProductListItem[]> {
    const res = await publicApi.get<ApiSuccess<PublicProductListItem[]>>('/products')
    return normalizePublicList(unwrapData(res.data, 'products.list'))
  },

  async getBySlug(slug: string): Promise<PublicProductDetail> {
    const res = await publicApi.get<ApiSuccess<PublicProductDetail>>(
      `/products/${encodeURIComponent(slug)}`,
    )
    const row = normalizePublicDetail(unwrapData(res.data, 'products.getBySlug'))
    if (!row) throw new Error('Yazılım bulunamadı')
    return row
  },
}
