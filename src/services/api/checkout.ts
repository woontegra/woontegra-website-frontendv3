import type { ApiSuccess } from '@/types/api'
import type { CartPreviewRow } from '@/types/checkout'
import { publicApi } from '@/services/api/client'

function unwrap<T>(payload: unknown, label: string): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ApiSuccess<T>).data
    if (data !== undefined && data !== null) return data
  }
  throw new Error(`${label}: geçersiz API yanıtı`)
}

export const checkoutService = {
  async cartPreview(productIds: string[]): Promise<CartPreviewRow[]> {
    const res = await publicApi.post<ApiSuccess<CartPreviewRow[]>>('/products/cart-preview', {
      productIds,
    })
    return unwrap(res.data, 'products.cartPreview')
  },
}
