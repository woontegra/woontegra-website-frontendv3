function str(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

export type SmtpSettings = {
  smtpHost: string
  smtpPort: string
  smtpSecure: boolean
  smtpUser: string
  smtpPasswordConfigured: boolean
  smtpPasswordPreview: string
  contactEmail: string
}

export const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: true,
  smtpUser: '',
  smtpPasswordConfigured: false,
  smtpPasswordPreview: '',
  contactEmail: '',
}

export type SmtpSettingsPatch = {
  smtpHost?: string
  smtpPort?: string
  smtpSecure?: boolean
  smtpUser?: string
  smtpPassword?: string
}

export type TestEmailPayload = {
  to?: string
  smtpHost: string
  smtpPort: string
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string
}

export function normalizeSmtpSettings(raw: unknown): SmtpSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    smtpHost: str(o.smtpHost),
    smtpPort: str(o.smtpPort, '587') || '587',
    smtpSecure: bool(o.smtpSecure, true),
    smtpUser: str(o.smtpUser),
    smtpPasswordConfigured: bool(o.smtpPasswordConfigured),
    smtpPasswordPreview: str(o.smtpPasswordPreview),
    contactEmail: str(o.contactEmail),
  }
}

export type PostSalesEmailFlowItem = {
  id: string
  title: string
  description: string
  trigger: string
  backendRef: string
  active: boolean
}

export const POST_SALES_EMAIL_FLOW: PostSalesEmailFlowItem[] = [
  {
    id: 'order-bank-created',
    title: 'Havale/EFT siparişi oluşturuldu',
    description:
      'Ödeme yöntemi BANK_TRANSFER ise müşteriye havale bilgileri e-postası gönderilir (sendBankTransferOrderCreated).',
    trigger: 'Sipariş oluşturma — orders.service',
    backendRef: 'mailService.sendBankTransferOrderCreated',
    active: true,
  },
  {
    id: 'order-paytr-created',
    title: 'PayTR siparişi oluşturuldu',
    description: 'PayTR ile sipariş oluşturulduğunda otomatik müşteri e-postası gönderilmez; ödeme iframe/sayfasına yönlendirilir.',
    trigger: 'Sipariş oluşturma — PayTR',
    backendRef: '—',
    active: false,
  },
  {
    id: 'paytr-started',
    title: 'PayTR ödeme başlatıldı',
    description: 'Ödeme token/iframe aşamasında ayrı bir bilgilendirme e-postası yoktur.',
    trigger: 'paymentsService.startPaytr',
    backendRef: '—',
    active: false,
  },
  {
    id: 'bank-pending',
    title: 'Havale/EFT bekliyor',
    description:
      'Müşteri havale bilgilerini e-postada alır; ödeme onayı admin panelden veya banka mutabakatı ile tamamlanır.',
    trigger: 'Sipariş PENDING + BANK_TRANSFER',
    backendRef: 'sendBankTransferOrderCreated (sipariş anında)',
    active: true,
  },
  {
    id: 'payment-approved',
    title: 'Ödeme onaylandı — teslimat e-postası',
    description:
      'Ödeme PAID/PROCESSING olduğunda dijital teslimat e-postası gönderilir; downloadEmailSentAt güncellenir. Lisans sunucusu teslimatı üstlenen ürünlerde e-posta atlanabilir.',
    trigger: 'orderFulfillment.service — ödeme sonrası',
    backendRef: 'mailService.sendPaidDownloadOrder',
    active: true,
  },
  {
    id: 'bank-approved',
    title: 'Havale admin onayı',
    description: 'Admin havale onayladığında kısa onay e-postası gönderilir; ardından teslimat akışı çalışabilir.',
    trigger: 'orders.service — bankTransfer confirm',
    backendRef: 'mailService.sendBankTransferPaymentApproved',
    active: true,
  },
  {
    id: 'payment-failed',
    title: 'Ödeme başarısız',
    description: 'Backend’de ödeme başarısızlığı için otomatik müşteri e-postası tanımlı değildir.',
    trigger: 'PayTR fail / iptal',
    backendRef: '—',
    active: false,
  },
  {
    id: 'central-license',
    title: 'Merkezi lisans bilgilendirmesi',
    description:
      'licenseRequired ürünlerde teslimat merkezi Woontegra Lisans Server üzerinden yapılır; website indirme e-postası atlanabilir. Admin manuel lisans e-postası: POST /api/admin/licenses/:id/send-email.',
    trigger: 'orderFulfillment + lisans server',
    backendRef: 'mailService.sendDesktopLicenseMail (admin)',
    active: true,
  },
  {
    id: 'contact-form',
    title: 'İletişim formu',
    description:
      'V3 iletişim formu POST /api/contact-messages ile veritabanına kaydeder; otomatik e-posta göndermez. Eski POST /api/mail/contact endpointi ayrıca mevcuttur ancak V3 formu bunu kullanmaz.',
    trigger: 'Public iletişim formu',
    backendRef: 'contact-messages (DB) / mailService.sendContactForm (legacy /api/mail)',
    active: false,
  },
]
