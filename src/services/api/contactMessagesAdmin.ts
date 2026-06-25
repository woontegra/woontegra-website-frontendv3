import type { ApiSuccess } from '@/types/api'
import { adminApi } from '@/services/api/client'

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  phone: string | null
  company: string | null
  read: boolean
  createdAt: string
}

function normalize(row: unknown): ContactMessage | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  const id = String(o.id ?? '')
  if (!id) return null
  return {
    id,
    name: String(o.name ?? ''),
    email: String(o.email ?? ''),
    message: String(o.message ?? ''),
    phone: o.phone == null || o.phone === '' ? null : String(o.phone),
    company: o.company == null || o.company === '' ? null : String(o.company),
    read: o.read === true,
    createdAt: String(o.createdAt ?? ''),
  }
}

export const contactMessagesAdminService = {
  async list(): Promise<ContactMessage[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/contact-messages')
    const data = res.data && typeof res.data === 'object' && 'data' in res.data ? (res.data as ApiSuccess<unknown>).data : res.data
    if (!Array.isArray(data)) return []
    return data.map(normalize).filter((x): x is ContactMessage => x !== null)
  },

  async markAsRead(id: string): Promise<ContactMessage> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/contact-messages/${encodeURIComponent(id)}/read`)
    const row = normalize(
      res.data && typeof res.data === 'object' && 'data' in res.data ? (res.data as ApiSuccess<unknown>).data : res.data,
    )
    if (!row) throw new Error('Mesaj güncellenemedi')
    return row
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/contact-messages/${encodeURIComponent(id)}`)
  },
}
