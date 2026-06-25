import { useEffect, useState } from 'react'
import { pageContentService } from '@/services/api/pageContent'
import { mergeLegalPageContent, type LegalPageContent, type LegalPageKey } from '@/types/legalPageContent'

export function useLegalPageContent(pageKey: string, defaults: LegalPageContent): LegalPageContent {
  const [content, setContent] = useState<LegalPageContent>(() => mergeLegalPageContent(defaults))

  useEffect(() => {
    void pageContentService.getLegalPage(pageKey as LegalPageKey, defaults).then((data) => {
      setContent(data)
    })
  }, [pageKey, defaults])

  return content
}
