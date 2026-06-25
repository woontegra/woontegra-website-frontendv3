/** API / taramadan gelen ham süre etiketinden gün sayısı çıkarır. */
export function parseDaysFromLabel(rawLabel?: string | null): number | null {
  const label = rawLabel?.trim()
  if (!label) return null

  const dayMatch = label.match(/^(\d+)\s+gün$/i)
  if (dayMatch) return Number(dayMatch[1])

  return null
}

function formatDaysWithApprox(days: number): string {
  if (days === 1) return '1 gün'
  if (days === 7) return '7 gün'
  if (days === 30) return '30 gün / yaklaşık 1 ay'
  if (days === 90) return '90 gün / yaklaşık 3 ay'
  if (days === 365) return '365 gün / yaklaşık 1 yıl'
  if (days === 400) return '400 gün / yaklaşık 13 ay'

  if (days >= 365) {
    const months = Math.round(days / 30)
    if (months === 12) return `${days} gün / yaklaşık 1 yıl`
    if (months > 12 && months <= 14) return `${days} gün / yaklaşık 13 ay`
    const years = Math.round(days / 365)
    return years <= 1
      ? `${days} gün / yaklaşık 1 yıl`
      : `${days} gün / yaklaşık ${years} yıl`
  }

  if (days >= 30) {
    const months = Math.round(days / 30)
    return `${days} gün / yaklaşık ${months} ay`
  }

  return `${days} gün`
}

const PASSTHROUGH_LABELS = new Set(['Oturum süresince', 'Belirsiz'])

function isSimpleTechnicalLabel(label: string): boolean {
  return (
    PASSTHROUGH_LABELS.has(label) ||
    /^\d+\s+gün$/i.test(label) ||
    /^\d+\s+saat$/i.test(label) ||
    /^\d+\s+dakika$/i.test(label)
  )
}

/**
 * Gerçek tarama / admin verisine dayanır; kullanıcıya anlaşılır süre metni üretir.
 * adminDurationLabel (rawLabel) verilmişse ve teknik bir gün ifadesi değilse doğrudan gösterilir.
 */
export function formatCookieDuration(days?: number | null, rawLabel?: string | null): string {
  const label = rawLabel?.trim() ?? ''

  if (label && PASSTHROUGH_LABELS.has(label)) {
    return label
  }

  if (label && !isSimpleTechnicalLabel(label)) {
    return label
  }

  let resolvedDays = days ?? null
  if (resolvedDays == null && label) {
    resolvedDays = parseDaysFromLabel(label)
  }

  if (resolvedDays != null && resolvedDays > 0) {
    return formatDaysWithApprox(resolvedDays)
  }

  if (label) {
    return label
  }

  return 'Belirsiz'
}

/** Public API'den gelen duration alanı için kısayol. */
export function formatCookieDurationFromLabel(rawLabel?: string | null): string {
  return formatCookieDuration(parseDaysFromLabel(rawLabel), rawLabel)
}

export function isGoogleAnalyticsCookie(name: string, provider?: string): boolean {
  const normalized = name.trim()
  if (normalized === '_ga' || normalized.startsWith('_ga_')) return true
  return (provider ?? '').toLowerCase().includes('google analytics')
}
