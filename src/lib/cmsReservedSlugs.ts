/** Single-segment public routes — dynamic CMS must not override these. */

export const CMS_RESERVED_SLUGS = new Set([

  'yazilimlar',

  'hakkimizda',

  'iletisim',

  'hizmetler',

  'cozumler',

  'sss',

  'teklif-al',

  'ucretsiz-araclar',

  'kategori',

  'blog',

  'on-bilgilendirme-formu',

  'mesafeli-satis-sozlesmesi',

  'gizlilik-politikasi',

  'gizlilik',

  'kvkk',

  'kvkk-aydinlatma-metni',

  'iade-iptal-kosullari',

  'cerez-politikasi',

  'acik-riza-metni',

  'kullanim-sartlari',

  'urunler',

  'checkout',

  'siparis-basarili',

  'siparis-basarisiz',

  'odeme',

  'satinal',

  'giris',

  'musteri-giris',

  'sepet',

  'hesabim',

  'admin',

  'home',

  'urun',

])



export function isReservedCmsSlug(slug: string): boolean {

  return CMS_RESERVED_SLUGS.has(slug.toLowerCase())

}



export function footerGroupIdForPageKey(key: string): string {

  if (key.startsWith('legal')) return 'yasal'

  return 'kurumsal'

}

