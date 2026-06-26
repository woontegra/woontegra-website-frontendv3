/** T.C. Kimlik No — yalnızca doluysa 11 rakam kontrolü. */
export function sanitizeTurkishIdentityNumberInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11)
}

export function validateTurkishIdentityNumber(value: string): string | null {
  const digits = sanitizeTurkishIdentityNumberInput(value)
  if (!digits) return null
  if (digits.length !== 11) return 'T.C. Kimlik No 11 haneli olmalıdır.'
  return null
}
