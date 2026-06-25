import type { ApiSuccess } from '@/types/api'
import {
  legalCheckoutPreviewVariables,
  normalizePublicLegalDocument,
  type LegalDocType,
  type PublicLegalDocument,
} from '@/types/legalDocuments'
import { publicApi } from '@/services/api/client'

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

export const legalDocumentsService = {
  async getByType(type: LegalDocType): Promise<PublicLegalDocument | null> {
    const res = await publicApi.get<ApiSuccess<unknown>>(`/legal-documents/${encodeURIComponent(type)}`)
    return normalizePublicLegalDocument(unwrap(res.data))
  },

  async preview(
    type: LegalDocType,
    variant?: 'DOWNLOAD' | 'SAAS',
    variables?: Record<string, string>,
  ): Promise<PublicLegalDocument | null> {
    const res = await publicApi.post<ApiSuccess<unknown>>('/legal-documents/preview', {
      type,
      variables: variables ?? legalCheckoutPreviewVariables(),
      ...(variant ? { variant } : {}),
    })
    return normalizePublicLegalDocument(unwrap(res.data))
  },
}
