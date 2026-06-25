import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const tones = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  brand: 'bg-brand-50 text-brand-700',
} as const

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof tones
}

export function Badge({ className, tone = 'default', ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
