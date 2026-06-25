import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { resolveIcon } from '@/lib/iconRegistry'

type Props = {
  icon: string
  title: string
  description: string
  href?: string
  gradient: string
  tag?: string
}

export function MarketingFeatureCard({ icon, title, description, href, gradient, tag }: Props) {
  const Icon = resolveIcon(icon)
  const inner = (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      {tag ? <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">{tag}</span> : null}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
      {href ? (
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 group-hover:underline">
          Detaylı incele
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </div>
  )
  return href ? (
    <Link to={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  )
}
