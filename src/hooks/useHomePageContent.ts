import { useQuery } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/api/pageContent'
import { defaultHomePageContent, normalizeHomePageContent, type HomePageContent } from '@/types/homePageContent'

export function useHomePageContent() {
  return useQuery<HomePageContent>({
    queryKey: ['page-content', 'home'],
    queryFn: async () => pageContentService.getHome(),
    placeholderData: defaultHomePageContent,
    ...publicQueryOptions,
    select: (data) => normalizeHomePageContent(data),
  })
}
