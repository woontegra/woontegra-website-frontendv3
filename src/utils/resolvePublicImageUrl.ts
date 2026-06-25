import { resolveMediaUrl } from '@/lib/resolveMediaUrl'

/** @deprecated resolveMediaUrl kullanın */
export function resolvePublicImageUrl(url?: string | null): string {
  return resolveMediaUrl(url)
}
