import { PageHeader } from '@/components/ui/PageHeader'
import { AdminMissingEndpointCard } from '@/components/admin/AdminMissingEndpointCard'

export function AdminCampaignsPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Kampanyalar" description="İndirim kampanyası yönetimi." />
      <AdminMissingEndpointCard
        title="Kampanya yönetimi için backend endpointi bulunamadı"
        endpointHint="Aranan: /api/admin/campaigns — backend route dosyalarında yok"
        description="Prisma şemasında Campaign modeli tanımlı değil. Kampanya CRUD bu sürümde frontend'den bağlanamaz; backend geliştirmesi gerekir."
      />
    </div>
  )
}
