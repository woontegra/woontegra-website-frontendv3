import type { ApiSuccess } from '@/types/api'
import { adminApi } from '@/services/api/client'

export type ProductCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export type ProductCategoryInput = {
  name: string
  slug?: string
  description?: string
  parentId?: string | null
  isActive?: boolean
  sortOrder?: number
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

function normalizeCategory(raw: unknown): ProductCategory | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = String(row.id ?? '')
  if (!id) return null
  return {
    id,
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: row.description == null ? null : String(row.description),
    parentId: row.parentId == null || row.parentId === '' ? null : String(row.parentId),
    isActive: row.isActive !== false,
    sortOrder: Number(row.sortOrder) || 0,
  }
}

export const productCategoriesService = {
  async list(): Promise<ProductCategory[]> {
    const res = await adminApi.get<ApiSuccess<ProductCategory[]>>('/admin/product-categories')
    const data = unwrap<unknown>(res.data)
    if (!Array.isArray(data)) return []
    return data.map(normalizeCategory).filter((x): x is ProductCategory => x !== null)
  },

  async create(payload: ProductCategoryInput): Promise<ProductCategory> {
    const res = await adminApi.post<ApiSuccess<ProductCategory>>('/admin/product-categories', payload)
    const row = normalizeCategory(unwrap(res.data))
    if (!row) throw new Error('Kategori oluşturulamadı')
    return row
  },

  async update(id: string, payload: Partial<ProductCategoryInput>): Promise<ProductCategory> {
    const res = await adminApi.patch<ApiSuccess<ProductCategory>>(`/admin/product-categories/${id}`, payload)
    const row = normalizeCategory(unwrap(res.data))
    if (!row) throw new Error('Kategori güncellenemedi')
    return row
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/admin/product-categories/${id}`)
  },
}
