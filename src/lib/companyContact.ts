export function formatPhoneForTel(phone: string): string {
  return phone.replace(/\s/g, '').replace(/[^\d+]/g, '')
}

export function buildWhatsAppUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const normalized = digits.startsWith('90') ? digits : `90${digits.replace(/^0/, '')}`
  return `https://wa.me/${normalized}`
}
