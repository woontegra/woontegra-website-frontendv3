import { useEffect, useState } from 'react'
import { defaultLegalCompanyInfo, mergeLegalCompanyInfo, type LegalCompanyInfo } from '@/data/legalCompanyInfo'
import { pageContentService } from '@/services/api/pageContent'

export function useLegalCompanyInfo(): LegalCompanyInfo {
  const [info, setInfo] = useState<LegalCompanyInfo>(defaultLegalCompanyInfo)

  useEffect(() => {
    void pageContentService.getRawByKey('legalCompanyInfo').then((data) => {
      setInfo(mergeLegalCompanyInfo(data as Partial<LegalCompanyInfo> | null))
    })
  }, [])

  return info
}
