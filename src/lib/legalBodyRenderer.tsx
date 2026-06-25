import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LegalCompanyInfo } from '@/data/legalCompanyInfo'
import { formatLegalDate } from '@/data/legalCompanyInfo'

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

function isSafeHref(href: string): boolean {
  const trimmed = href.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  if (trimmed.startsWith('mailto:') && !trimmed.includes('<') && !trimmed.includes('javascript:')) return true
  return false
}

function applyCompanyPlaceholders(text: string, info: LegalCompanyInfo): string {
  const lastUpdated = info.lastUpdated ? formatLegalDate(info.lastUpdated) : ''
  const addressLine = info.address?.trim() ? `Adres: ${info.address.trim()}` : ''

  return text
    .replaceAll('{{company.email}}', info.email?.trim() || '')
    .replaceAll('{{company.phone}}', info.phone?.trim() || '')
    .replaceAll('{{company.website}}', info.website?.trim() || '')
    .replaceAll('{{company.address}}', info.address?.trim() || '')
    .replaceAll('{{company.addressLine}}', addressLine)
    .replaceAll('{{company.lastUpdated}}', lastUpdated)
    .replace(/\n{3,}/g, '\n\n')
}

function renderInlineText(text: string, keyPrefix: string) {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let partIndex = 0

  const pattern = new RegExp(LINK_PATTERN)
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const label = match[1]
    const href = match[2]
    if (isSafeHref(href)) {
      if (href.startsWith('mailto:')) {
        nodes.push(
          <a
            key={`${keyPrefix}-mail-${partIndex}`}
            href={href}
            className="font-medium text-emerald-700 underline-offset-4 hover:underline"
          >
            {label}
          </a>,
        )
      } else {
        nodes.push(
          <Link
            key={`${keyPrefix}-link-${partIndex}`}
            to={href}
            className="font-medium text-emerald-700 underline-offset-4 hover:underline"
          >
            {label}
          </Link>,
        )
      }
    } else {
      nodes.push(label)
    }

    lastIndex = match.index + match[0].length
    partIndex += 1
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

export function renderLegalBody(body: string, info: LegalCompanyInfo, keyPrefix: string) {
  const resolved = applyCompanyPlaceholders(body, info)
  const paragraphs = resolved.split('\n\n').map((part) => part.trim()).filter(Boolean)

  return paragraphs.map((paragraph, index) => {
    const emailOnly = paragraph.startsWith('E-posta: ') && info.email?.trim()
    if (emailOnly) {
      return (
        <p key={`${keyPrefix}-p-${index}`}>
          E-posta:{' '}
          <a
            href={`mailto:${info.email}`}
            className="font-medium text-emerald-700 underline-offset-4 hover:underline"
          >
            {info.email}
          </a>
        </p>
      )
    }

    if (paragraph.startsWith('Adres: ') && info.address?.trim()) {
      return <p key={`${keyPrefix}-p-${index}`}>Adres: {info.address}</p>
    }

    if (!paragraph) return null

    return (
      <p key={`${keyPrefix}-p-${index}`} className={paragraph.length < 120 ? 'text-sm text-slate-600' : undefined}>
        {renderInlineText(paragraph, `${keyPrefix}-p-${index}`)}
      </p>
    )
  })
}
