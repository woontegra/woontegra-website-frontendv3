import { useEffect } from 'react'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/types/siteSettings'

type Options = {
  title?: string
  description?: string
  suffix?: string
  fallbackDescription?: string
}

export function usePageMeta({ title, description, suffix = 'Woontegra', fallbackDescription }: Options) {
  const effectiveDescription = description?.trim() || fallbackDescription?.trim()

  useEffect(() => {
    const prevTitle = document.title
    if (title) {
      document.title = title.includes(suffix) ? title : `${title} | ${suffix}`
    }
    let meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? ''
    if (effectiveDescription) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', effectiveDescription)
    }
    return () => {
      document.title = prevTitle
      if (meta && effectiveDescription) meta.setAttribute('content', prevDesc)
    }
  }, [title, effectiveDescription, suffix])
}

/** Site ayarlarından varsayılan açıklama ile public sayfa meta */
export function useSitePageMeta(options: Omit<Options, 'fallbackDescription' | 'suffix'>) {
  const { data: settings } = usePublicSiteSettings()
  const siteName = settings?.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName
  const fallbackDescription = `${siteName} — kurumsal yazılım, güvenli ödeme ve merkezi lisans yönetimi.`

  usePageMeta({
    ...options,
    suffix: siteName,
    fallbackDescription,
  })
}
