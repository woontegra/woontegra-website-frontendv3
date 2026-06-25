import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { MenuSourceRow } from '@/components/admin/menu/menuTypes'
import { cn } from '@/utils/cn'

type Props = {
  title: string
  rows: MenuSourceRow[]
  emptyText: string
  adding: boolean
  defaultOpen?: boolean
  onAddSelected: (rows: MenuSourceRow[]) => Promise<void>
}

export function MenuAccordionSection({
  title,
  rows,
  emptyText,
  adding,
  defaultOpen = false,
  onAddSelected,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((r) => r.label.toLowerCase().includes(needle) || r.path.toLowerCase().includes(needle))
  }, [rows, q])

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id))

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        for (const r of filtered) next.delete(r.id)
      } else {
        for (const r of filtered) next.add(r.id)
      }
      return next
    })
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = async () => {
    const picked = rows.filter((r) => selected.has(r.id))
    if (picked.length === 0) return
    await onAddSelected(picked)
    setSelected(new Set())
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-slate-200 p-3">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">{emptyText}</p>
          ) : (
            <>
              {rows.length > 4 ? (
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara…" />
              ) : null}

              {filtered.length > 1 ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} />
                  Tümünü seç
                </label>
              ) : null}

              <ul className="max-h-52 space-y-1 overflow-y-auto">
                {filtered.map((row) => (
                  <li key={row.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50',
                        selected.has(row.id) && 'bg-brand-50/60',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={selected.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-slate-900">{row.label}</span>
                        <span className="block truncate text-xs text-slate-500">{row.path}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <Button type="button" size="sm" disabled={adding || selected.size === 0} onClick={() => void handleAdd()}>
                Menüye ekle
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
