import type { ApiSuccess } from '@/types/api'
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductListParams,
} from '@/types/product'
import { normalizeAdminList, normalizeAdminProduct } from '@/types/product'
import { adminApi, getErrorMessage } from '@/services/api/client'

function unwrapData<T>(payload: unknown, label: string): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  if (Array.isArray(payload)) return payload
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const adminProductsService = {
  async list(params?: AdminProductListParams): Promise<AdminProduct[]> {
    const res = await adminApi.get<ApiSuccess<AdminProduct[]>>('/admin/products', { params })
    return normalizeAdminList(unwrapData(res.data, 'adminProducts.list'))
  },

  async getById(id: string): Promise<AdminProduct> {
    const res = await adminApi.get<ApiSuccess<AdminProduct>>(`/admin/products/${encodeURIComponent(id)}`)
    const row = normalizeAdminProduct(unwrapData(res.data, 'adminProducts.getById'))
    if (!row) throw new Error('Yazılım bulunamadı')
    return row
  },

  async create(payload: AdminProductInput): Promise<AdminProduct> {
    const res = await adminApi.post<ApiSuccess<AdminProduct>>('/admin/products', payload)
    const row = normalizeAdminProduct(unwrapData(res.data, 'adminProducts.create'))
    if (!row) throw new Error('Yazılım oluşturulamadı')
    return row
  },

  async update(id: string, payload: Partial<AdminProductInput>): Promise<AdminProduct> {
    const res = await adminApi.patch<ApiSuccess<AdminProduct>>(
      `/admin/products/${encodeURIComponent(id)}`,
      payload,
    )
    const row = normalizeAdminProduct(unwrapData(res.data, 'adminProducts.update'))
    if (!row) throw new Error('Yazılım güncellenemedi')
    return row
  },

  async deactivate(id: string): Promise<void> {
    await adminApi.delete(`/admin/products/${encodeURIComponent(id)}`)
  },
}

export { getErrorMessage }
