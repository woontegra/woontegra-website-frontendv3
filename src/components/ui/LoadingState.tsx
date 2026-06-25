import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Props = {
  label?: string
  className?: string
}

export function LoadingState({ label = 'Yükleniyor…', className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-slate-500', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
