import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { resolveIcon } from '@/lib/iconRegistry'

type Props = {
  icon: string
  title: string
  description: string
  href?: string
  gradient?: string
  dark?: boolean
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  gradient = 'from-emerald-500 to-teal-500',
  dark = false,
}: Props) {
  const Icon = resolveIcon(icon)
  const content = (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-7 ${
        dark ? 'border-slate-700 bg-slate-800/80 hover:border-emerald-500/40' : 'border-slate-200 bg-white hover:border-emerald-200'
      }`}
    >
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md transition-transform group-hover:scale-105`}>
        <Icon className="h-6 w-6 text-white" aria-hidden />
      </div>
      <h3 className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-2 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
      {href ? (
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 group-hover:gap-2">
          Detaylı incele
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </div>
  )
  return href ? (
    <Link to={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  )
}
