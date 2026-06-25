import type { ApiSuccess } from '@/types/api'
import type { AdminBlogPost, AdminBlogPostInput } from '@/types/blog'
import { normalizeAdminBlogList, normalizeBlogPost } from '@/types/blog'
import { adminApi, getErrorMessage } from '@/services/api/client'

function unwrapData(payload: unknown, label: string): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<unknown>).data
    if (data !== undefined) return data
  }
  if (Array.isArray(payload)) return payload
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const adminBlogService = {
  async list(): Promise<AdminBlogPost[]> {
    const res = await adminApi.get<ApiSuccess<AdminBlogPost[]>>('/admin/cms/posts')
    return normalizeAdminBlogList(unwrapData(res.data, 'adminBlog.list'))
  },

  async getById(id: string): Promise<AdminBlogPost> {
    const res = await adminApi.get<ApiSuccess<AdminBlogPost>>(`/admin/cms/posts/${encodeURIComponent(id)}`)
    const row = normalizeBlogPost(unwrapData(res.data, 'adminBlog.getById'))
    if (!row) throw new Error('Yazı bulunamadı')
    return row
  },

  async create(payload: AdminBlogPostInput): Promise<AdminBlogPost> {
    const res = await adminApi.post<ApiSuccess<AdminBlogPost>>('/admin/cms/posts', payload)
    const row = normalizeBlogPost(unwrapData(res.data, 'adminBlog.create'))
    if (!row) throw new Error('Yazı oluşturulamadı')
    return row
  },

  async update(id: string, payload: Partial<AdminBlogPostInput>): Promise<AdminBlogPost> {
    const res = await adminApi.put<ApiSuccess<AdminBlogPost>>(
      `/admin/cms/posts/${encodeURIComponent(id)}`,
      payload,
    )
    const row = normalizeBlogPost(unwrapData(res.data, 'adminBlog.update'))
    if (!row) throw new Error('Yazı güncellenemedi')
    return row
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/admin/cms/posts/${encodeURIComponent(id)}`)
  },
}

export { getErrorMessage }
