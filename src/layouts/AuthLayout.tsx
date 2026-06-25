import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Woontegra</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Yönetici girişi</h1>
            <p className="mt-2 text-sm text-slate-500">Kurumsal site yönetim paneli</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
