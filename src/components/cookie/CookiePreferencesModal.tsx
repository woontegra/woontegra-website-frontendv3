import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, Info, Shield, X } from 'lucide-react'
import {
  COOKIE_CATEGORY_LABELS,
  fetchPublicCookies,
  type CookieCategory,
  type PublicCookieItem,
} from '@/lib/cookieInventory'
import type { CookieConsentCategories } from '@/lib/cookieConsent'
import {
  formatCookieDurationFromLabel,
  isGoogleAnalyticsCookie,
} from '@/lib/cookieDuration'

type CookiePreferencesModalProps = {
  open: boolean
  initialConsent: CookieConsentCategories | null
  onClose: () => void
  onSave: (consent: Omit<CookieConsentCategories, 'necessary' | 'updatedAt'>) => void
}

const TOGGLE_CATEGORIES: Array<Exclude<CookieCategory, 'unknown' | 'necessary'>> = [
  'analytics',
  'marketing',
  'functional',
]

const CATEGORY_DESCRIPTIONS: Record<(typeof TOGGLE_CATEGORIES)[number] | 'necessary', string> = {
  necessary: 'Sitenin temel işlevleri, güvenliği ve tercih kayıtları için gereklidir.',
  analytics: 'Ziyaret istatistikleri, sayfa performansı ve kullanım analizi.',
  marketing: 'Reklam ölçümü, kampanya performansı ve dönüşüm takibi.',
  functional: 'Ek site özellikleri, kişiselleştirme ve gelişmiş işlevler.',
}

const modalActionBase =
  'inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto'

export function CookiePreferencesModal({
  open,
  initialConsent,
  onClose,
  onSave,
}: CookiePreferencesModalProps) {
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [functional, setFunctional] = useState(false)
  const [cookies, setCookies] = useState<PublicCookieItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setAnalytics(initialConsent?.analytics === true)
    setMarketing(initialConsent?.marketing === true)
    setFunctional(initialConsent?.functional === true)
  }, [open, initialConsent])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    void fetchPublicCookies()
      .then((data) => setCookies(data.cookies))
      .finally(() => setLoading(false))
  }, [open])

  const grouped = useMemo(() => {
    const map: Record<CookieCategory, PublicCookieItem[]> = {
      necessary: [],
      analytics: [],
      marketing: [],
      functional: [],
      unknown: [],
    }
    for (const item of cookies) {
      map[item.category]?.push(item)
    }
    return map
  }, [cookies])

  if (!open) return null

  const necessaryCookies = [...grouped.necessary, ...grouped.unknown]

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/75 p-3 sm:items-center sm:p-4"
      data-testid="cookie-preferences-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div>
            <h2 id="cookie-preferences-title" className="text-xl font-bold tracking-tight text-slate-950">
              Çerez Tercihleri
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              Çerez kategorilerini aşağıdan yönetebilir, her kategoride tespit edilen çerezleri inceleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto bg-white px-4 py-5 sm:px-6">
          <CategoryBlock
            title={COOKIE_CATEGORY_LABELS.necessary}
            description={CATEGORY_DESCRIPTIONS.necessary}
            enabled
            locked
            cookies={necessaryCookies}
            loading={loading}
            icon={<Shield className="h-4 w-4" />}
          />

          {TOGGLE_CATEGORIES.map((category) => {
            const enabled =
              category === 'analytics' ? analytics : category === 'marketing' ? marketing : functional
            const setEnabled =
              category === 'analytics'
                ? setAnalytics
                : category === 'marketing'
                  ? setMarketing
                  : setFunctional

            return (
              <CategoryBlock
                key={category}
                title={COOKIE_CATEGORY_LABELS[category]}
                description={CATEGORY_DESCRIPTIONS[category]}
                enabled={enabled}
                onToggle={setEnabled}
                cookies={grouped[category]}
                loading={loading}
                showGoogleAnalyticsNote={category === 'analytics'}
              />
            )
          })}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className={`${modalActionBase} border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-400`}
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => onSave({ analytics, marketing, functional })}
            className={`${modalActionBase} bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 focus-visible:ring-emerald-600`}
          >
            Tercihleri Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}

type CategoryBlockProps = {
  title: string
  description: string
  enabled: boolean
  locked?: boolean
  onToggle?: (value: boolean) => void
  cookies: PublicCookieItem[]
  loading: boolean
  icon?: ReactNode
  showGoogleAnalyticsNote?: boolean
}

function CategoryBlock({
  title,
  description,
  enabled,
  locked = false,
  onToggle,
  cookies,
  loading,
  icon,
  showGoogleAnalyticsNote = false,
}: CategoryBlockProps) {
  const [expanded, setExpanded] = useState(false)

  const hasGoogleAnalyticsCookies = cookies.some((cookie) =>
    isGoogleAnalyticsCookie(cookie.name, cookie.provider),
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                {icon}
              </span>
            )}
            <h3 className="text-base font-bold text-slate-950">{title}</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{description}</p>
        </div>

        <ToggleSwitch
          checked={enabled}
          disabled={locked}
          onChange={(value) => onToggle?.(value)}
          label={locked ? 'Her zaman açık' : enabled ? 'Açık' : 'Kapalı'}
        />
      </div>

      {showGoogleAnalyticsNote && hasGoogleAnalyticsCookies && (
        <div className="mt-4 flex gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-xs leading-relaxed text-sky-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden />
          <p>
            Google Analytics çerezlerinin saklama süresi tarayıcı politikalarına göre değişebilir. Chrome&apos;da
            bu süre 400 güne kadar çıkabilir.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-emerald-800 transition hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        {expanded ? 'Çerezleri gizle' : `Çerezleri göster (${cookies.length})`}
        <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {expanded && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <p className="px-4 py-6 text-sm text-slate-600">Çerez listesi yükleniyor…</p>
          ) : cookies.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-600">Bu kategoride henüz tespit edilmiş çerez yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ad</th>
                    <th className="px-4 py-3 font-semibold">Sağlayıcı</th>
                    <th className="px-4 py-3 font-semibold">Amaç</th>
                    <th className="px-4 py-3 font-semibold">Süre</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((cookie, index) => (
                    <tr
                      key={`${cookie.name}-${cookie.domain}-${cookie.source}`}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="border-t border-slate-200 px-4 py-3 align-top font-semibold text-slate-950">
                        {cookie.name}
                      </td>
                      <td className="border-t border-slate-200 px-4 py-3 align-top text-slate-800">
                        {cookie.provider || '—'}
                      </td>
                      <td className="max-w-xs border-t border-slate-200 px-4 py-3 align-top text-slate-800">
                        <span className="block whitespace-normal break-words">{cookie.purpose}</span>
                      </td>
                      <td className="border-t border-slate-200 px-4 py-3 align-top whitespace-nowrap text-slate-800">
                        {formatCookieDurationFromLabel(cookie.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type ToggleSwitchProps = {
  checked: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
  label: string
}

function ToggleSwitch({ checked, disabled = false, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="inline-flex shrink-0 flex-col items-end gap-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${checked ? 'bg-emerald-600' : 'bg-slate-400'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
