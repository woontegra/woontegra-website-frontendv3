import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  title: string
  updatedLabel?: string | null
  onClose: () => void
  onAccept?: () => void
  acceptLabel?: string
  children: ReactNode
}

export function LegalDocumentModal({
  open,
  title,
  updatedLabel,
  onClose,
  onAccept,
  acceptLabel = 'Okudum ve kabul ediyorum',
  children,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-legal-modal-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Modalı kapat" onClick={onClose} />
      <div
        className="relative z-[101] flex max-h-[100dvh] w-full max-w-[900px] flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="checkout-legal-modal-title" className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">
              {title}
            </h2>
            {updatedLabel ? <p className="mt-1 text-xs text-slate-500 sm:text-sm">Son güncelleme: {updatedLabel}</p> : null}
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
            aria-label="Kapat"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          <button
            type="button"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
            onClick={onClose}
          >
            Kapat
          </button>
          {onAccept ? (
            <button
              type="button"
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:w-auto"
              onClick={() => {
                onAccept()
                onClose()
              }}
            >
              {acceptLabel}
            </button>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body,
  )
}
