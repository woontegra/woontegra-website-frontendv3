import type { ApiSuccess } from '@/types/api'
import { adminApi } from '@/services/api/client'

export type CmsPageListItem = {
  id: string
  slug: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
}

export type CmsPageDetail = CmsPageListItem & {
  content: string
}

export type CmsPageInput = {
  slug: string
  title: string
  content: string
  status: 'published' | 'draft'
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

export const cmsPagesService = {
  async list(): Promise<CmsPageListItem[]> {
    const res = await adminApi.get<ApiSuccess<CmsPageListItem[]>>('/admin/cms/pages')
    const data = unwrap<CmsPageListItem[]>(res.data)
    return Array.isArray(data) ? data : []
  },

  async getById(id: string): Promise<CmsPageDetail> {
    const res = await adminApi.get<ApiSuccess<CmsPageDetail>>(`/admin/cms/pages/${encodeURIComponent(id)}`)
    return unwrap(res.data)
  },

  async create(input: CmsPageInput): Promise<CmsPageDetail> {
    const res = await adminApi.post<ApiSuccess<CmsPageDetail>>('/pages', {
      slug: input.slug,
      title: input.title,
      content: input.content,
      status: input.status,
    })
    return unwrap(res.data)
  },

  async update(id: string, input: Partial<CmsPageInput>): Promise<CmsPageDetail> {
    const res = await adminApi.put<ApiSuccess<CmsPageDetail>>(`/admin/cms/pages/${encodeURIComponent(id)}`, input)
    return unwrap(res.data)
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/admin/cms/pages/${encodeURIComponent(id)}`)
  },
}
