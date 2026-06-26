import type { PublicProductDetail, PublicProductDownloadFile } from '@/types/product'

/** Public ürün detayındaki ücretsiz indirme dosyaları (proxy path; R2 URL yok). */
export function getPublicProductDownloadFiles(
  product: Pick<PublicProductDetail, 'publicDownloadFiles'>,
): NonNullable<PublicProductDetail['publicDownloadFiles']> {
  return (product.publicDownloadFiles ?? []).filter((f) => f.downloadPath?.trim())
}

export function resolveProductDownloadButtonLabel(file: PublicProductDownloadFile): string {
  if (file.buttonLabel?.trim()) return file.buttonLabel.trim()
  if (file.type === 'setup') return 'Kurulum Sürümünü İndir'
  if (file.type === 'portable') return 'Portable Sürümü İndir'
  return file.label.trim() || 'İndir'
}
