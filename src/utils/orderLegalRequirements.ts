import type { ProductType } from '@/types/product'

export type OrderLegalConsentFlags = {
  needsSoftwareLicense: boolean
  needsSaasSubscription: boolean
  needsDigitalProductWaiver: boolean
  needsDigitalServiceWaiver: boolean
}

export function resolveOrderLegalConsentFlags(productTypes: ProductType[]): OrderLegalConsentFlags {
  const hasDownload = productTypes.includes('DOWNLOAD')
  const hasSaas = productTypes.includes('SAAS')
  return {
    needsSoftwareLicense: hasDownload,
    needsSaasSubscription: hasSaas,
    needsDigitalProductWaiver: hasDownload,
    needsDigitalServiceWaiver: hasSaas,
  }
}

export function checkoutLegalConsentsOk(
  flags: OrderLegalConsentFlags,
  accepted: {
    pre: boolean
    distance: boolean
    kvkk: boolean
    softwareLicense: boolean
    saasSubscription: boolean
    digitalProductWaiver: boolean
    digitalServiceWaiver: boolean
  },
): boolean {
  if (!accepted.pre || !accepted.distance || !accepted.kvkk) return false
  if (flags.needsSoftwareLicense && !accepted.softwareLicense) return false
  if (flags.needsSaasSubscription && !accepted.saasSubscription) return false
  if (flags.needsDigitalProductWaiver && !accepted.digitalProductWaiver) return false
  if (flags.needsDigitalServiceWaiver && !accepted.digitalServiceWaiver) return false
  return true
}
