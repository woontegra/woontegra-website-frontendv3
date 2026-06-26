import type { PublicProductDetail } from '@/types/product'
import { formatMoney } from '@/utils/formatMoney'
import { productTypeLabel } from '@/utils/productPurchase'

export type CheckoutLegalFormInput = {
  customerName: string
  customerEmail: string
  customerPhone: string
  billingType: '' | 'Bireysel' | 'Kurumsal'
  companyName: string
  taxOffice: string
  taxNumber: string
  identityNumber: string
  deliveryCity: string
  deliveryDistrict: string
  deliveryLine: string
}

function pick(value: string): string {
  return value.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildCheckoutLegalPreviewVariables(input: {
  form: CheckoutLegalFormInput
  product: PublicProductDetail
  quantity: number
  lineTotal: number
  currency: string
}): Record<string, string> {
  const { form, product, quantity, lineTotal, currency } = input
  const typeLabel = productTypeLabel(product.productType)
  const qtyLabel =
    product.productType === 'SAAS' || product.productType === 'SERVICE' ? `${quantity} yıl` : `${quantity} adet`
  const productList = `<ul><li><strong>${escapeHtml(product.name)}</strong> — ${escapeHtml(typeLabel)} — ${escapeHtml(qtyLabel)} — ${escapeHtml(formatMoney(lineTotal, currency))}</li></ul>`

  const vars: Record<string, string> = {
    customerName: pick(form.customerName),
    buyerName: pick(form.customerName),
    customerEmail: pick(form.customerEmail),
    email: pick(form.customerEmail),
    customerPhone: pick(form.customerPhone),
    phone: pick(form.customerPhone),
    billingType: pick(form.billingType),
    invoiceType: pick(form.billingType),
    companyName: pick(form.companyName),
    taxOffice: pick(form.taxOffice),
    taxNumber: pick(form.billingType === 'Kurumsal' ? form.taxNumber : form.identityNumber),
    identityNumber: pick(form.identityNumber),
    city: pick(form.deliveryCity),
    district: pick(form.deliveryDistrict),
    addressLine: pick(form.deliveryLine),
    address: pick(form.deliveryLine),
    orderNo: 'Ödeme onayından sonra sipariş numaranız oluşturulur.',
    orderTotal: Number.isFinite(lineTotal) ? lineTotal.toFixed(2) : '0.00',
    currency: currency === 'TRY' ? '₺' : currency,
    productList,
  }

  const addressParts = [vars.addressLine, vars.district, vars.city].filter(Boolean)
  if (addressParts.length > 0) vars.fullAddress = addressParts.join(', ')

  return Object.fromEntries(Object.entries(vars).filter(([, v]) => v !== ''))
}
