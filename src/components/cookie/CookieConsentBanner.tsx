import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import {
  acceptAllCookies,
  getCookieConsent,
  hasCookieConsent,
  OPEN_COOKIE_PREFERENCES_EVENT,
  rejectAllCookies,
  saveCookieConsent,
} from '@/lib/cookieConsent'
import { CookiePreferencesModal } from './CookiePreferencesModal'

const actionBase =
  'inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentConsent, setCurrentConsent] = useState(getCookieConsent())

  useEffect(() => {
    setVisible(!hasCookieConsent())
    setCurrentConsent(getCookieConsent())
  }, [])

  useEffect(() => {
    const openPreferences = () => setModalOpen(true)
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences)
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences)
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies()
    setVisible(false)
    setCurrentConsent(getCookieConsent())
  }

  const handleRejectAll = () => {
    rejectAllCookies()
    setVisible(false)
    setCurrentConsent(getCookieConsent())
  }

  const handleSavePreferences = (prefs: {
    analytics: boolean
    marketing: boolean
    functional: boolean
  }) => {
    saveCookieConsent(prefs)
    setVisible(false)
    setModalOpen(false)
    setCurrentConsent(getCookieConsent())
  }

  return (
    <>
      {visible && (
        <div
          role="region"
          aria-label="Çerez tercihleri bildirimi"
          className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none p-3 sm:p-4 md:p-5"
        >
          <div
            data-testid="cookie-consent-banner"
            className="pointer-events-auto mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/[0.08]"
          >
            <div className="px-5 py-5 md:px-6 md:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 sm:flex">
                    <Cookie className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold tracking-tight text-slate-950 md:text-lg">
                      Çerez tercihlerinizi yönetin
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700">
                      Deneyiminizi iyileştirmek, site performansını ölçmek ve pazarlama faaliyetlerini yönetmek
                      için çerezler kullanıyoruz. Analitik ve pazarlama çerezleri yalnızca onayınızla çalışır.
                    </p>
                    <Link
                      to="/cerez-politikasi"
                      className="mt-2 inline-flex items-center rounded text-sm font-semibold text-emerald-800 underline decoration-emerald-800/50 underline-offset-4 transition hover:text-emerald-900 hover:decoration-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    >
                      Çerez Politikası
                    </Link>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className={`${actionBase} order-3 text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-400 sm:order-1`}
                  >
                    Tercihleri Yönet
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className={`${actionBase} order-2 border-2 border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-400`}
                  >
                    Tümünü Reddet
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className={`${actionBase} order-1 bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 focus-visible:ring-emerald-600 sm:order-3`}
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CookiePreferencesModal
        open={modalOpen}
        initialConsent={currentConsent}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePreferences}
      />
    </>
  )
}
