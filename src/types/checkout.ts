import type { ProductType } from '@/types/product'
import type { BankTransferInfo } from '@/types/payment'

export type CreateOrderItem = {
  productId: string
  quantity: number
}

export type CreateOrderBody = {
  items: CreateOrderItem[]
  customerName: string
  customerEmail: string
  customerPhone?: string
  billingType?: string
  taxOffice?: string
  taxNumber?: string
  /** Bireysel fatura — Order.taxNumber alanına kaydedilir */
  identityNumber?: string
  companyName?: string
  deliveryCity?: string
  deliveryDistrict?: string
  deliveryLine?: string
  acceptPreInfo: boolean
  acceptDistanceSales: boolean
  acceptKvkk: boolean
  acceptSoftwareLicense?: boolean
  acceptSaasSubscription?: boolean
  acceptDigitalProductWaiver?: boolean
  acceptDigitalServiceWaiver?: boolean
  marketingConsent?: boolean
  explicitConsent?: boolean
  paymentMethod?: 'PAYTR' | 'BANK_TRANSFER'
}

export type CreateOrderResponse = {
  orderNo: string
  id: string
  status: string
  total: number
  currency: string
  paymentProvider: string
}

export type CartPreviewRow = {
  id: string
  name: string
  slug: string
  productType: ProductType
  price: number
  currency: string
  coverImage: string | null
  hasDownload: boolean
  licenseRequired?: boolean
  singleQuantity?: boolean
  matchKeys?: string[]
}

export type OrderSuccessLine = {
  productName: string
  quantity: number
  lineTotal: number
}

export type OrderSuccessPending = {
  status: 'PENDING'
  message: string
  orderNo: string
  customerEmail: string
  paymentStatusLabel: string
  paymentProvider?: string
  lines: OrderSuccessLine[]
  orderTotal: number
  currency: string
  bankTransferInfo?: BankTransferInfo | null
}

export type OrderSuccessFailed = {
  status: 'FAILED' | 'CANCELLED'
  message: string
  orderNo: string
  customerEmail: string
  paymentStatusLabel: string
  lines: OrderSuccessLine[]
  orderTotal: number
  currency: string
}

export type OrderSuccessPaidItem = {
  productName: string
  quantity: number
  lineTotal: number
  downloadUrl: string | null
}

export type OrderSuccessPaid = {
  status: 'PAID' | 'PROCESSING'
  orderNo: string
  customerEmail: string
  productName: string
  paymentStatusLabel: string
  lines: OrderSuccessLine[]
  orderTotal: number
  currency: string
  items: OrderSuccessPaidItem[]
  paidAt: string | null
  requiresEmail?: boolean
  message?: string
  paymentProvider?: string
  downloadUrl?: string | null
}

export type OrderSuccessData = OrderSuccessPending | OrderSuccessFailed | OrderSuccessPaid

export const LAST_ORDER_EMAIL_KEY = 'woontegra_last_order_email'
