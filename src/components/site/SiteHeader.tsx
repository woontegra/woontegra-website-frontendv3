import { ChevronDown, Menu, ShoppingCart, UserRound, X } from 'lucide-react'

import { useState } from 'react'

import { Link, NavLink, useLocation } from 'react-router-dom'

import { cn } from '@/utils/cn'

import { SiteLogo } from '@/components/site/SiteLogo'

import { useCart } from '@/hooks/useCart'

import { useCustomerSession } from '@/hooks/useCustomerSession'

import { useHeaderNavigation } from '@/hooks/useHeaderNavigation'

import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'

import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/types/siteSettings'
import { clampNavbarLogoWidth } from '@/lib/logoSize'

import type { HeaderNavItem } from '@/data/defaultHeaderNav'



function CartBadge({ count, compact }: { count: number; compact?: boolean }) {

  if (count <= 0) return null

  return (

    <span

      className={cn(

        'absolute flex items-center justify-center rounded-full bg-emerald-600 font-bold text-white',

        compact

          ? 'right-0 top-0 h-4 min-w-[1rem] px-1 text-[10px]'

          : '-right-0.5 -top-0.5 h-[18px] min-w-[18px] px-1 text-[10px]',

      )}

    >

      {count > 99 ? '99+' : count}

    </span>

  )

}



