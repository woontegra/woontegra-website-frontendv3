export type HeaderNavItem = {
  id: string
  label: string
  href: string
  end?: boolean
  openInNewTab?: boolean
  groupHeader?: boolean
  order?: number
  children?: HeaderNavItem[]
}

export const SOFTWARE_PRODUCT_SLUGS = {
  mkDesktop: 'muvekkil-kasa-defteri-yazilimi',
  mkSaas: 'muvekkil-kasa-defteri-web-tabanli',
  isletmeDefteri: 'woontegra-isletme-defteri',
} as const

export const SIFRE_KASASI_PAGE_PATH = '/ucretsiz-araclar/sifre-kasasi'

function navChild(
  id: string,
  label: string,
  href: string,
  order: number,
  groupHeader = false,
): HeaderNavItem {
  return { id, label, href, order, groupHeader }
}

export const SERVICES_NAV_CHILDREN: HeaderNavItem[] = [
  { id: 'svc-yazilim', label: 'Yazılım Geliştirme', href: '/hizmetler/yazilim-gelistirme' },
  { id: 'svc-web', label: 'Web Tasarım', href: '/hizmetler/web-tasarim' },
  { id: 'svc-ecom', label: 'E-Ticaret Çözümleri', href: '/hizmetler/e-ticaret' },
  { id: 'svc-saas', label: 'SaaS Ürün Geliştirme', href: '/hizmetler/saas' },
  { id: 'svc-marka', label: 'Marka & Patent Vekilliği', href: '/hizmetler/marka-patent-vekilligi' },
  { id: 'svc-oyun', label: 'Oyun Geliştirme', href: '/hizmetler/oyun-gelistirme' },
  { id: 'svc-danismanlik', label: 'Dijital Danışmanlık', href: '/hizmetler/dijital-danismanlik' },
]

export const SOFTWARE_NAV_CHILDREN: HeaderNavItem[] = [
  navChild('software-grp-hukuk', 'Hukuk Yazılımları', '#', 0, true),
  navChild('sw-mk-desktop', 'Müvekkil Kasa Defteri Masaüstü', `/yazilimlar/${SOFTWARE_PRODUCT_SLUGS.mkDesktop}`, 1),
  navChild('sw-mk-saas', 'Müvekkil Kasa Defteri Çoklu Kullanıcı', `/yazilimlar/${SOFTWARE_PRODUCT_SLUGS.mkSaas}`, 2),
  navChild('software-grp-isletme', 'İşletme Yazılımları', '#', 3, true),
  navChild('sw-isletme', 'Woontegra İşletme Defteri', `/yazilimlar/${SOFTWARE_PRODUCT_SLUGS.isletmeDefteri}`, 4),
  navChild('sw-sifre', 'Woontegra Şifre Kasası', SIFRE_KASASI_PAGE_PATH, 5),
]

export const DEFAULT_HEADER_NAV: HeaderNavItem[] = [
  { id: 'home', label: 'Ana sayfa', href: '/', end: true },
  { id: 'about', label: 'Hakkımızda', href: '/hakkimizda' },
  { id: 'services', label: 'Hizmetler', href: '/hizmetler', children: SERVICES_NAV_CHILDREN },
  { id: 'solutions', label: 'Çözümler', href: '/cozumler' },
  { id: 'software', label: 'Yazılımlar', href: '/yazilimlar', children: SOFTWARE_NAV_CHILDREN },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'contact', label: 'İletişim', href: '/iletisim' },
]
