import { validateTurkishIdentityNumber } from '@/utils/turkishIdentityNumber'

export type CheckoutBillingForm = {
  billingType: '' | 'Bireysel' | 'Kurumsal'
  identityNumber: string
  taxNumber: string
}

export function resolveCheckoutTaxNumber(form: CheckoutBillingForm): string | undefined {
  if (form.billingType === 'Bireysel') {
    const id = form.identityNumber.trim()
    return id || undefined
  }
  if (form.billingType === 'Kurumsal') {
    const tax = form.taxNumber.trim()
    return tax || undefined
  }
  return undefined
}

export function validateCheckoutBilling(form: CheckoutBillingForm): string | null {
  if (form.billingType === 'Bireysel') {
    return validateTurkishIdentityNumber(form.identityNumber)
  }
  return null
}

export function isIndividualBillingType(billingType: string | null | undefined): boolean {
  const t = (billingType ?? '').trim().toLowerCase()
  return t === 'bireysel' || t === 'individual' || t === 'personal'
}
