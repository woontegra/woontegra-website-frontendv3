import { useEffect, useState } from 'react'
import {
  defaultFooterGroupsBundle,
  getActiveFooterGroups,
  type FooterGroupConfig,
  type FooterGroupsBundle,
} from '@/data/footerGroupsContent'
import { footerGroupsService } from '@/services/api/footerGroups'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'

function resolveContactGroup(groups: FooterGroupConfig[], email?: string, phone?: string): FooterGroupConfig[] {
  return groups.map((group) => {
    if (group.id !== 'iletisim') return group
    return {
      ...group,
      links: group.links.map((link) => {
        if (link.href?.startsWith('mailto:') && email) {
          return { ...link, href: `mailto:${email}`, label: email }
        }
        if (link.href?.startsWith('tel:') && phone) {
          return { ...link, href: `tel:${phone.replace(/\s/g, '')}`, label: phone }
        }
        return link
      }),
    }
  })
}

export function useFooterGroups() {
  const [bundle, setBundle] = useState<FooterGroupsBundle>(defaultFooterGroupsBundle)
  const [loaded, setLoaded] = useState(false)
  const { data: settings } = usePublicSiteSettings()

  useEffect(() => {
    let cancelled = false
    void footerGroupsService
      .get()
      .then((data) => {
        if (!cancelled) {
          setBundle(data)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const groups = resolveContactGroup(
    getActiveFooterGroups(bundle),
    settings?.contactEmail?.trim(),
    settings?.contactPhone?.trim(),
  )

  return { groups, loaded }
}

export type { FooterGroupConfig }
