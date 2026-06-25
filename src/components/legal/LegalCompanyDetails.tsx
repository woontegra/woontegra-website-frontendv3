import type { LegalCompanyInfo } from '@/data/legalCompanyInfo'
import { formatCompanyAddress } from '@/data/legalCompanyInfo'
import { buildWhatsAppUrl, formatPhoneForTel } from '@/lib/companyContact'

type LegalCompanyDetailsProps = {
  info: LegalCompanyInfo
  showRepresentative?: boolean
}

export function LegalCompanyDetails({ info, showRepresentative = true }: LegalCompanyDetailsProps) {
  const displayAddress = formatCompanyAddress(info) || info.address?.trim()
  const whatsappUrl = info.whatsapp?.trim() ? buildWhatsAppUrl(info.whatsapp) : null

  const rows = [
    { label: 'Unvan', value: info.companyName },
    { label: 'E-posta', value: info.email, href: info.email ? `mailto:${info.email}` : undefined },
    {
      label: 'Telefon',
      value: info.phone,
      href: info.phone ? `tel:${formatPhoneForTel(info.phone)}` : undefined,
    },
    whatsappUrl ? { label: 'WhatsApp', value: info.whatsapp, href: whatsappUrl } : null,
    { label: 'Web sitesi', value: info.website, href: info.website },
    displayAddress ? { label: 'Adres', value: displayAddress } : null,
    { label: 'Vergi dairesi', value: info.taxOffice },
    { label: 'Vergi numarası', value: info.taxNumber },
    { label: 'MERSİS no', value: info.mersisNumber },
    showRepresentative && info.dataControllerRepresentative
      ? { label: 'Veri sorumlusu temsilcisi', value: info.dataControllerRepresentative }
      : null,
  ].filter((row): row is { label: string; value: string; href?: string } => Boolean(row?.value?.trim()))

  return (
    <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/50">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
          <dt className="text-sm font-medium text-slate-500">{row.label}</dt>
          <dd className="text-sm text-slate-800">
            {row.href ? (
              <a
                href={row.href}
                className="font-medium text-emerald-700 underline-offset-4 hover:underline"
                target={row.href.startsWith('http') ? '_blank' : undefined}
                rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
