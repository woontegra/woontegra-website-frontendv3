import {
  defaultFooterGroupsBundle,
  FOOTER_GROUPS_KEY,
  mergeFooterGroups,
  type FooterGroupsBundle,
} from '@/data/footerGroupsContent'
import { pageContentService } from '@/services/api/pageContent'

export const footerGroupsService = {
  async get(): Promise<FooterGroupsBundle> {
    const raw = await pageContentService.getRawByKey(FOOTER_GROUPS_KEY)
    return mergeFooterGroups(defaultFooterGroupsBundle, raw as Partial<FooterGroupsBundle> | null)
  },

  async save(bundle: FooterGroupsBundle): Promise<FooterGroupsBundle> {
    const payload = mergeFooterGroups(defaultFooterGroupsBundle, bundle)
    await pageContentService.updateByKey(FOOTER_GROUPS_KEY, payload as unknown as Record<string, unknown>)
    return payload
  },
}
