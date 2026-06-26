/** Panel görsel yükleme alanları için önerilen piksel boyutları. */
export type ImageUploadSpecKey =
  | 'pageHero'
  | 'homeHero'
  | 'blogCover'
  | 'productCover'
  | 'productGallery'
  | 'siteLogo'
  | 'favicon'
  | 'partnerCard'
  | 'brandLogo'
  | 'solutionHero'
  | 'aboutHero'
  | 'mediaGeneral'

export type ImageUploadSpec = {
  label: string
  hint: string
}

export const IMAGE_UPLOAD_SPECS: Record<ImageUploadSpecKey, ImageUploadSpec> = {
  pageHero: {
    label: 'Sayfa hero',
    hint: 'Önerilen: 1200×900 px (4:3). Minimum 800×600 px. JPG/PNG/WebP, tercihen 500 KB altı.',
  },
  homeHero: {
    label: 'Ana sayfa hero',
    hint: 'Önerilen: 1600×1000 px (8:5). Minimum 1200×750 px. JPG/PNG/WebP.',
  },
  blogCover: {
    label: 'Blog kapak',
    hint: 'Önerilen: 1600×1000 px (16:10). Minimum 1200×750 px. Liste ve detayda bu oranda kırpılır.',
  },
  productCover: {
    label: 'Ürün kapak',
    hint: 'Önerilen: 1200×900 px (4:3). Minimum 800×600 px. Ürün kartı ve detay sayfasında gösterilir.',
  },
  productGallery: {
    label: 'Ürün galeri',
    hint: 'Önerilen: 1200×900 px (4:3) veya 1000×1000 px (1:1). Minimum 800 px genişlik.',
  },
  siteLogo: {
    label: 'Site logosu',
    hint: 'Önerilen: 320×80 px (yatay), max yükseklik ~64 px. Şeffaf PNG veya SVG tercih edin.',
  },
  favicon: {
    label: 'Favicon',
    hint: 'Önerilen: 512×512 px kare PNG. Tarayıcı sekmesinde ~32×32 olarak gösterilir.',
  },
  partnerCard: {
    label: 'Referans / marka kartı',
    hint: 'Önerilen: 900×675 px (4:3). Minimum 600×450 px. Ana sayfa kaydırıcı kartlarında kullanılır.',
  },
  brandLogo: {
    label: 'Marka logosu',
    hint: 'Önerilen: 400×400 px kare veya 400×200 px yatay. Minimum 200 px genişlik. PNG/SVG.',
  },
  solutionHero: {
    label: 'Çözüm hero',
    hint: 'Önerilen: 1200×900 px (4:3). Minimum 800×600 px. Çözüm detay hero alanında gösterilir.',
  },
  aboutHero: {
    label: 'Hakkımızda hero',
    hint: 'Önerilen: 1200×900 px (4:3). Minimum 800×600 px.',
  },
  mediaGeneral: {
    label: 'Genel görsel',
    hint: 'Genişlik en az 800 px; hero görselleri için 1200 px ve üzeri önerilir. JPG/PNG/WebP.',
  },
}

export function imageUploadSizeHint(key: ImageUploadSpecKey): string {
  return IMAGE_UPLOAD_SPECS[key].hint
}

export function mergeImageHints(...parts: (string | undefined | null)[]): string {
  return parts.filter((part) => part?.trim()).join(' ')
}
