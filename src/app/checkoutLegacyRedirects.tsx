import { Navigate, useParams } from 'react-router-dom'

export function LegacyCheckoutSlugRedirect() {
  const { slug = '' } = useParams()
  if (!slug.trim()) return <Navigate to="/yazilimlar" replace />
  return <Navigate to={`/satinal/${encodeURIComponent(slug.trim())}`} replace />
}

export function LegacyOrderSuccessRedirect() {
  const { orderNo } = useParams()
  if (orderNo?.trim()) {
    return <Navigate to={`/odeme/basarili/${encodeURIComponent(orderNo.trim())}`} replace />
  }
  return <Navigate to="/odeme/basarili" replace />
}

export function LegacyOrderFailRedirect() {
  const { orderNo } = useParams()
  if (orderNo?.trim()) {
    return <Navigate to={`/odeme/basarisiz/${encodeURIComponent(orderNo.trim())}`} replace />
  }
  return <Navigate to="/odeme/basarisiz" replace />
}
