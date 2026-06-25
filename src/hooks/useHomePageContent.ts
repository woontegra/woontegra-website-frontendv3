import { useQuery } from '@tanstack/react-query'
import { pageContentService } from '@/services/api/pageContent'
import { defaultHomePageContent, normalizeHomePageContent, type HomePageContent } from '@/types/homePageContent'

export function useHomePageContent() {
  return useQuery<HomePageContent>({
    queryKey: ['page-content', 'home'],
    queryFn: async () => pageContentService.getHome(),
    placeholderData: defaultHomePageContent,
    staleTime: 60_000,
    select: (data) => normalizeHomePageContent(data),
  })
}
