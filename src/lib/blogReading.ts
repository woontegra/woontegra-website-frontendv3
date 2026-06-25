export type BlogTocItem = {
  id: string
  text: string
  level: 2 | 3
}

const WORDS_PER_MINUTE = 200

function slugifyHeading(text: string, index: number): string {
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
  let s = text.trim()
  for (const [k, v] of Object.entries(TR_MAP)) s = s.split(k).join(v)
  s = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return s || `bolum-${index + 1}`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function estimateReadingTimeMinutes(content: string): number {
  const text = stripHtml(content)
  if (!text) return 1
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} dk okuma`
}

export function enrichBlogHtml(html: string): { html: string; headings: BlogTocItem[] } {
  const trimmed = html?.trim()
  if (!trimmed) return { html: '', headings: [] }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html')
    const headings: BlogTocItem[] = []
    const usedIds = new Set<string>()

    doc.body.querySelectorAll('h2, h3').forEach((el, index) => {
      const text = el.textContent?.trim() || ''
      if (!text) return
      let id = slugifyHeading(text, index)
      let suffix = 2
      while (usedIds.has(id)) {
        id = `${slugifyHeading(text, index)}-${suffix}`
        suffix += 1
      }
      usedIds.add(id)
      el.id = id
      headings.push({ id, text, level: el.tagName === 'H3' ? 3 : 2 })
    })

    return { html: doc.body.innerHTML, headings }
  }

  return { html: trimmed, headings: [] }
}

export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content)
}
