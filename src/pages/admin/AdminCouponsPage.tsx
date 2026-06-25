import { PageHeader } from '@/components/ui/PageHeader'
import { AdminMissingEndpointCard } from '@/components/admin/AdminMissingEndpointCard'

export function AdminCouponsPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Kuponlar" description="İndirim kuponu yönetimi." />
      <AdminMissingEndpointCard
        title="Kupon yönetimi için backend endpointi bulunamadı"
        endpointHint="Aranan: /api/admin/coupons — backend route dosyalarında yok"
        description="Prisma şemasında Coupon modeli tanımlı değil. Checkout'ta kupon alanı backend sipariş API'sinde desteklenmiyor; kupon modülü bağlanamaz."
      />
    </div>
  )
}
