import { Link } from 'react-router-dom'
import { Card, CardBody } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function AdminPageContentsRedirectPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="İçerikler taşındı" description="/admin/icerikler → /admin/sayfalar" />
      <Card className="border-brand-200 bg-brand-50/50">
        <CardBody className="space-y-3 text-sm text-slate-700">
          <p>Sayfa içerikleri artık <strong>Sayfalar</strong> modülünden yönetiliyor.</p>
          <Link to="/admin/sayfalar" className="inline-flex font-semibold text-brand-700 hover:underline">
            Sayfalar modülüne git →
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}
