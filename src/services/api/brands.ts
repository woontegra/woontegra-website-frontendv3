import type { ApiSuccess } from '@/types/api'
import { adminApi, publicApi } from '@/services/api/client'

export type Brand = {
  id: string
  name: string
  description: string | null
  image: string
  url: string | null
}

export type BrandInput = {
  name: string
  description?: string
  image: string
  url?: string
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

function normalizeBrand(raw: unknown): Brand | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = String(row.id ?? '')
  if (!id) return null
  return {
    id,
    name: String(row.name ?? ''),
    description: row.description == null ? null : String(row.description),
    image: String(row.image ?? ''),
    url: row.url == null || row.url === '' ? null : String(row.url),
  }
}

export const brandsService = {
  async listPublic(): Promise<Brand[]> {
    const res = await publicApi.get<Brand[] | ApiSuccess<Brand[]>>('/brands')
    const data = unwrap<unknown>(res.data)
    if (Array.isArray(data)) return data.map(normalizeBrand).filter((x): x is Brand => x !== null)
    return []
  },

  async listAdmin(): Promise<Brand[]> {
    return this.listPublic()
  },

  async create(payload: BrandInput): Promise<Brand> {
    const res = await adminApi.post<ApiSuccess<Brand>>('/brands', payload)
    const row = normalizeBrand(unwrap(res.data))
    if (!row) throw new Error('Marka oluşturulamadı')
    return row
  },

  async update(id: string, payload: Partial<BrandInput>): Promise<Brand> {
    const res = await adminApi.put<ApiSuccess<Brand>>(`/brands/${id}`, payload)
    const row = normalizeBrand(unwrap(res.data))
    if (!row) throw new Error('Marka güncellenemedi')
    return row
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/brands/${id}`)
  },
}
