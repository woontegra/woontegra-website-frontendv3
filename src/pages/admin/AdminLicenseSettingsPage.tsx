import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { CentralLicenseInfoBanner } from '@/components/admin/CentralLicenseInfoBanner'
import {
  LICENSE_SERVER_API,
  WEBSITE_BACKEND_LICENSE_INTEGRATION,
} from '@/constants/centralLicenseServer'

export function AdminLicenseSettingsPage() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Lisans ayarları"
        description="Website ile merkezi Woontegra Lisans Server entegrasyon mantığı."
      />

      <CentralLicenseInfoBanner />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Website rolü</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Sipariş ve ödeme website backend üzerinden yönetilir.</li>
            <li>
              <strong>licenseRequired</strong> ürünlerde lisans üretimi website içinde yapılmaz; backend ödeme
              sonrası merkezi sunucuya bildirir.
            </li>
            <li>Admin panelde görünen lisans listesi website veritabanı kayıtlarıdır (eski/indirme modeli).</li>
            <li>Merkezi lisans takibi için Woontegra Lisans Server admin paneli kullanılır.</li>
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Merkezi lisans server API</h2>
          <dl className="space-y-2 text-sm">
            {Object.entries(LICENSE_SERVER_API).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="w-44 shrink-0 font-medium text-slate-500">{key}</dt>
                <dd className="font-mono text-xs text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-500">
            Program kodu (<code className="rounded bg-slate-100 px-1">appCode</code>) ürün formunda{' '}
            <code className="rounded bg-slate-100 px-1">licenseAppCode</code> ile eşleşir (ör. MUVEKKIL_KASA_DESKTOP).
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Website backend bağlantısı</h2>
          <dl className="space-y-2 text-sm text-slate-700">
            <div>
              <dt className="font-medium text-slate-500">Ortam değişkenleri</dt>
              <dd className="mt-1 font-mono text-xs">
                {WEBSITE_BACKEND_LICENSE_INTEGRATION.envUrl},{' '}
                {WEBSITE_BACKEND_LICENSE_INTEGRATION.envSecret}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Entegrasyon çağrısı</dt>
              <dd className="mt-1 font-mono text-xs">{WEBSITE_BACKEND_LICENSE_INTEGRATION.clientEndpoint}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Akış</dt>
              <dd className="mt-1">{WEBSITE_BACKEND_LICENSE_INTEGRATION.note}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardBody>
          <p className="text-sm font-medium text-amber-950">Bağlantı testi</p>
          <p className="mt-2 text-sm text-amber-900">
            Merkezi lisans server bağlantı testi için website backend&apos;de admin API endpoint bulunamadı.
            Yapılandırma sunucu ortam değişkenleri ve backend logları üzerinden doğrulanır.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
