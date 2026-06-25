import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { PUBLIC_GC_MS, PUBLIC_STALE_MS } from '@/lib/publicQueryOptions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: PUBLIC_STALE_MS,
      gcTime: PUBLIC_GC_MS,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
