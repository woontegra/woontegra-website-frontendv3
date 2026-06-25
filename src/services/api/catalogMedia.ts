import axios from 'axios'
import type { ApiSuccess } from '@/types/api'
import type { CatalogMedia, CatalogMediaFileType } from '@/types/catalogMedia'
import { normalizeCatalogMedia, normalizeCatalogMediaList } from '@/types/catalogMedia'
import { adminApi } from '@/services/api/client'
import { useAuthStore } from '@/store/authStore'
import { getApiBaseUrl } from '@/utils/env'

export const catalogMediaService = {
  async list(fileType?: CatalogMediaFileType): Promise<CatalogMedia[]> {
    const res = await adminApi.get<ApiSuccess<CatalogMedia[]>>('/admin/media', {
      params: fileType ? { fileType } : undefined,
    })
    const data = res.data?.data
    return normalizeCatalogMediaList(data)
  },

  async upload(file: File): Promise<CatalogMedia> {
    const form = new FormData()
    form.append('file', file)
    const token = useAuthStore.getState().adminToken
    const res = await axios.post<ApiSuccess<CatalogMedia>>(
      `${getApiBaseUrl()}/admin/media/upload`,
      form,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    )
    const row = normalizeCatalogMedia(res.data?.data)
    if (!row) throw new Error('Yükleme yanıtı geçersiz')
    return row
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/admin/media/${encodeURIComponent(id)}`)
  },
}
