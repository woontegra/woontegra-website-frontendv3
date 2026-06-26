/**
 * public/sitemap.xml ve robots.txt üretir.
 * Build öncesi çalışır; ürün ve blog URL'leri canlı API'den alınır (SITEMAP_API_BASE).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(rootDir, 'public')

const SITE_URL = (process.env.SITEMAP_SITE_URL ?? 'https://woontegra.com').replace(/\/$/, '')
const API_BASE = (
  process.env.SITEMAP_API_BASE ?? 'https://websitebackend-production-ab6e.up.railway.app'
).replace(/\/$/, '')

const today = new Date().toISOString().slice(0, 10)

const SERVICE_SLUGS = [
  'yazilim-gelistirme',
  'web-tasarim',
  'e-ticaret',
  'saas',
  'marka-patent-vekilligi',
  'oyun-gelistirme',
  'dijital-danismanlik',
]

const SOLUTION_SLUGS = ['bilirkisi-hesaplama', 'datca-topikal']

/** @type {{ path: string; changefreq: string; priority: string }[]} */
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/hakkimizda', changefreq: 'monthly', priority: '0.8' },
  { path: '/hizmetler', changefreq: 'weekly', priority: '0.9' },
  { path: '/cozumler', changefreq: 'weekly', priority: '0.9' },
  { path: '/yazilimlar', changefreq: 'weekly', priority: '0.9' },
  { path: '/ucretsiz-araclar', changefreq: 'monthly', priority: '0.8' },
  { path: '/ucretsiz-araclar/sifre-kasasi', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  { path: '/sss', changefreq: 'monthly', priority: '0.6' },
  { path: '/iletisim', changefreq: 'monthly', priority: '0.6' },
  { path: '/teklif-al', changefreq: 'monthly', priority: '0.6' },
  { path: '/kvkk-aydinlatma-metni', changefreq: 'yearly', priority: '0.5' },
  { path: '/gizlilik-politikasi', changefreq: 'yearly', priority: '0.5' },
  { path: '/cerez-politikasi', changefreq: 'yearly', priority: '0.5' },
  { path: '/iade-iptal-kosullari', changefreq: 'yearly', priority: '0.5' },
  { path: '/acik-riza-metni', changefreq: 'yearly', priority: '0.5' },
  { path: '/kullanim-sartlari', changefreq: 'yearly', priority: '0.5' },
]

const FALLBACK_BLOG_SLUGS = [
  'dijital-donusum-rehberi',
  'saas-urun-gelistirme-rehberi',
  'e-ticaret-optimizasyonu',
  'marka-tescil-sureci',
  'modern-web-teknolojileri',
  'dijital-pazarlama-stratejileri',
  'api-tasarimi-best-practices',
]

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`)
  return res.json()
}

async function fetchProductSlugs() {
  try {
    const json = await fetchJson('/api/products')
    const rows = Array.isArray(json?.data) ? json.data : []
    return rows
      .map((p) => (typeof p?.slug === 'string' ? p.slug.trim() : ''))
      .filter(Boolean)
  } catch (e) {
    console.warn('[sitemap] ürün listesi alınamadı:', e instanceof Error ? e.message : e)
    return []
  }
}

async function fetchBlogSlugs() {
  try {
    const json = await fetchJson('/api/blog/posts')
    const rows = Array.isArray(json?.data) ? json.data : []
    return rows
      .map((p) => (typeof p?.slug === 'string' ? p.slug.trim() : ''))
      .filter(Boolean)
  } catch (e) {
    console.warn('[sitemap] blog listesi alınamadı, yedek slugs kullanılıyor:', e instanceof Error ? e.message : e)
    return FALLBACK_BLOG_SLUGS
  }
}

async function fetchCategorySlugs() {
  try {
    const json = await fetchJson('/api/product-categories')
    const rows = Array.isArray(json?.data) ? json.data : []
    return rows
      .map((c) => (typeof c?.slug === 'string' ? c.slug.trim() : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(path, changefreq, priority) {
  const loc = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function main() {
  const [productSlugs, blogSlugs, categorySlugs] = await Promise.all([
    fetchProductSlugs(),
    fetchBlogSlugs(),
    fetchCategorySlugs(),
  ])

  const entries = []

  for (const page of STATIC_PAGES) {
    entries.push(urlEntry(page.path, page.changefreq, page.priority))
  }

  for (const slug of SERVICE_SLUGS) {
    entries.push(urlEntry(`/hizmetler/${slug}`, 'monthly', '0.85'))
  }

  for (const slug of SOLUTION_SLUGS) {
    entries.push(urlEntry(`/cozumler/${slug}`, 'monthly', '0.85'))
  }

  for (const slug of productSlugs) {
    entries.push(urlEntry(`/yazilimlar/${slug}`, 'weekly', '0.8'))
  }

  for (const slug of categorySlugs) {
    entries.push(urlEntry(`/kategori/${slug}`, 'weekly', '0.7'))
  }

  for (const slug of blogSlugs) {
    entries.push(urlEntry(`/blog/${slug}`, 'monthly', '0.6'))
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /giris
Disallow: /hesabim
Disallow: /musteri-giris
Disallow: /checkout
Disallow: /satinal/
Disallow: /odeme/
Disallow: /sepet

Sitemap: ${SITE_URL}/sitemap.xml
`

  mkdirSync(publicDir, { recursive: true })
  writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8')
  writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8')

  console.log(
    `[sitemap] ${entries.length} URL yazıldı (ürün: ${productSlugs.length}, blog: ${blogSlugs.length}, kategori: ${categorySlugs.length})`,
  )
}

main().catch((e) => {
  console.error('[sitemap] üretim başarısız:', e)
  process.exit(1)
})
