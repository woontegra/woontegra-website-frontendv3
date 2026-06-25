import type { ApiSuccess } from '@/types/api'
import type { PublicBlogPost } from '@/types/blog'
import { normalizeBlogList, normalizeBlogPost } from '@/types/blog'
import { publicApi } from '@/services/api/client'

function unwrapData(payload: unknown, label: string): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<unknown>).data
    if (data !== undefined) return data
  }
  if (Array.isArray(payload)) return payload
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const blogService = {
  async list(): Promise<PublicBlogPost[]> {
    const res = await publicApi.get<ApiSuccess<PublicBlogPost[]>>('/blog/posts')
    return normalizeBlogList(unwrapData(res.data, 'blog.list'))
  },

  async getBySlug(slug: string): Promise<PublicBlogPost> {
    const res = await publicApi.get<ApiSuccess<PublicBlogPost>>(`/blog/posts/${encodeURIComponent(slug)}`)
    const row = normalizeBlogPost(unwrapData(res.data, 'blog.getBySlug'))
    if (!row || row.status !== 'published') throw new Error('Yazı bulunamadı')
    return row
  },
}
