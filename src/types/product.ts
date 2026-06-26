import {
  hasConfiguredDownloadFiles,
  normalizeDownloadFilesConfig,
  type ProductDownloadFileEntry,
  type ProductDownloadFilesConfig,
} from '@/lib/productDownloadFiles'

export type { ProductDownloadFileEntry, ProductDownloadFilesConfig }

export type ProductType = 'DOWNLOAD' | 'SAAS' | 'SERVICE'

export type ProductCategoryBrief = {
  id: string
  name: string
  slug: string
}

export type PublicProductGalleryImage = {
  id: string
  url: string
  sortOrder: number
}

export type PublicProductListItem = {
  id: string
  name: string
  slug: string
  productType: ProductType
  shortDescription: string
  price: number
  compareAtPrice: number | null
  currency: string
  isActive?: boolean
  isFeatured: boolean
  sortOrder: number
  version: string | null
  purchaseEnabled: boolean
  licenseMonths?: number
  coverImage: string | null
  category: ProductCategoryBrief | null
}

export type PublicProductDetail = PublicProductListItem & {
  description: string
  seoTitle: string | null
  seoDescription: string | null
  galleryImages: PublicProductGalleryImage[]
  featureBullets: string
  licenseRequired: boolean
  licenseDays: number | null
  licenseMaxDevices: number | null
  hasDownload: boolean
  publicDownloadFiles?: PublicProductDownloadFile[]
}

export type PublicProductDownloadFile = {
  label: string
  downloadPath: string
  filename: string
  version?: string
  size?: string
  type?: 'setup' | 'portable' | 'other'
  buttonLabel?: string
}

export type AdminProductGalleryImage = {
  id: string
  sortOrder: number
  mediaId: string
  url: string
  fileType: string
  originalName: string
  fileSize: number
}

export type AdminProduct = {
  id: string
  name: string
  slug: string
  productType: ProductType
  shortDescription: string
  description: string
  price: number
  compareAtPrice: number | null
  currency: string
  isActive: boolean
  purchaseEnabled: boolean
  licenseMonths: number
  licenseRequired: boolean
  licenseAppCode: string | null
  licenseDays: number | null
  licenseMaxDevices: number | null
  featureBullets: string
  isFeatured: boolean
  sortOrder: number
  version: string | null
  coverImage: string | null
  downloadUrl: string | null
  categoryId: string | null
  category: ProductCategoryBrief | null
  seoTitle: string | null
  seoDescription: string | null
  coverImageMediaId: string | null
  downloadMediaId: string | null
  coverMedia: { id: string; url: string; fileType: string } | null
  downloadMedia: { id: string; url: string; fileType: string; originalName: string; fileSize: number } | null
  galleryImages: AdminProductGalleryImage[]
  downloadFiles?: ProductDownloadFilesConfig | null
  createdAt: string
  updatedAt: string
  deliveryLinkMissing?: boolean
}

export type AdminProductInput = {
  name: string
  slug: string
  productType: ProductType
  shortDescription: string
  description: string
  price: number
  compareAtPrice: number | null
  currency: string
  isActive: boolean
  purchaseEnabled: boolean
  licenseMonths: number
  licenseRequired: boolean
  licenseAppCode: string | null
  licenseDays: number | null
  licenseMaxDevices: number | null
  featureBullets: string
  isFeatured: boolean
  sortOrder: number
  version: string
  coverImage?: string
  downloadUrl?: string
  categoryId?: string | null
  seoTitle?: string
  seoDescription?: string
  coverImageMediaId?: string | null
  downloadMediaId?: string | null
  galleryMediaIds?: string[]
  downloadFiles?: ProductDownloadFilesConfig | null
}

