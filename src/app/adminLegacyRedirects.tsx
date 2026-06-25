import { Navigate, useParams } from 'react-router-dom'

export function LegacyAdminProductRedirect() {
  const { id } = useParams()
  if (!id) return <Navigate to="/admin/urunler" replace />
  return <Navigate to={`/admin/urunler/${id}/duzenle`} replace />
}
