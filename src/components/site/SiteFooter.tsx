import { Link } from 'react-router-dom'

import { useFooterGroups } from '@/hooks/useFooterGroups'

import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'

import { openCookiePreferences } from '@/lib/cookieConsent'

import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/types/siteSettings'



export function SiteFooter() {

  const { groups } = useFooterGroups()

  const { data: settings } = usePublicSiteSettings()

  const siteName = settings?.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName

  const contactEmail = settings?.contactEmail?.trim()

  const contactPhone = settings?.contactPhone?.trim()

  const contactAddress = settings?.contactAddress?.trim()



  const linkGroups = groups.filter((g) => g.id !== 'iletisim')



  return (

    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div className="sm:col-span-2 lg:col-span-1">

            <p className="text-lg font-semibold text-white">{siteName}</p>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">

              Kurumsal yazılım, güvenli ödeme ve merkezi lisans yönetimi.

            </p>

          </div>



          {linkGroups.map((group) => (

            <div key={group.id}>

              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>

              <ul className="mt-4 space-y-2 text-sm">

                {group.links.map((link) => (

                  <li key={link.id}>

                    {link.action === 'cookie-preferences' ? (

                      <button type="button" onClick={openCookiePreferences} className="text-left hover:text-white">

                        {link.label}

                      </button>

                    ) : link.href?.startsWith('http') || link.href?.startsWith('mailto:') || link.href?.startsWith('tel:') ? (

                      <a

                        href={link.href}

                        className="hover:text-white"

                        target={link.openInNewTab || link.href.startsWith('http') ? '_blank' : undefined}

                        rel={link.openInNewTab || link.href.startsWith('http') ? 'noopener noreferrer' : undefined}

                      >

                        {link.label}

                      </a>

                    ) : (

                      <Link to={link.href ?? '/'} className="hover:text-white">

                        {link.label}

                      </Link>

                    )}

                  </li>

                ))}

              </ul>

            </div>

          ))}



          <div>

            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">İletişim</p>

            <ul className="mt-4 space-y-2 text-sm">

              {contactPhone ? (

                <li>

                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-white">

                    {contactPhone}

                  </a>

                </li>

              ) : null}

              {contactEmail ? (

                <li>

                  <a href={`mailto:${contactEmail}`} className="hover:text-white">

                    {contactEmail}

                  </a>

                </li>

              ) : null}

              {contactAddress ? <li className="text-slate-400">{contactAddress}</li> : null}

            </ul>

          </div>

        </div>



        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>

            © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.

          </p>

          <p>Lisanslar merkezi Woontegra Lisans Server üzerinden yönetilir.</p>

        </div>

      </div>

    </footer>

  )

}


