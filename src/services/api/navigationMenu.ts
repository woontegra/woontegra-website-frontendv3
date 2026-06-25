import type { ApiSuccess } from '@/types/api'
import type {
  AdminNavigationMenuInput,
  AdminNavigationMenuItem,
  PublicNavigationMenuItem,
} from '@/types/navigationMenu'
import { remapLegacyServiceUrl } from '@/lib/serviceSlugs'
import { adminApi, publicApi } from '@/services/api/client'

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

export function mapPublicNavUrl(url: string): string {
  if (!url || url === '#') return url
  if (url.startsWith('/urun/')) return url.replace(/^\/urun\//, '/yazilimlar/')
  return remapLegacyServiceUrl(url)
}

function mapPublicItem(item: PublicNavigationMenuItem): PublicNavigationMenuItem {
  const href = mapPublicNavUrl(item.resolvedUrl || item.href)
  return {
    ...item,
    href,
    resolvedUrl: href,
    children: (item.children ?? []).map(mapPublicItem),
  }
}

export const navigationMenuService = {
  async listPublic(): Promise<PublicNavigationMenuItem[]> {
    const res = await publicApi.get<ApiSuccess<PublicNavigationMenuItem[]>>('/navigation-menu')
    const data = unwrap<PublicNavigationMenuItem[]>(res.data)
    return Array.isArray(data) ? data.map(mapPublicItem) : []
  },

  async listAdmin(): Promise<AdminNavigationMenuItem[]> {
    const res = await adminApi.get<ApiSuccess<AdminNavigationMenuItem[]>>('/admin/navigation-menu')
    const data = unwrap<AdminNavigationMenuItem[]>(res.data)
    return Array.isArray(data) ? data : []
  },

  async getById(id: string): Promise<AdminNavigationMenuItem> {
    const res = await adminApi.get<ApiSuccess<AdminNavigationMenuItem>>(`/admin/navigation-menu/${encodeURIComponent(id)}`)
    return unwrap(res.data)
  },

  async create(payload: AdminNavigationMenuInput): Promise<AdminNavigationMenuItem> {
    const res = await adminApi.post<ApiSuccess<AdminNavigationMenuItem>>('/admin/navigation-menu', payload)
    return unwrap(res.data)
  },

  async update(id: string, payload: Partial<AdminNavigationMenuInput>): Promise<AdminNavigationMenuItem> {
    const res = await adminApi.patch<ApiSuccess<AdminNavigationMenuItem>>(
      `/admin/navigation-menu/${encodeURIComponent(id)}`,
      payload,
    )
    return unwrap(res.data)
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/admin/navigation-menu/${encodeURIComponent(id)}`)
  },
}