export type AdminProductListParams = {
  search?: string
  isActive?: 'true' | 'false' | 'all'
  categoryId?: string
  productType?: ProductType
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : fallback
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function toString(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function toProductType(value: unknown): ProductType {
  if (value === 'SAAS' || value === 'SERVICE' || value === 'DOWNLOAD') return value
  return 'DOWNLOAD'
}

function normalizeCategory(raw: unknown): ProductCategoryBrief | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const id = toString(c.id)
  if (!id) return null
  return { id, name: toString(c.name), slug: toString(c.slug) }
}

function pickCoverImage(raw: Record<string, unknown>): string | null {
  const coverMedia = raw.coverMedia as Record<string, unknown> | null | undefined
  const fromMedia = coverMedia?.url ? toString(coverMedia.url) : ''
  if (fromMedia) return fromMedia
  const direct = toString(raw.coverImage || raw.coverUrl || raw.image)
  return direct || null
}

function normalizeGalleryImages(raw: unknown): PublicProductGalleryImage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const url = toString(row.url)
      if (!url) return null
      return {
        id: toString(row.id, `gallery-${index}`),
        url,
        sortOrder: toNumber(row.sortOrder, index),
      }
    })
    .filter((x): x is PublicProductGalleryImage => x !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function normalizePublicListItem(raw: unknown): PublicProductListItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  const slug = toString(row.slug)
  if (!id || !slug) return null

  return {
    id,
    name: toString(row.name, 'Yazılım'),
    slug,
    productType: toProductType(row.productType),
    shortDescription: toString(row.shortDescription),
    price: toNumber(row.price),
    compareAtPrice: toNullableNumber(row.compareAtPrice),
    currency: toString(row.currency, 'TRY') || 'TRY',
    isActive: row.isActive === undefined ? true : toBool(row.isActive, true),
    isFeatured: toBool(row.isFeatured, false),
    sortOrder: toNumber(row.sortOrder),
    version: row.version == null || row.version === '' ? null : toString(row.version),
    purchaseEnabled: row.purchaseEnabled === undefined ? true : toBool(row.purchaseEnabled, true),
    licenseMonths: toNumber(row.licenseMonths, 12),
    coverImage: pickCoverImage(row),
    category: normalizeCategory(row.category),
  }
}

export function normalizePublicList(raw: unknown): PublicProductListItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizePublicListItem)
    .filter((x): x is PublicProductListItem => x !== null)
    .filter((x) => x.isActive !== false)
}

