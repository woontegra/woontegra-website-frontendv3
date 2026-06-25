export type AdminUserProfile = {
  id: string
  email: string
  role: string
}

export type AdminUserListItem = {
  id: string
  email: string
  role: string
  fullName?: string | null
}

function normalizeProfile(raw: unknown): AdminUserProfile | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? '')
  if (!id) return null
  return {
    id,
    email: String(o.email ?? ''),
    role: String(o.role ?? ''),
  }
}

function normalizeUserRow(raw: unknown): AdminUserListItem | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? '')
  if (!id) return null
  return {
    id,
    email: String(o.email ?? ''),
    role: String(o.role ?? ''),
    fullName: o.fullName == null ? null : String(o.fullName),
  }
}

export function normalizeAdminUserProfile(raw: unknown): AdminUserProfile | null {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return normalizeProfile((raw as { data: unknown }).data)
  }
  return normalizeProfile(raw)
}

export function normalizeAdminUserList(raw: unknown): AdminUserListItem[] {
  let rows: unknown = raw
  if (raw && typeof raw === 'object' && 'data' in raw) {
    rows = (raw as { data: unknown }).data
  }
  if (!Array.isArray(rows)) return []
  return rows.map(normalizeUserRow).filter((x): x is AdminUserListItem => x !== null)
}
