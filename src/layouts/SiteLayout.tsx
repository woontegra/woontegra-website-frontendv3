import { Outlet } from 'react-router-dom'
import { CookieConsentBanner } from '@/components/cookie/CookieConsentBanner'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFaviconEffect } from '@/hooks/usePublicSiteSettings'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteFaviconEffect />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <CookieConsentBanner />
    </div>
  )
}
