import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { getEffectiveHeaderNavigation, type HeaderNavSource } from '@/lib/navigationMenuState'
import { navigationMenuService } from '@/services/api/navigationMenu'
import type { HeaderNavItem } from '@/data/defaultHeaderNav'

export function useHeaderNavigation() {
  const query = useQuery({
    queryKey: ['public', 'navigation-menu'],
    queryFn: () => navigationMenuService.listPublic(),
    ...publicQueryOptions,
    retry: 1,
  })

  const resolved = useMemo(
    () => getEffectiveHeaderNavigation(query.data, { isError: query.isError }),
    [query.data, query.isError],
  )

  return {
    nav: resolved.nav,
    source: resolved.source as HeaderNavSource,
    loaded: query.isFetched,
    publicItems: query.data ?? [],
  }
}

export type { HeaderNavItem, HeaderNavSource }
