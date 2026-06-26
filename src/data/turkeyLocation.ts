import { getCities, getDistrictsByCityCode } from 'turkey-neighbourhoods'

const cities = getCities()
const nameToCode = new Map(cities.map((c) => [c.name, c.code]))

export const TURKEY_PROVINCES: readonly string[] = cities
  .map((c) => c.name)
  .sort((a, b) => a.localeCompare(b, 'tr'))

function localeEquals(a: string, b: string): boolean {
  return a.localeCompare(b.trim(), 'tr', { sensitivity: 'accent' }) === 0
}

/** Liste dışı / farklı yazılmış il adını standart isme çevirir. */
export function matchProvinceName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return TURKEY_PROVINCES.find((p) => localeEquals(p, trimmed)) ?? ''
}

export function districtsForProvince(province: string): readonly string[] {
  const canonical = matchProvinceName(province)
  if (!canonical) return []
  const code = nameToCode.get(canonical)
  if (!code) return []
  return [...getDistrictsByCityCode(code)].sort((a, b) => a.localeCompare(b, 'tr'))
}

/** İlçe adını seçili ilin listesindeki standart yazıma çevirir. */
export function matchDistrictName(province: string, district: string): string {
  const trimmed = district.trim()
  if (!trimmed) return ''
  const canonicalProvince = matchProvinceName(province)
  if (!canonicalProvince) return ''
  return districtsForProvince(canonicalProvince).find((d) => localeEquals(d, trimmed)) ?? ''
}
