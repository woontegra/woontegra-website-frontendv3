import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  defaultFooterGroupsBundle,
  getActiveFooterGroups,
  type FooterGroupConfig,
  type FooterGroupsBundle,
} from '@/data/footerGroupsContent'
import { footerGroupsService } from '@/services/api/footerGroups'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { publicQueryOptions } from '@/lib/publicQueryOptions'

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
  const { data: settings } = usePublicSiteSettings()
  const query = useQuery({
    queryKey: ['public', 'footer-groups'],
    queryFn: () => footerGroupsService.get(),
    placeholderData: defaultFooterGroupsBundle,
    ...publicQueryOptions,
  })

  const bundle = query.data ?? defaultFooterGroupsBundle

  const groups = useMemo(
    () =>
      resolveContactGroup(
        getActiveFooterGroups(bundle),
        settings?.contactEmail?.trim(),
        settings?.contactPhone?.trim(),
      ),
    [bundle, settings?.contactEmail, settings?.contactPhone],
  )

  return { groups, loaded: query.isFetched }
}

export type { FooterGroupConfig, FooterGroupsBundle }
