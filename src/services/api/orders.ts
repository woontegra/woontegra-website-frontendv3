import type { ApiSuccess } from '@/types/api'
import type { CreateOrderBody, CreateOrderResponse, OrderSuccessData } from '@/types/checkout'
import { publicApi } from '@/services/api/client'

function unwrap<T>(payload: unknown, label: string): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const ordersService = {
  async create(body: CreateOrderBody): Promise<CreateOrderResponse> {
    const res = await publicApi.post<ApiSuccess<CreateOrderResponse>>('/orders', body)
    return unwrap(res.data, 'orders.create')
  },

  async getSuccess(orderNo: string, customerEmail?: string): Promise<OrderSuccessData> {
    const q = customerEmail ? `?customerEmail=${encodeURIComponent(customerEmail)}` : ''
    const res = await publicApi.get<ApiSuccess<OrderSuccessData>>(
      `/orders/success/${encodeURIComponent(orderNo)}${q}`,
    )
    return unwrap(res.data, 'orders.success')
  },
}
