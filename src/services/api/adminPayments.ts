import { adminOrdersService } from '@/services/api/adminOrders'
import type { AdminOrderListParams, AdminPaymentRow } from '@/types/order'
import { ordersToPaymentRows } from '@/types/order'

export const adminPaymentsService = {
  /** Backend'de ayrı ödeme listesi yok; sipariş listesinden türetilir. */
  async listFromOrders(params?: AdminOrderListParams): Promise<AdminPaymentRow[]> {
    const orders = await adminOrdersService.list(params)
    return ordersToPaymentRows(orders)
  },
}

export type { AdminPaymentRow }
