import axios from 'axios'
import { adminApi } from '@/services/api/client'
import {
  normalizeSmtpSettings,
  type SmtpSettings,
  type SmtpSettingsPatch,
  type TestEmailPayload,
} from '@/types/emailSettings'

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>
      if (typeof o.message === 'string' && o.message.trim()) return o.message
      if (typeof o.error === 'string' && o.error.trim()) return o.error
    }
    return err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const emailSettingsService = {
  async getSmtp(): Promise<SmtpSettings> {
    const res = await adminApi.get<unknown>('/settings/admin')
    return normalizeSmtpSettings(res.data)
  },

  async updateSmtp(patch: SmtpSettingsPatch): Promise<SmtpSettings> {
    const res = await adminApi.patch<unknown>('/settings', patch)
    return normalizeSmtpSettings(res.data)
  },

  async sendTestEmail(payload: TestEmailPayload): Promise<string> {
    try {
      const res = await adminApi.post<{ success?: boolean; message?: string; error?: string }>(
        '/settings/test-email',
        payload,
      )
      return res.data?.message?.trim() || 'Test e-postası gönderildi'
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Test e-postası gönderilemedi'))
    }
  },
}
