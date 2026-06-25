import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LayoutGrid, LogOut, Package } from 'lucide-react'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService } from '@/services/api/customers'

export function HesabimPage() {
  const { authed, profile } = useCustomerSession()
  const navigate = useNavigate()

  if (!authed) {
    return <Navigate to="/musteri-giris?return=%2Fhesabim" replace />
  }

  const onLogout = () => {
    customersService.logoutLocal()
    navigate('/musteri-giris', { replace: true })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <LayoutGrid className="h-8 w-8 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Hesabım{profile?.name ? ` — ${profile.name}` : ''}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Siparişlerinizi takip edin; ödeme onaylı dijital ürünleri indirin.
              </p>
              {profile?.email ? (
                <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
              ) : null}
            </div>
          </div>
        </div>

        <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
          <li>
            <Link
              to="/hesabim/siparisler"
              className="flex h-full min-h-[9.75rem] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <Package className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
              <span className="mt-3 block font-semibold text-slate-900">Siparişlerim</span>
              <span className="mt-1 block flex-1 text-sm leading-snug text-slate-600">
                Sipariş geçmişi, ödeme durumu ve dijital ürün indirmeleri.
              </span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-full min-h-[9.75rem] w-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-red-200 hover:shadow-md"
            >
              <LogOut className="h-6 w-6 shrink-0 text-red-600" aria-hidden />
              <span className="mt-3 block font-semibold text-slate-900">Çıkış</span>
              <span className="mt-1 block flex-1 text-sm leading-snug text-slate-600">Oturumu güvenle kapat</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
