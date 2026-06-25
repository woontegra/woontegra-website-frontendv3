import { Navigate, useParams } from 'react-router-dom'

export function LegacyProductRedirect() {
  const { slug } = useParams()
  return <Navigate to={slug ? `/yazilimlar/${slug}` : '/yazilimlar'} replace />
}
