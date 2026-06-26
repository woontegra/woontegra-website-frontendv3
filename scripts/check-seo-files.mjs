import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(rootDir, 'public')
const errors = []

const REQUIRED_SITEMAP_PATHS = [
  'https://woontegra.com/',
  'https://woontegra.com/hakkimizda',
  'https://woontegra.com/hizmetler',
  'https://woontegra.com/cozumler',
  'https://woontegra.com/yazilimlar',
  'https://woontegra.com/ucretsiz-araclar',
  'https://woontegra.com/blog',
  'https://woontegra.com/sss',
  'https://woontegra.com/iletisim',
  'https://woontegra.com/kvkk-aydinlatma-metni',
  'https://woontegra.com/gizlilik-politikasi',
  'https://woontegra.com/cerez-politikasi',
  'https://woontegra.com/kullanim-sartlari',
]

const STALE_SITEMAP_PATHS = [
  'https://woontegra.com/kvkk',
  'https://woontegra.com/gizlilik',
]

const sitemapPath = join(publicDir, 'sitemap.xml')
const robotsPath = join(publicDir, 'robots.txt')

if (!existsSync(sitemapPath)) errors.push('public/sitemap.xml bulunamadı')
if (!existsSync(robotsPath)) errors.push('public/robots.txt bulunamadı')

if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8')
  if (!sitemap.includes('<urlset')) errors.push('sitemap.xml geçerli bir urlset içermiyor')
  for (const path of REQUIRED_SITEMAP_PATHS) {
    if (!sitemap.includes(`<loc>${path}</loc>`)) errors.push(`sitemap.xml içinde eksik URL: ${path}`)
  }
  for (const path of STALE_SITEMAP_PATHS) {
    if (sitemap.includes(`<loc>${path}</loc>`)) errors.push(`sitemap.xml içinde eski URL: ${path}`)
  }
}

if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8')
  if (!robots.includes('Allow: /')) errors.push('robots.txt Allow: / yok')
  if (!robots.includes('Sitemap: https://woontegra.com/sitemap.xml')) {
    errors.push('robots.txt sitemap referansı yok')
  }
  if (!robots.includes('Disallow: /admin')) errors.push('robots.txt /admin engeli yok')
}

if (errors.length > 0) {
  console.error('SEO dosya kontrolü başarısız:')
  errors.forEach((error) => console.error(`  - ${error}`))
  process.exit(1)
}

console.log('SEO dosyaları hazır: sitemap.xml ve robots.txt')
