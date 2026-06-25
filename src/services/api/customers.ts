import type { ApiSuccess } from '@/types/api'
import type { CustomerOrderDetail, CustomerOrderListItem } from '@/types/customerOrders'
import { publicApi } from '@/services/api/client'
import {
  clearCustomerSession,
  getCustomerToken,
  saveCustomerSession,
  type CustomerProfile,
} from '@/lib/customerAuth'

export type LoginRegisterResponse = {
  token: string
  customer: CustomerProfile
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

export const customersService = {
  async login(email: string, password: string): Promise<LoginRegisterResponse> {
    const res = await publicApi.post<ApiSuccess<LoginRegisterResponse>>('/customers/login', { email, password })
    const data = unwrap<LoginRegisterResponse>(res.data)
    saveCustomerSession(data.token, data.customer)
    return data
  },

  logoutLocal() {
    clearCustomerSession()
  },

  async getMe(): Promise<CustomerProfile> {
    const token = getCustomerToken()
    const res = await publicApi.get<ApiSuccess<CustomerProfile>>('/customers/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return unwrap(res.data)
  },

  async listOrders(): Promise<CustomerOrderListItem[]> {
    const token = getCustomerToken()
    const res = await publicApi.get<ApiSuccess<CustomerOrderListItem[]>>('/customers/me/orders', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return unwrap(res.data)
  },

  async getOrder(orderNo: string): Promise<CustomerOrderDetail> {
    const token = getCustomerToken()
    const res = await publicApi.get<ApiSuccess<CustomerOrderDetail>>(
      `/customers/me/orders/${encodeURIComponent(orderNo)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    )
    return unwrap(res.data)
  },
}
