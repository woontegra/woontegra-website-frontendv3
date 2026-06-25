import type { ApiSuccess } from '@/types/api'
import type { BankTransferDisplay, PaytrStartResponse } from '@/types/payment'
import { publicApi, getErrorMessage } from '@/services/api/client'

function unwrap<T>(payload: unknown, label: string): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const paymentsService = {
  async getBankTransferDisplay(): Promise<BankTransferDisplay> {
    const res = await publicApi.get<ApiSuccess<BankTransferDisplay>>('/payments/bank-transfer-display')
    return unwrap(res.data, 'payments.bankTransferDisplay')
  },

  async startPaytr(orderNo: string): Promise<string> {
    const res = await publicApi.post<ApiSuccess<PaytrStartResponse>>('/payments/paytr/start', { orderNo })
    const data = unwrap<PaytrStartResponse>(res.data, 'payments.paytrStart')
    if (!data.iframe_token?.trim()) {
      throw new Error(getErrorMessage(new Error('PayTR token alınamadı')))
    }
    return data.iframe_token
  },
}
