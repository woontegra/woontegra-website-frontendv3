import type { AdminProductInput } from '@/types/product'
import { slugifySoftwareName } from '@/types/product'
import {
  inferPresetFromForm,
  presetShowsDownloadFields,
  type AdminProductPresetId,
} from '@/constants/adminProductPresets'

export type ProductFormTabId = 'basic' | 'pricing' | 'delivery' | 'media' | 'seo'

export const PRODUCT_FORM_TABS: { id: ProductFormTabId; label: string }[] = [
  { id: 'basic', label: 'Temel Bilgiler' },
  { id: 'pricing', label: 'Fiyat & Satış' },
  { id: 'delivery', label: 'Teslimat & Lisans' },
  { id: 'media', label: 'Görseller & Dosyalar' },
  { id: 'seo', label: 'SEO & Yayın' },
]

export function validateAdminProductForm(
  form: AdminProductInput,
  presetId: AdminProductPresetId,
): string | null {
  if (form.name.trim().length < 2) {
    return 'Ürün adı en az 2 karakter olmalıdır.'
  }

  const slug = (form.slug.trim() || slugifySoftwareName(form.name)).toLowerCase()
  if (!slug) {
    return 'Ürün adresi (slug) zorunludur.'
  }

  if (!Number.isFinite(form.price) || form.price < 0) {
    return 'Geçerli bir satış fiyatı girin.'
  }

  if (form.compareAtPrice != null && form.compareAtPrice > 0 && form.compareAtPrice < form.price) {
    return 'Eski fiyat, satış fiyatından düşük olamaz.'
  }

  const onSale = form.isActive && form.purchaseEnabled

  if (onSale && (!Number.isFinite(form.price) || form.price <= 0)) {
    return 'Satışa açık ürünlerde fiyat zorunludur. Fiyat yoksa satışa kapatın veya teklif akışını kullanın.'
  }

  if (presetShowsDownloadFields(presetId) && onSale) {
    const hasDelivery = Boolean(form.downloadMediaId) || Boolean((form.downloadUrl ?? '').trim())
    if (!hasDelivery) {
      return 'Dijital teslimat için medyadan dosya seçin veya alternatif indirme adresi girin.'
    }
  }

  if (form.licenseRequired || presetId === 'LICENSED') {
    if (!form.licenseAppCode?.trim()) {
      return 'Merkezi lisans için lisans program kodu (appCode) zorunludur.'
    }
    const hasDuration =
      (form.licenseDays != null && form.licenseDays > 0) ||
      (form.licenseMonths != null && form.licenseMonths > 0)
    if (!hasDuration) {
      return 'Merkezi lisans için süre (gün veya ay) girin.'
    }
    if (form.licenseMaxDevices == null || form.licenseMaxDevices < 1) {
      return 'Merkezi lisans için cihaz limiti en az 1 olmalıdır.'
    }
  }

  return null
}

export function tabForValidationError(message: string): ProductFormTabId {
  if (message.includes('fiyat') || message.includes('Satış')) return 'pricing'
  if (message.includes('teslimat') || message.includes('indirme') || message.includes('lisans') || message.includes('appCode') || message.includes('cihaz') || message.includes('süre')) {
    return 'delivery'
  }
  if (message.includes('slug') || message.includes('adı')) return 'basic'
  return 'basic'
}

export function hasDigitalDelivery(form: AdminProductInput): boolean {
  return Boolean(form.downloadMediaId) || Boolean((form.downloadUrl ?? '').trim())
}

export function isReadyForSale(form: AdminProductInput, presetId?: AdminProductPresetId): boolean {
  const preset = presetId ?? inferPresetFromForm(form)
  if (!form.isActive || !form.purchaseEnabled || form.price <= 0) return false
  if (presetShowsDownloadFields(preset) && !hasDigitalDelivery(form)) return false
  if (form.licenseRequired && !form.licenseAppCode?.trim()) return false
  return true
}
