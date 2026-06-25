import { PageHeader } from '@/components/ui/PageHeader'
import { AdminMissingEndpointCard } from '@/components/admin/AdminMissingEndpointCard'

export function AdminActivityLogPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="İşlem geçmişi" description="Admin audit / activity log." />
      <AdminMissingEndpointCard
        title="İşlem geçmişi için backend endpointi bulunamadı"
        endpointHint="Aranan: /api/admin/audit-logs veya /api/admin/activity — yok"
        description="Backend'de kalıcı audit log API'si tanımlı değil. Havale onayı gibi bazı işlemler sunucu konsoluna [audit] satırı yazar; admin listesi endpointi yoktur. Sahte log üretilmez."
      />
    </div>
  )
}
