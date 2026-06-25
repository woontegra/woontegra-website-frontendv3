import { Navigate, useParams } from 'react-router-dom'

export function CategoryPage() {
  const { slug = '' } = useParams()
  return <Navigate to={`/yazilimlar?kategori=${encodeURIComponent(slug)}`} replace />
}
