import axios from 'axios'
import type { ApiSuccess } from '@/types/api'
import { publicApi } from '@/services/api/client'

export type PublicCmsPage = {
  slug: string
  title: string
  content: string
  status: string
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

export const cmsPagesPublicService = {
  async getBySlug(slug: string): Promise<PublicCmsPage | null> {
    try {
      const res = await publicApi.get<ApiSuccess<PublicCmsPage>>(`/pages/${encodeURIComponent(slug)}`)
      return unwrap(res.data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null
      throw err
    }
  },
}
