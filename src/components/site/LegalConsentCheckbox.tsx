import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}

export function LegalConsentCheckbox({ checked, onChange, children }: Props) {
  return (
    <label className="flex gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm leading-relaxed text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 shrink-0 rounded border-slate-300"
      />
      <span>{children}</span>
    </label>
  )
}

export function LegalExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      to={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
    >
      {children}
    </Link>
  )
}

export function LegalModalLink({
  onOpen,
  children,
}: {
  onOpen: (e: React.MouseEvent) => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onOpen(e)
      }}
      className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
    >
      {children}
    </button>
  )
}
