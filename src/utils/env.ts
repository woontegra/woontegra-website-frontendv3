const API_URL = import.meta.env.VITE_API_URL?.trim() || '/api'

export function getApiBaseUrl(): string {
  const normalized = API_URL.replace(/\/+$/, '')
  if (normalized.endsWith('/api')) return normalized
  return `${normalized}/api`
}

export function getApiRootUrl(): string {
  const base = getApiBaseUrl()
  return base.endsWith('/api') ? base.slice(0, -4) : base
}