export function SiteHeader() {

  const location = useLocation()

  const [open, setOpen] = useState(false)

  const [megaOpen, setMegaOpen] = useState<string | null>(null)

  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({})

  const { nav } = useHeaderNavigation()

  const { count: cartCount } = useCart()

  const { authed: customerAuthed, profile: customerProfile } = useCustomerSession()

  const { data: settings = DEFAULT_PUBLIC_SITE_SETTINGS } = usePublicSiteSettings()

  const siteName = settings.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName

  const logoWidth = clampNavbarLogoWidth(
    settings.navbarLogoWidth ?? DEFAULT_PUBLIC_SITE_SETTINGS.navbarLogoWidth,
  )



  const hesapHref = customerAuthed ? '/hesabim' : '/musteri-giris'

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  const sepetActive = isActive('/sepet')

  const hesapActive = isActive('/hesabim') || isActive('/musteri-giris')



  const linkClass = (active: boolean, mobile = false, nested = false) =>

    cn(

      mobile

        ? nested

          ? 'block rounded-lg px-4 py-2.5 pl-8 text-sm font-medium'

          : 'block rounded-lg px-4 py-3 text-sm font-medium'

        : 'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[14px] font-medium transition-colors',

      active ? 'text-brand-600' : mobile ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-700 hover:text-slate-900',

    )



  const toggleMobile = (id: string) => {

    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  }



  const renderDropdownChild = (child: HeaderNavItem, mobile = false) => {

    if (child.groupHeader) {

      return (

        <span

          key={child.id}

          className={cn(

            'block px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400',

            mobile ? 'pl-8' : '',

          )}

        >

          {child.label}

        </span>

      )

    }

    return renderLeafItem(child, mobile, true)

  }



  const renderLeafItem = (item: HeaderNavItem, mobile = false, nested = false) => {

    const external = item.href.startsWith('http')



    if (external || item.openInNewTab) {

      return (

        <a

          key={item.id}

          href={item.href}

          target="_blank"

          rel="noopener noreferrer"

          className={linkClass(false, mobile, nested)}

          onClick={() => setOpen(false)}

        >

          {item.label}

        </a>

      )

    }



    return (

      <NavLink

        key={item.id}

        to={item.href}

        end={item.end}

        className={({ isActive }) => linkClass(isActive, mobile, nested)}

        onClick={() => setOpen(false)}

      >

        {item.label}

      </NavLink>

    )

  }



  const renderItem = (item: HeaderNavItem, mobile = false) => {

    const hasChildren = (item.children?.length ?? 0) > 0



    if (hasChildren && !mobile) {

      return (

        <div

          key={item.id}

          className="relative shrink-0"

          onMouseEnter={() => setMegaOpen(item.id)}

          onMouseLeave={() => setMegaOpen(null)}

        >

          <Link to={item.href} className={linkClass(false)} aria-expanded={megaOpen === item.id}>

            {item.label}

            <span className="ml-0.5 text-slate-400" aria-hidden>

              ▾

            </span>

          </Link>

          {megaOpen === item.id ? (

            <div className="absolute left-0 top-full z-[110] pt-0.5">

              <div className="min-w-[260px] rounded-xl border border-gray-200 bg-white py-2 shadow-lg">

                {item.children!.map((child) => renderDropdownChild(child, true))}

              </div>

            </div>

          ) : null}

        </div>

      )

    }



    if (hasChildren && mobile) {

      const expanded = mobileExpanded[item.id] ?? false

      return (

        <div key={item.id}>

          <button

            type="button"

            className={cn(linkClass(false, true), 'flex w-full items-center justify-between')}

            onClick={() => toggleMobile(item.id)}

            aria-expanded={expanded}

          >

            <span>{item.label}</span>

            <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', expanded && 'rotate-180')} />

          </button>

          {expanded ? (

            <div className="space-y-0.5 pb-1">

              <NavLink

                to={item.href}

                className={({ isActive }) => linkClass(isActive, true, true)}

                onClick={() => setOpen(false)}

              >

                Tümünü gör

              </NavLink>

              {item.children!.map((child) => renderDropdownChild(child, true))}

            </div>

          ) : null}

        </div>

      )

    }



    return renderLeafItem(item, mobile)

  }



  const desktopActions = (

    <>

      <Link

        to="/sepet"

        className={cn(

          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',

          sepetActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900',

        )}

        aria-label="Sepet"

      >

        <ShoppingCart className="h-5 w-5" aria-hidden />

        <CartBadge count={cartCount} />

      </Link>

      <div className="flex h-9 max-w-[9rem] items-center gap-1 border-l border-slate-200/80 pl-2">

        <Link

          to={hesapHref}

          className={cn(

            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',

            hesapActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900',

          )}

          aria-label="Hesabım"

          title={customerProfile?.name ? customerProfile.name : 'Hesabım'}

        >

          <UserRound className="h-5 w-5" aria-hidden />

        </Link>

        {customerProfile?.name ? (

          <span

            className="max-w-[6.5rem] truncate text-xs font-medium leading-tight text-slate-600"

            title={customerProfile.name}

          >

            {customerProfile.name}

          </span>

        ) : null}

      </div>

    </>

  )



  const mobileActions = (

    <>

      <Link

        to="/sepet"

        className={cn('relative rounded-lg p-2', sepetActive ? 'text-brand-600' : 'text-slate-600')}

        aria-label="Sepet"

      >

        <ShoppingCart className="h-6 w-6" aria-hidden />

        <CartBadge count={cartCount} compact />

      </Link>

      <Link

        to={hesapHref}

        className={cn('rounded-lg p-2', hesapActive ? 'text-brand-600' : 'text-slate-600')}

        aria-label="Hesabım"

      >

        <UserRound className="h-6 w-6" aria-hidden />

      </Link>

    </>

  )



  return (

    <header className="sticky top-0 z-[100] w-full border-b border-gray-100 bg-white">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex min-h-16 flex-nowrap items-center gap-2 py-2 min-[1200px]:grid min-[1200px]:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] min-[1200px]:items-center min-[1200px]:gap-x-4 min-[1200px]:py-2.5">

          <Link

            to="/"

            className="relative z-20 flex shrink-0 items-center self-center min-[1200px]:justify-start"

            aria-label={`${siteName} Ana Sayfa`}

            onClick={() => setOpen(false)}

          >

            <SiteLogo

              siteName={siteName}

              logoPath={settings.logo}

              logoUpdatedAt={settings.logoUpdatedAt}

              widthPx={logoWidth}

            />

          </Link>



          <nav

            aria-label="Ana menü"

            className="hidden min-h-9 min-w-0 items-center justify-center gap-1 min-[1200px]:col-start-2 min-[1200px]:flex"

          >

            {nav.map((item) => renderItem(item))}

          </nav>



          <div className="hidden min-h-9 shrink-0 items-center justify-end gap-2 min-[1200px]:col-start-3 min-[1200px]:flex">

            {desktopActions}

          </div>



          <div className="ml-auto flex shrink-0 items-center gap-0.5 min-[1200px]:hidden">{mobileActions}</div>



          <button

            type="button"

            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 min-[1200px]:hidden"

            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}

            onClick={() => setOpen((v) => !v)}

          >

            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

          </button>

        </div>

      </div>



      {open ? (

        <div className="border-t border-slate-200 bg-white min-[1200px]:hidden">

          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">

            <div className="flex gap-2 pb-2">

              <Link

                to="/sepet"

                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-800"

                onClick={() => setOpen(false)}

              >

                <ShoppingCart className="h-4 w-4" aria-hidden />

                Sepet

                {cartCount > 0 ? ` (${cartCount})` : ''}

              </Link>

              <Link

                to={hesapHref}

                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-800"

                onClick={() => setOpen(false)}

              >

                <UserRound className="h-4 w-4" aria-hidden />

                {customerAuthed ? 'Hesabım' : 'Giriş'}

              </Link>

            </div>

            {nav.map((item) => renderItem(item, true))}

          </nav>

        </div>

      ) : null}

    </header>

  )

}


