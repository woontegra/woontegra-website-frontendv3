export type CustomerOrderListItem = {
  orderNo: string
  status: string
  total: number
  currency: string
  createdAt: string
  paymentStatus: string | null
  paymentProvider: string
  productSummary: string
  itemCount: number
  shippingTrackingNumber?: string | null
  lineProductTypes?: string[]
}

export type CustomerOrderItem = {
  productName: string
  productSlug: string | null
  productType: string | null
  quantity: number
  unitPrice: number
  total: number
  downloadUrl: string | null
}

export type CustomerOrderDetail = {
  orderNo: string
  status: string
  total: number
  subtotal: number
  currency: string
  customerName: string
  customerEmail: string
  paidAt: string | null
  createdAt: string
  paymentStatus: string | null
  paymentProvider: string
  licenseCodesMasked?: string[]
  items: CustomerOrderItem[]
}
