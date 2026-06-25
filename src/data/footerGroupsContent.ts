export const FOOTER_GROUPS_KEY = 'footerGroups'

export type FooterLinkConfig = {
  id: string
  label: string
  href?: string
  action?: 'cookie-preferences'
  order: number
  enabled: boolean
  openInNewTab?: boolean
}

export type FooterGroupConfig = {
  id: string
  title: string
  order: number
  enabled: boolean
  links: FooterLinkConfig[]
}

export type FooterGroupsBundle = {
  groups: FooterGroupConfig[]
}

function normalizeLink(link: FooterLinkConfig, index: number): FooterLinkConfig {
  return {
    id: link.id || `link-${index}`,
    label: link.label?.trim() || 'Başlıksız',
    href: link.action ? undefined : link.href?.trim() || '/',
    action: link.action === 'cookie-preferences' ? 'cookie-preferences' : undefined,
    order: typeof link.order === 'number' ? link.order : index,
    enabled: link.enabled !== false,
    openInNewTab: link.openInNewTab === true,
  }
}

function mergeGroupLinks(
  defaultLinks: FooterLinkConfig[],
  partialLinks: FooterLinkConfig[],
): FooterLinkConfig[] {
  const byId = new Map<string, FooterLinkConfig>()
  for (const link of defaultLinks) {
    byId.set(link.id, { ...link })
  }
  for (const link of partialLinks) {
    const existing = byId.get(link.id)
    byId.set(link.id, {
      ...(existing ?? link),
      ...link,
      action: link.action ?? existing?.action,
    })
  }

  const ordered: FooterLinkConfig[] = []
  const seen = new Set<string>()

  for (const link of partialLinks) {
    const merged = byId.get(link.id)
    if (merged && !seen.has(link.id)) {
      ordered.push(merged)
      seen.add(link.id)
    }
  }

  for (const link of defaultLinks) {
    if (!seen.has(link.id)) {
      ordered.push(byId.get(link.id) ?? link)
      seen.add(link.id)
    }
  }

  for (const link of partialLinks) {
    if (!seen.has(link.id)) {
      ordered.push(link)
      seen.add(link.id)
    }
  }

  return ordered.map((link, index) => normalizeLink(link, index))
}

function normalizeGroup(group: FooterGroupConfig, index: number): FooterGroupConfig {
  return {
    id: group.id || `group-${index}`,
    title: group.title?.trim() || 'Grup',
    order: typeof group.order === 'number' ? group.order : index,
    enabled: group.enabled !== false,
    links: (group.links ?? []).map((link, li) => normalizeLink(link, li)),
  }
}

export function mergeFooterGroups(
  defaults: FooterGroupsBundle,
  partial?: Partial<FooterGroupsBundle> | null,
): FooterGroupsBundle {
  if (!partial?.groups?.length) {
    return { groups: defaults.groups.map((g, i) => normalizeGroup(g, i)) }
  }

  const defaultById = new Map(defaults.groups.map((group) => [group.id, group]))
  const merged: FooterGroupConfig[] = []
  const seen = new Set<string>()

  for (const partialGroup of partial.groups) {
    const defaultGroup = defaultById.get(partialGroup.id)
    const group = defaultGroup
      ? {
          ...defaultGroup,
          ...partialGroup,
          links: mergeGroupLinks(defaultGroup.links, partialGroup.links ?? []),
        }
      : partialGroup
    merged.push(normalizeGroup(group, merged.length))
    seen.add(partialGroup.id)
  }

  for (const defaultGroup of defaults.groups) {
    if (!seen.has(defaultGroup.id)) {
      merged.push(normalizeGroup(defaultGroup, merged.length))
    }
  }

  return { groups: merged.map((group, index) => ({ ...group, order: index })) }
}

export const defaultFooterGroupsBundle: FooterGroupsBundle = {
  groups: [
    {
      id: 'kurumsal',
      title: 'Kurumsal',
      order: 0,
      enabled: true,
      links: [
        { id: 'f-yazilimlar', label: 'Yazılımlar', href: '/yazilimlar', order: 0, enabled: true },
        { id: 'f-blog', label: 'Blog', href: '/blog', order: 1, enabled: true },
        { id: 'f-about', label: 'Hakkımızda', href: '/hakkimizda', order: 2, enabled: true },
        { id: 'f-contact', label: 'İletişim', href: '/iletisim', order: 3, enabled: true },
      ],
    },
    {
      id: 'yasal',
      title: 'Yasal',
      order: 1,
      enabled: true,
      links: [
        { id: 'f-kvkk', label: 'KVKK Aydınlatma Metni', href: '/kvkk-aydinlatma-metni', order: 0, enabled: true },
        { id: 'f-privacy', label: 'Gizlilik Politikası', href: '/gizlilik-politikasi', order: 1, enabled: true },
        { id: 'f-cookie', label: 'Çerez Politikası', href: '/cerez-politikasi', order: 2, enabled: true },
        { id: 'f-consent', label: 'Açık Rıza Metni', href: '/acik-riza-metni', order: 3, enabled: true },
        { id: 'f-terms', label: 'Kullanım Şartları', href: '/kullanim-sartlari', order: 4, enabled: true },
        { id: 'f-prefs', label: 'Çerez Tercihleri', action: 'cookie-preferences', order: 5, enabled: true },
      ],
    },
    {
      id: 'iletisim',
      title: 'İletişim',
      order: 2,
      enabled: true,
      links: [
        { id: 'f-mail', label: 'info@woontegra.com', href: 'mailto:info@woontegra.com', order: 0, enabled: true },
      ],
    },
  ],
}

export function getActiveFooterGroups(bundle: FooterGroupsBundle): FooterGroupConfig[] {
  return bundle.groups
    .filter((group) => group.enabled)
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => link.enabled).sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.links.length > 0)
}
