import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

type Props = {
  items: Array<{ label: string; value: string }>
}

export function AdminTechnicalDetails({ items }: Props) {
  const [open, setOpen] = useState(false)
  if (!items.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-500"
      >
        Teknik detaylar
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <dl className="space-y-1 border-t border-slate-200 px-3 py-2 text-xs text-slate-600">
          {items.map((item) => (
            <div key={item.label} className="flex flex-wrap gap-2">
              <dt className="font-medium text-slate-500">{item.label}:</dt>
              <dd className="font-mono">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}
