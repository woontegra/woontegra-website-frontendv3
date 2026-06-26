import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import type { AdminProductInput } from '@/types/product'
import {
  deliveryTypeLabel,
  licenseStatusLabel,
  saleStatusLabel,
  type AdminProductPresetId,
} from '@/constants/adminProductPresets'
import {
  hasConfiguredDownloadFiles,
  hasPortableDownloadFile,
  hasSetupDownloadFile,
} from '@/lib/productDownloadFiles'
import { formatMoney } from '@/utils/formatMoney'
import { isReadyForSale, hasDigitalDelivery } from '@/lib/adminProductForm'
import { adminLicenseProgramsService } from '@/services/api/adminLicensePrograms'
import { licenseProgramReadinessLabel } from '@/components/admin/LicenseProgramPicker'

type Props = {
  form: AdminProductInput
  presetId: AdminProductPresetId
  coverPreview: string | null
}

export function ProductFormSummary({ form, presetId, coverPreview }: Props) {
  const ready = isReadyForSale(form, presetId)
  const hasPrice = Number.isFinite(form.price) && form.price > 0
  const hasDelivery = hasDigitalDelivery(form)

  const programsQuery = useQuery({
    queryKey: ['admin', 'license-programs'],
    queryFn: () => adminLicenseProgramsService.list(false),
    enabled: form.licenseRequired,
    staleTime: 60_000,
  })

  const selectedProgram =
    programsQuery.data?.find((p) => p.appCode === form.licenseAppCode?.trim()) ?? null
  const licenseReady = licenseProgramReadinessLabel(
    form.licenseRequired,
    form.licenseAppCode,
    selectedProgram,
  )
  const saleReady =
    ready &&
    (!form.licenseRequired || licenseReady.tone === 'success') &&
    (!form.licenseRequired || hasDelivery)

  return (
    <Card className="sticky top-20 border-slate-200 shadow-sm">
      <CardBody className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Özet</p>

        {coverPreview ? (
          <img
            src={coverPreview}
            alt=""
            className="h-28 w-full rounded-lg border border-slate-200 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/product-placeholder.svg'
            }}
          />
        ) : (
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
            Kapak görseli yok
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs text-slate-500">Ürün adı</p>
            <p className="font-medium text-slate-900">{form.name.trim() || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Fiyat</p>
            <p className="font-medium text-slate-900">
              {hasPrice ? formatMoney(form.price, form.currency) : 'Fiyat yok / teklif'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Satış durumu</p>
            <p className="font-medium text-slate-900">{saleStatusLabel(form)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Teslimat tipi</p>
            <p className="font-medium text-slate-900">{deliveryTypeLabel(presetId, form)}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {hasConfiguredDownloadFiles(form.downloadFiles ?? undefined) ? (
                <Badge tone="brand">R2 indirme: Var</Badge>
              ) : (
                <Badge tone="default">R2 indirme: Yok</Badge>
              )}
              {hasSetupDownloadFile(form.downloadFiles ?? undefined) ? (
                <Badge tone="success">Setup dosyası: Var</Badge>
              ) : (
                <Badge tone="default">Setup dosyası: Yok</Badge>
              )}
              {hasPortableDownloadFile(form.downloadFiles ?? undefined) ? (
                <Badge tone="success">Portable dosya: Var</Badge>
              ) : (
                <Badge tone="default">Portable dosya: Yok</Badge>
              )}
              {presetId === 'FREE_TOOL' ? <Badge tone="success">Ücretsiz</Badge> : null}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Lisans durumu</p>
            <p className="font-medium text-slate-900">{licenseStatusLabel(form)}</p>
            {form.licenseRequired ? (
              <div className="mt-1">
                <Badge tone={licenseReady.tone}>{licenseReady.label}</Badge>
              </div>
            ) : null}
          </div>
          <div>
            <p className="text-xs text-slate-500">Yayında mı?</p>
            <Badge tone={form.isActive ? 'success' : 'default'}>{form.isActive ? 'Evet' : 'Hayır'}</Badge>
          </div>
        </div>

        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            saleReady
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-950'
          }`}
        >
          {saleReady
            ? 'Satışa hazır görünüyor. Kaydettikten sonra public sayfada kontrol edin.'
            : form.licenseRequired && licenseReady.tone !== 'success'
              ? 'Satışa açmak için lisans sunucusunda aktif bir program seçin.'
              : 'Satışa açmak için fiyat, teslimat veya lisans alanlarını tamamlayın.'}
        </div>
      </CardBody>
    </Card>
  )
}
