import type { ApiSuccess } from '@/types/api'
import { publicApi } from '@/services/api/client'

export type ContactMessagePayload = {
  name: string
  email: string
  message: string
  phone?: string
  company?: string
}

export const contactMessagesService = {
  async create(payload: ContactMessagePayload): Promise<void> {
    await publicApi.post<ApiSuccess<unknown>>('/contact-messages', payload)
  },
}
