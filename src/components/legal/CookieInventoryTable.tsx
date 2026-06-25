import { COOKIE_CATEGORY_LABELS, type PublicCookieItem } from '@/lib/cookieInventory'
import { formatCookieDurationFromLabel } from '@/lib/cookieDuration'

type CookieInventoryTableProps = {
  cookies: PublicCookieItem[]
  loading?: boolean
}

export function CookieInventoryTable({ cookies, loading = false }: CookieInventoryTableProps) {
  if (loading) {
    return <p className="text-slate-600">Çerez listesi yükleniyor…</p>
  }

  if (cookies.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
        Çerez listesi henüz oluşturulmadı.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Çerez adı</th>
            <th className="px-4 py-3 font-medium">Sağlayıcı</th>
            <th className="px-4 py-3 font-medium">Kategori</th>
            <th className="px-4 py-3 font-medium">Amaç</th>
            <th className="px-4 py-3 font-medium">Saklama süresi</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie, index) => (
            <tr
              key={`${cookie.name}-${cookie.domain}-${cookie.source}`}
              className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
            >
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-900">{cookie.name}</td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-700">{cookie.provider || '—'}</td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                {COOKIE_CATEGORY_LABELS[cookie.category]}
              </td>
              <td className="max-w-xs border-t border-slate-100 px-4 py-3 text-slate-700">
                <span className="block whitespace-normal break-words">{cookie.purpose}</span>
              </td>
              <td className="border-t border-slate-100 px-4 py-3 whitespace-nowrap text-slate-700">
                {formatCookieDurationFromLabel(cookie.duration)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CookieCategorySection({
  title,
  cookies,
}: {
  title: string
  cookies: PublicCookieItem[]
}) {
  if (cookies.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Bu kategoride henüz tespit edilmiş çerez bulunmuyor.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <CookieInventoryTable cookies={cookies} />
    </div>
  )
}
