import type { ApiSuccess } from '@/types/api'
import type { AdminLegalDocument, AdminLegalDocumentInput } from '@/types/legalDocuments'
import { normalizeAdminLegalDocument } from '@/types/legalDocuments'
import { adminApi } from '@/services/api/client'

function unwrapList(payload: unknown): AdminLegalDocument[] {
  const data =
    payload && typeof payload === 'object' && 'data' in payload ? (payload as ApiSuccess<unknown>).data : payload
  if (!Array.isArray(data)) return []
  return data.map(normalizeAdminLegalDocument).filter((x): x is AdminLegalDocument => Boolean(x))
}

function unwrapOne(payload: unknown): AdminLegalDocument {
  const data =
    payload && typeof payload === 'object' && 'data' in payload ? (payload as ApiSuccess<unknown>).data : payload
  const row = normalizeAdminLegalDocument(data)
  if (!row) throw new Error('Geçersiz yasal belge yanıtı')
  return row
}

export const legalDocumentsAdminService = {
  async list(): Promise<AdminLegalDocument[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/legal-documents')
    return unwrapList(res.data)
  },

  async getById(id: string): Promise<AdminLegalDocument> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/legal-documents/${encodeURIComponent(id)}`)
    return unwrapOne(res.data)
  },

  async create(body: AdminLegalDocumentInput): Promise<AdminLegalDocument> {
    const res = await adminApi.post<ApiSuccess<unknown>>('/admin/legal-documents', {
      type: body.type,
      title: body.title,
      content: body.content,
      version: body.version,
      isActive: body.isActive,
    })
    return unwrapOne(res.data)
  },

  async patch(
    id: string,
    body: Partial<Pick<AdminLegalDocumentInput, 'title' | 'content' | 'version' | 'isActive'>>,
  ): Promise<AdminLegalDocument> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/legal-documents/${encodeURIComponent(id)}`, body)
    return unwrapOne(res.data)
  },

  async deactivate(id: string): Promise<void> {
    await adminApi.delete(`/admin/legal-documents/${encodeURIComponent(id)}`)
  },

  findByType(docs: AdminLegalDocument[], type: string): AdminLegalDocument | undefined {
    return docs.find((d) => d.type === type && d.isActive)
  },
}
