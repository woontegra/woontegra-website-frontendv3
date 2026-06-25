/** Public site shared React Query defaults — avoid refetch flicker on navigation. */
export const PUBLIC_STALE_MS = 5 * 60_000
export const PUBLIC_GC_MS = 30 * 60_000

export const publicQueryOptions = {
  staleTime: PUBLIC_STALE_MS,
  gcTime: PUBLIC_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const