export function normalizePublicDetail(raw: unknown): PublicProductDetail | null {
  const base = normalizePublicListItem(raw)
  if (!base || !raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>

  return {
    ...base,
    description: toString(row.description),
    seoTitle: row.seoTitle == null || row.seoTitle === '' ? null : toString(row.seoTitle),
    seoDescription:
      row.seoDescription == null || row.seoDescription === '' ? null : toString(row.seoDescription),
    galleryImages: normalizeGalleryImages(row.galleryImages),
    featureBullets: toString(row.featureBullets),
    licenseRequired: toBool(row.licenseRequired, false),
    licenseDays: toNullableNumber(row.licenseDays),
    licenseMaxDevices: toNullableNumber(row.licenseMaxDevices),
    hasDownload: toBool(row.hasDownload, false),
    publicDownloadFiles: normalizePublicDownloadFiles(row.publicDownloadFiles),
  }
}

function normalizePublicDownloadFiles(raw: unknown): PublicProductDownloadFile[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  const files: PublicProductDownloadFile[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const downloadPath = toString(row.downloadPath)
    const label = toString(row.label)
    const filename = toString(row.filename, 'download.exe')
    if (!downloadPath || !label) continue
    const typeRaw = row.type
    const type =
      typeRaw === 'setup' || typeRaw === 'portable' || typeRaw === 'other' ? typeRaw : undefined
    files.push({
      label,
      downloadPath,
      filename,
      version: row.version == null ? undefined : toString(row.version),
      size: row.size == null ? undefined : toString(row.size),
      type,
      buttonLabel: row.buttonLabel == null ? undefined : toString(row.buttonLabel),
    })
  }
  return files.length > 0 ? files : undefined
}

export function normalizeAdminProduct(raw: unknown): AdminProduct | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null

  const galleryRaw = Array.isArray(row.galleryImages) ? row.galleryImages : []
  const galleryImages: AdminProductGalleryImage[] = galleryRaw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const g = item as Record<string, unknown>
      const mediaId = toString(g.mediaId)
      const url = toString(g.url)
      if (!url) return null
      return {
        id: toString(g.id, `g-${index}`),
        sortOrder: toNumber(g.sortOrder, index),
        mediaId: mediaId || toString(g.id, `m-${index}`),
        url,
        fileType: toString(g.fileType),
        originalName: toString(g.originalName),
        fileSize: toNumber(g.fileSize),
      }
    })
    .filter((x): x is AdminProductGalleryImage => x !== null)

  const coverMediaRaw = row.coverMedia as Record<string, unknown> | null | undefined

  return {
    id,
    name: toString(row.name),
    slug: toString(row.slug),
    productType: toProductType(row.productType),
    shortDescription: toString(row.shortDescription),
    description: toString(row.description),
    price: toNumber(row.price),
    compareAtPrice: toNullableNumber(row.compareAtPrice),
    currency: toString(row.currency, 'TRY') || 'TRY',
    isActive: toBool(row.isActive, true),
    purchaseEnabled: toBool(row.purchaseEnabled, true),
    licenseMonths: toNumber(row.licenseMonths, 12),
    licenseRequired: toBool(row.licenseRequired, false),
    licenseAppCode: row.licenseAppCode == null ? null : toString(row.licenseAppCode),
    licenseDays: toNullableNumber(row.licenseDays),
    licenseMaxDevices: toNullableNumber(row.licenseMaxDevices),
    featureBullets: toString(row.featureBullets),
    isFeatured: toBool(row.isFeatured, false),
    sortOrder: toNumber(row.sortOrder),
    version: row.version == null || row.version === '' ? null : toString(row.version),
    coverImage: pickCoverImage(row),
    downloadUrl: row.downloadUrl == null || row.downloadUrl === '' ? null : toString(row.downloadUrl),
    categoryId: row.categoryId == null || row.categoryId === '' ? null : toString(row.categoryId),
    category: normalizeCategory(row.category),
    seoTitle: row.seoTitle == null || row.seoTitle === '' ? null : toString(row.seoTitle),
    seoDescription:
      row.seoDescription == null || row.seoDescription === '' ? null : toString(row.seoDescription),
    coverImageMediaId:
      row.coverImageMediaId == null || row.coverImageMediaId === '' ? null : toString(row.coverImageMediaId),
    downloadMediaId:
      row.downloadMediaId == null || row.downloadMediaId === '' ? null : toString(row.downloadMediaId),
    coverMedia: coverMediaRaw?.url
      ? {
          id: toString(coverMediaRaw.id),
          url: toString(coverMediaRaw.url),
          fileType: toString(coverMediaRaw.fileType),
        }
      : null,
    downloadMedia: (() => {
      const dm = row.downloadMedia as Record<string, unknown> | null | undefined
      if (!dm?.url) return null
      return {
        id: toString(dm.id),
        url: toString(dm.url),
        fileType: toString(dm.fileType),
        originalName: toString(dm.originalName),
        fileSize: toNumber(dm.fileSize),
      }
    })(),
    galleryImages,
    downloadFiles: row.downloadFiles == null ? null : normalizeAdminDownloadFiles(row.downloadFiles),
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
    deliveryLinkMissing: toBool(row.deliveryLinkMissing, false),
  }
}

export function normalizeAdminList(raw: unknown): AdminProduct[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAdminProduct).filter((x): x is AdminProduct => x !== null)
}

function normalizeAdminDownloadFiles(raw: unknown): ProductDownloadFilesConfig | null {
  if (!raw || typeof raw !== 'object') return null
  const normalized = normalizeDownloadFilesConfig(raw)
  if (!hasConfiguredDownloadFiles(normalized) && !normalized.version?.trim()) return null
  return normalized
}

export function slugifySoftwareName(name: string): string {
  // Türkçe harfler (özellikle ı/İ) NFD ile düzgün parçalanmadığı için explicit map gerekiyor.
  const TR_MAP: Record<string, string> = {
    ç: 'c',
    Ç: 'c',
    ğ: 'g',
    Ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    Ö: 'o',
    ş: 's',
    Ş: 's',
    ü: 'u',
    Ü: 'u',
  }

  let s = name.trim()
  for (const [k, v] of Object.entries(TR_MAP)) s = s.split(k).join(v)

  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .slice(0, 80) || 'yazilim'
  )
}
