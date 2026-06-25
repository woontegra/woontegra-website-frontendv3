import type { AdminProductInput, ProductType } from '@/types/product'

export type AdminProductPresetId =
  | 'DOWNLOADABLE'
  | 'LICENSED'
  | 'SAAS'
  | 'SERVICE'
  | 'FREE_TOOL'

export type AdminProductPreset = {
  id: AdminProductPresetId
  label: string
  description: string
}

export const ADMIN_PRODUCT_PRESETS: AdminProductPreset[] = [
  {
    id: 'DOWNLOADABLE',
    label: 'İndirilebilir Masaüstü Program',
    description: 'Ödeme sonrası dosya indirme; e-posta ve müşteri hesabından erişim.',
  },
  {
    id: 'LICENSED',
    label: 'Merkezi Lisanslı Program',
    description: 'İndirilebilir program + merkezi Woontegra Lisans Server lisans bildirimi.',
  },
  {
    id: 'SAAS',
    label: 'SaaS / Abonelik',
    description: 'Web tabanlı çoklu kullanıcı; abonelik süresi ve isteğe bağlı merkezi lisans.',
  },
  {
    id: 'SERVICE',
    label: 'Hizmet / Teklif',
    description: 'Satışa kapalı veya teklif alınan hizmet; indirme/lisans alanları gizlenir.',
  },
  {
    id: 'FREE_TOOL',
    label: 'Ücretsiz Araç',
    description: 'Ücretsiz erişim; sepete ekleme kapalı, bilgi veya teklif akışı.',
  },
]

export function inferPresetFromForm(form: AdminProductInput): AdminProductPresetId {
  if (form.productType === 'SERVICE') return 'SERVICE'
  if (form.productType === 'SAAS') return 'SAAS'
  if (!form.purchaseEnabled || form.price <= 0) return 'FREE_TOOL'
  if (form.licenseRequired) return 'LICENSED'
  return 'DOWNLOADABLE'
}

export function applyProductPreset(
  presetId: AdminProductPresetId,
  current: AdminProductInput,
): AdminProductInput {
  const base = { ...current }

  switch (presetId) {
    case 'DOWNLOADABLE':
      return {
        ...base,
        productType: 'DOWNLOAD',
        licenseRequired: false,
        licenseAppCode: null,
        licenseDays: null,
        licenseMaxDevices: null,
        purchaseEnabled: true,
      }
    case 'LICENSED':
      return {
        ...base,
        productType: 'DOWNLOAD',
        licenseRequired: true,
        licenseAppCode: base.licenseAppCode || 'MUVEKKIL_KASA_DESKTOP',
        licenseDays: base.licenseDays ?? 365,
        licenseMaxDevices: base.licenseMaxDevices ?? 1,
        purchaseEnabled: true,
      }
    case 'SAAS':
      return {
        ...base,
        productType: 'SAAS',
        licenseMonths: base.licenseMonths || 12,
        purchaseEnabled: true,
      }
    case 'SERVICE':
      return {
        ...base,
        productType: 'SERVICE',
        licenseRequired: false,
        licenseAppCode: null,
        licenseDays: null,
        licenseMaxDevices: null,
        purchaseEnabled: false,
      }
    case 'FREE_TOOL':
      return {
        ...base,
        productType: 'DOWNLOAD',
        price: 0,
        compareAtPrice: null,
        licenseRequired: false,
        licenseAppCode: null,
        licenseDays: null,
        licenseMaxDevices: null,
        purchaseEnabled: false,
      }
    default:
      return base
  }
}

export function presetShowsDownloadFields(presetId: AdminProductPresetId): boolean {
  return presetId === 'DOWNLOADABLE' || presetId === 'LICENSED'
}

export function presetShowsLicenseFields(presetId: AdminProductPresetId): boolean {
  return presetId === 'LICENSED' || presetId === 'SAAS'
}

export function presetShowsSaasFields(presetId: AdminProductPresetId): boolean {
  return presetId === 'SAAS'
}

export function deliveryTypeLabel(
  presetId: AdminProductPresetId,
  form: AdminProductInput,
): string {
  if (presetId === 'SERVICE') return 'Hizmet / teklif'
  if (presetId === 'FREE_TOOL') return 'Ücretsiz erişim'
  if (presetId === 'SAAS') return 'SaaS / abonelik'
  if (form.licenseRequired) return 'Dijital + merkezi lisans'
  if (form.downloadMediaId || (form.downloadUrl ?? '').trim()) return 'Dijital dosya'
  return 'Teslimat tanımlanmadı'
}

export function saleStatusLabel(form: AdminProductInput): string {
  if (!form.isActive) return 'Yayında değil'
  if (!form.purchaseEnabled) return 'Satış kapalı'
  if (!Number.isFinite(form.price) || form.price <= 0) return 'Fiyatsız — teklif'
  return 'Satışta'
}

export function licenseStatusLabel(form: AdminProductInput): string {
  if (!form.licenseRequired) return 'Merkezi lisans yok'
  if (!form.licenseAppCode?.trim()) return 'AppCode eksik'
  return form.licenseAppCode.trim()
}

export function productTypeFromPreset(presetId: AdminProductPresetId): ProductType {
  if (presetId === 'SAAS') return 'SAAS'
  if (presetId === 'SERVICE') return 'SERVICE'
  return 'DOWNLOAD'
}
