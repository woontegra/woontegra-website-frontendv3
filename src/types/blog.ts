export type BlogPostStatus = 'draft' | 'published' | string

export type BlogCategory = {
  id: string
  slug: string
  name: string
  description?: string | null
}

export type PublicBlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  bodyHtml: string
  featuredImage: string | null
  status: BlogPostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category: BlogCategory | null
}

export type AdminBlogPost = PublicBlogPost

export type AdminBlogPostInput = {
  slug: string
  title: string
  excerpt?: string | null
  bodyHtml?: string | null
  featuredImage?: string | null
  categoryId?: string | null
  status?: BlogPostStatus
}

function toString(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

function toNullableString(value: unknown): string | null {
  if (value == null || value === '') return null
  return String(value)
}

function normalizeCategory(raw: unknown): BlogCategory | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null
  return {
    id,
    slug: toString(row.slug),
    name: toString(row.name),
    description: toNullableString(row.description),
  }
}

function normalizeDate(value: unknown): string | null {
  if (value == null || value === '') return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function normalizeBlogPost(raw: unknown): PublicBlogPost | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  const slug = toString(row.slug)
  const title = toString(row.title)
  if (!id || !slug || !title) return null

  return {
    id,
    slug,
    title,
    excerpt: toString(row.excerpt),
    bodyHtml: toString(row.bodyHtml || row.body || row.content),
    featuredImage: toNullableString(row.featuredImage || row.coverImage || row.image),
    status: toString(row.status, 'draft'),
    publishedAt: normalizeDate(row.publishedAt),
    createdAt: normalizeDate(row.createdAt) ?? '',
    updatedAt: normalizeDate(row.updatedAt) ?? '',
    category: normalizeCategory(row.category),
  }
}

export function normalizeBlogList(raw: unknown): PublicBlogPost[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeBlogPost)
    .filter((x): x is PublicBlogPost => x !== null)
    .filter((x) => x.status === 'published')
}

export function normalizeAdminBlogList(raw: unknown): AdminBlogPost[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeBlogPost).filter((x): x is AdminBlogPost => x !== null)
}

export function slugifyBlogTitle(title: string): string {
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

  let s = title.trim()
  for (const [k, v] of Object.entries(TR_MAP)) s = s.split(k).join(v)

  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .slice(0, 80) || 'blog-yazisi'
  )
}

export function formatBlogDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(date)
}
