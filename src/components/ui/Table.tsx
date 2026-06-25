import type { TdHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Props = {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: Props) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200 bg-white', className)}>
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: Props) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </thead>
  )
}

export function TBody({ children }: Props) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>
}

export function TR({ children, className }: Props) {
  return <tr className={cn('hover:bg-slate-50/80', className)}>{children}</tr>
}

export function TH({ children, className }: Props) {
  return <th className={cn('px-4 py-3', className)}>{children}</th>
}

export function TD({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 text-slate-700', className)} {...props}>
      {children}
    </td>
  )
}
