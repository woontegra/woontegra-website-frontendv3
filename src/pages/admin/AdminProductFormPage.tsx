import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ImageIcon, Images, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { CentralLicenseInfoBanner } from '@/components/admin/CentralLicenseInfoBanner'
import { ProductFormSummary } from '@/components/admin/product-form/ProductFormSummary'
import { ProductR2DownloadFilesSection } from '@/components/admin/product-form/ProductR2DownloadFilesSection'
import {
  ADMIN_PRODUCT_PRESETS,
  applyProductPreset,
  inferPresetFromForm,
  presetShowsDownloadFields,
  presetShowsLicenseFields,
  presetShowsR2DownloadFields,
  presetShowsSaasFields,
  type AdminProductPresetId,
} from '@/constants/adminProductPresets'
import { DESKTOP_LICENSE_PROGRAMS } from '@/constants/desktopLicensePrograms'
import { adminProductsService, getErrorMessage } from '@/services/api/adminProducts'
import { productCategoriesService } from '@/services/api/productCategories'
import type { AdminProductInput } from '@/types/product'
import type { CatalogMedia } from '@/types/catalogMedia'
import { ImageUploadSizeNote } from '@/components/admin/ImageUploadSizeNote'
import { MediaPickerModal } from '@/components/admin/MediaPickerModal'
import { imageUploadSizeHint } from '@/constants/imageUploadSpecs'
import { slugifySoftwareName } from '@/types/product'
import {
  PRODUCT_FORM_TABS,
  tabForValidationError,
  validateAdminProductForm,
  type ProductFormTabId,
} from '@/lib/adminProductForm'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { cn } from '@/utils/cn'
import { SafeImage } from '@/components/ui/SafeImage'
import {
  buildAdminDownloadFilesFormState,
  emptyDownloadFilesConfig,
  resolveDownloadFilesSavePayload,
} from '@/lib/productDownloadFiles'

const emptyForm: AdminProductInput = {
  name: '',
  slug: '',
  productType: 'DOWNLOAD',
  shortDescription: '',
  description: '',
  price: 0,
  compareAtPrice: null,
  currency: 'TRY',
  isActive: true,
  purchaseEnabled: true,
  licenseMonths: 12,
  licenseRequired: false,
  licenseAppCode: null,
  licenseDays: 365,
  licenseMaxDevices: 1,
  featureBullets: '',
  isFeatured: false,
  sortOrder: 0,
  version: '',
  categoryId: null,
  seoTitle: '',
  seoDescription: '',
  coverImageMediaId: null,
  downloadMediaId: null,
  coverImage: '',
  downloadUrl: '',
  downloadFiles: emptyDownloadFilesConfig(),
}

type GalleryRow = { key: string; mediaId: string; preview: string }

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  )
}

function HelpBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-sm text-sky-950">{children}</p>
  )
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [form, setForm] = useState<AdminProductInput>(emptyForm)
  const [presetId, setPresetId] = useState<AdminProductPresetId>('DOWNLOADABLE')
  const [tab, setTab] = useState<ProductFormTabId>('basic')
  const [slugManual, setSlugManual] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [useCoverUrl, setUseCoverUrl] = useState(false)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [galleryRows, setGalleryRows] = useState<GalleryRow[]>([])
  const [downloadInfo, setDownloadInfo] = useState<{ name: string; size: number } | null>(null)
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)
  const [downloadPickerOpen, setDownloadPickerOpen] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: () => productCategoriesService.list(),
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => adminProductsService.getById(id!),
    enabled: !isNew && Boolean(id),
  })

  useEffect(() => {
    if (!data) return
    const loaded: AdminProductInput = {
      name: data.name,
      slug: data.slug,
      productType: data.productType,
      shortDescription: data.shortDescription,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      currency: data.currency || 'TRY',
      isActive: data.isActive,
      purchaseEnabled: data.purchaseEnabled,
      licenseMonths: data.licenseMonths,
      licenseRequired: data.licenseRequired,
      licenseAppCode: data.licenseAppCode,
      licenseDays: data.licenseDays ?? 365,
      licenseMaxDevices: data.licenseMaxDevices ?? 1,
      featureBullets: data.featureBullets ?? '',
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      version: data.version ?? '',
      categoryId: data.categoryId,
      seoTitle: data.seoTitle ?? '',
      seoDescription: data.seoDescription ?? '',
      coverImageMediaId: data.coverImageMediaId,
      downloadMediaId: data.downloadMediaId,
      coverImage: data.coverImage ?? '',
      downloadUrl: data.downloadUrl ?? '',
      downloadFiles: buildAdminDownloadFilesFormState(data.downloadFiles, data.downloadUrl),
    }
    setForm(loaded)
    setPresetId(inferPresetFromForm(loaded))
    setGalleryRows(
      (data.galleryImages ?? []).map((g) => ({
        key: g.id,
        mediaId: g.mediaId,
        preview: resolveMediaUrl(g.url),
      })),
    )
    setCoverPreviewUrl(
      data.coverMedia?.url
        ? resolveMediaUrl(data.coverMedia.url)
        : data.coverImage
          ? resolveMediaUrl(data.coverImage)
          : null,
    )
    setDownloadInfo(
      data.downloadMedia
        ? { name: data.downloadMedia.originalName, size: data.downloadMedia.fileSize }
        : null,
    )
    setUseCoverUrl(Boolean(data.coverImage && !data.coverImageMediaId))
    setSlugManual(true)
    // Yalnızca ürün kaydı ilk yüklendiğinde hydrate et; arka plan refetch formu sıfırlamaz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id])

  const coverPreview = useMemo(() => {
    if (useCoverUrl && form.coverImage?.trim()) return resolveMediaUrl(form.coverImage)
    if (coverPreviewUrl) return coverPreviewUrl
    if (form.coverImageMediaId && data?.coverMedia?.url) return resolveMediaUrl(data.coverMedia.url)
    const raw = data?.coverImage
    return raw ? resolveMediaUrl(raw) : null
  }, [useCoverUrl, form.coverImage, coverPreviewUrl, form.coverImageMediaId, data])

  const update = <K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !slugManual) next.slug = slugifySoftwareName(String(value))
      return next
    })
  }

  const onPresetChange = (nextPreset: AdminProductPresetId) => {
    setPresetId(nextPreset)
    setForm((prev) => applyProductPreset(nextPreset, prev))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const err = validateAdminProductForm(form, presetId)
      if (err) {
        setTab(tabForValidationError(err))
        throw new Error(err)
      }

      const downloadFilesPayload = resolveDownloadFilesSavePayload(
        form.downloadFiles,
        isNew ? null : data?.downloadFiles,
      )

      const payload: AdminProductInput = {
        ...form,
        name: form.name.trim(),
        slug: (form.slug.trim() || slugifySoftwareName(form.name)).toLowerCase(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        currency: form.currency.trim() || 'TRY',
        version: form.version.trim(),
        compareAtPrice:
          form.compareAtPrice === null || form.compareAtPrice === 0 ? null : form.compareAtPrice,
        categoryId: form.categoryId || null,
        seoTitle: form.seoTitle?.trim() || '',
        seoDescription: form.seoDescription?.trim() || '',
        coverImageMediaId: useCoverUrl ? null : form.coverImageMediaId ?? null,
        downloadMediaId: form.downloadMediaId ?? null,
        galleryMediaIds: galleryRows.map((r) => r.mediaId),
        licenseRequired: presetId === 'LICENSED' ? true : form.licenseRequired,
        licenseAppCode: (presetId === 'LICENSED' || form.licenseRequired) ? form.licenseAppCode : null,
        licenseDays: (presetId === 'LICENSED' || form.licenseRequired) ? form.licenseDays : null,
        licenseMaxDevices: (presetId === 'LICENSED' || form.licenseRequired) ? form.licenseMaxDevices : null,
        coverImage: useCoverUrl ? (form.coverImage ?? '').trim() : undefined,
        downloadUrl: (form.downloadUrl ?? '').trim() || undefined,
        ...(downloadFilesPayload !== undefined ? { downloadFiles: downloadFilesPayload } : {}),
      }

      if (isNew) return adminProductsService.create(payload)
      return adminProductsService.update(id!, payload)
    },
    onSuccess: () => navigate('/admin/urunler'),
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const onCoverSelect = (media: CatalogMedia) => {
    setUseCoverUrl(false)
    setForm((p) => ({ ...p, coverImageMediaId: media.id, coverImage: '' }))
    setCoverPreviewUrl(resolveMediaUrl(media.url))
  }

  const onGallerySelect = (media: CatalogMedia) => {
    if (galleryRows.some((r) => r.mediaId === media.id)) return
    setGalleryRows((rows) => [
      ...rows,
      { key: `${media.id}-${Date.now()}`, mediaId: media.id, preview: resolveMediaUrl(media.url) },
    ])
  }

  const onDownloadSelect = (media: CatalogMedia) => {
    setForm((p) => ({ ...p, downloadMediaId: media.id }))
    setDownloadInfo({ name: media.originalName, size: media.fileSize })
  }

  if (!isNew && isLoading) return <LoadingState label="Ürün yükleniyor…" />
  if (!isNew && isError) return <EmptyState title="Ürün bulunamadı" description="Kayıt yüklenemedi." />

  const showDownload = presetShowsDownloadFields(presetId)
  const showR2Downloads = presetShowsR2DownloadFields(presetId)
  const showLicense = presetShowsLicenseFields(presetId)
  const showSaas = presetShowsSaasFields(presetId)

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={isNew ? 'Yeni ürün' : 'Ürün düzenle'}
        description="Ürün tipine göre yönlendirilen sekmeli form — fiyat, teslimat ve merkezi lisans ayarları."
        actions={
          <Link
            to="/admin/urunler"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Ürün listesi
          </Link>
        }
      />

      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-medium text-slate-800">Ürün tipi</p>
          <p className="text-xs text-slate-500">
            Tip seçildiğinde yalnızca ilgili alanlar gösterilir. Public tarafta satışa açık ve fiyatlı ürünlerde ana
            buton <strong>Sepete Ekle</strong> olur.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {ADMIN_PRODUCT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPresetChange(preset.id)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition',
                  presetId === preset.id
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                    : 'border-slate-200 bg-white hover:border-brand-200',
                )}
              >
                <span className="block text-sm font-semibold text-slate-900">{preset.label}</span>
                <span className="mt-1 block text-xs leading-snug text-slate-500">{preset.description}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setFormError(null)
          void saveMutation.mutateAsync()
        }}
      >
        {formError ? (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-700">{formError}</p>
            </CardBody>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
          {PRODUCT_FORM_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-6">
            {tab === 'basic' ? (
              <Card>
                <CardBody className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Ürün adı"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      required
                    />
                    <Input
                      label="Slug (URL adresi)"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugManual(true)
                        update('slug', e.target.value)
                      }}
                    />
                    <p className="text-xs text-slate-500 sm:col-span-2">
                      Ad yazıldıkça otomatik oluşur; isterseniz düzenleyebilirsiniz.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
                    <select
                      value={form.categoryId ?? ''}
                      onChange={(e) => update('categoryId', e.target.value || null)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">— Kategori seçin (opsiyonel) —</option>
                      {(categoriesQuery.data ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      <Link to="/admin/kategoriler" className="text-brand-700 hover:underline">
                        Kategori yönetimi
                      </Link>
                    </p>
                  </div>
                  <Input
                    label="Kısa açıklama"
                    value={form.shortDescription}
                    onChange={(e) => update('shortDescription', e.target.value)}
                  />
                  <TextArea
                    label="Detay açıklama"
                    value={form.description}
                    onChange={(v) => update('description', v)}
                    rows={6}
                  />
                  <TextArea
                    label="Öne çıkan özellikler"
                    value={form.featureBullets}
                    onChange={(v) => update('featureBullets', v)}
                    rows={6}
                    hint="Her satır bir madde olarak ürün detayında listelenir."
                  />
                  {presetId !== 'SERVICE' ? (
                    <Input
                      label="Sürüm"
                      value={form.version}
                      onChange={(e) => update('version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'pricing' ? (
              <Card>
                <CardBody className="space-y-4">
                  <HelpBox>
                    Bu ürünü satışa açmak için fiyat ve &quot;Satışa açık&quot; alanını doldurun. Fiyat yoksa public
                    tarafta <strong>Teklif Al</strong> gösterilir; Sepete Ekle aktif olmaz.
                  </HelpBox>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Input
                      label="Satış fiyatı"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(e) => update('price', Number.parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Eski fiyat (indirimli gösterim)"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.compareAtPrice ?? ''}
                      onChange={(e) =>
                        update(
                          'compareAtPrice',
                          e.target.value === '' ? null : Number.parseFloat(e.target.value) || null,
                        )
                      }
                    />
                    <Input label="Para birimi" value={form.currency} readOnly />
                  </div>
                  <CheckboxField
                    label="Satışa açık"
                    checked={form.purchaseEnabled}
                    onChange={(v) => update('purchaseEnabled', v)}
                    description="Kapalıysa ürün görünse bile sepete eklenemez; Teklif Al veya bilgi kartı gösterilir."
                  />
                  {data?.deliveryLinkMissing && showDownload ? (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      Uyarı: Bu ürün için teslimat dosyası veya indirme adresi eksik.
                    </p>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'delivery' ? (
              <Card>
                <CardBody className="space-y-5">
                  {presetId === 'SERVICE' ? (
                    <HelpBox>
                      Hizmet / teklif ürünlerinde indirme ve lisans alanları kullanılmaz. Satışa kapalı bırakın veya
                      fiyat girmeden teklif akışını kullanın.
                    </HelpBox>
                  ) : null}

                  {presetId === 'FREE_TOOL' ? (
                    <HelpBox>
                      Ücretsiz araçlarda sepete ekleme kapalıdır. R2 indirme dosyalarını aşağıdan tanımlayın; public
                      ürün sayfasında doğrudan indirme butonları gösterilir.
                    </HelpBox>
                  ) : null}

                  {showR2Downloads ? (
                    <ProductR2DownloadFilesSection
                      value={form.downloadFiles ?? emptyDownloadFilesConfig()}
                      onChange={(downloadFiles) => setForm((p) => ({ ...p, downloadFiles }))}
                      showFreeFlags={presetId === 'FREE_TOOL' || presetId === 'DOWNLOADABLE' || presetId === 'LICENSED'}
                    />
                  ) : null}

                  {showDownload ? (
                    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-800">Dijital dosya teslimatı</p>
                      <HelpBox>
                        Dijital teslimat için dosya seçerseniz ödeme sonrası e-posta ile gönderilir ve ödeme onaylı
                        siparişlerde müşteri hesabından indirilebilir.
                      </HelpBox>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => setDownloadPickerOpen(true)}>
                          Medyadan dosya seç (ZIP / EXE / PDF…)
                        </Button>
                        {form.downloadMediaId ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setForm((p) => ({ ...p, downloadMediaId: null }))
                              setDownloadInfo(null)
                            }}
                          >
                            Seçimi kaldır
                          </Button>
                        ) : null}
                      </div>
                      {downloadInfo ? (
                        <p className="text-sm text-slate-700">
                          {downloadInfo.name} — {(downloadInfo.size / 1024).toFixed(1)} KB
                        </p>
                      ) : null}
                      <Input
                        label="Alternatif indirme URL"
                        value={form.downloadUrl ?? ''}
                        onChange={(e) => update('downloadUrl', e.target.value)}
                        placeholder="https://… veya R2 medya adresi"
                      />
                      <p className="text-xs text-slate-500">
                        Medya kütüphanesinden dosya seçmezseniz doğrudan URL girebilirsiniz.
                      </p>
                    </div>
                  ) : null}

                  {showLicense && presetId === 'LICENSED' ? (
                    <div className="space-y-4">
                      <CentralLicenseInfoBanner
                        extra="Lisans program kodu, merkezi lisans server'daki appCode ile aynı olmalıdır."
                      />
                      <CheckboxField
                        label="Merkezi lisans gerekli"
                        checked={form.licenseRequired}
                        onChange={(v) => {
                          setForm((p) => ({
                            ...p,
                            licenseRequired: v,
                            licenseAppCode: v ? p.licenseAppCode || 'MUVEKKIL_KASA_DESKTOP' : null,
                          }))
                        }}
                        description="Ödeme onayından sonra merkezi Woontegra Lisans Server'a bildirilir; lisans bilgileri müşteriye e-posta ile iletilir."
                      />
                      {form.licenseRequired ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              Lisans program kodu (appCode)
                            </label>
                            <select
                              value={form.licenseAppCode ?? ''}
                              onChange={(e) => update('licenseAppCode', e.target.value)}
                              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            >
                              {DESKTOP_LICENSE_PROGRAMS.map((p) => (
                                <option key={p.appCode} value={p.appCode}>
                                  {p.label} ({p.appCode})
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            label="Lisans süresi (gün)"
                            type="number"
                            min={1}
                            max={3650}
                            value={form.licenseDays ?? 365}
                            onChange={(e) => update('licenseDays', Number.parseInt(e.target.value, 10) || 365)}
                          />
                          <Input
                            label="Cihaz limiti"
                            type="number"
                            min={1}
                            max={50}
                            value={form.licenseMaxDevices ?? 1}
                            onChange={(e) =>
                              update('licenseMaxDevices', Number.parseInt(e.target.value, 10) || 1)
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {showSaas ? (
                    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-800">SaaS / abonelik teslimatı</p>
                      <Input
                        label="Abonelik süresi (ay)"
                        type="number"
                        min={1}
                        max={120}
                        value={form.licenseMonths}
                        onChange={(e) => update('licenseMonths', Number.parseInt(e.target.value, 10) || 12)}
                      />
                      <p className="text-xs text-slate-500">
                        Yıllık/aylık fiyatlandırma public detayda yıl seçimi ile çarpılır.
                      </p>
                      <CheckboxField
                        label="Merkezi lisans gerekiyor"
                        checked={form.licenseRequired}
                        onChange={(v) => {
                          setForm((p) => ({
                            ...p,
                            licenseRequired: v,
                            licenseAppCode: v ? p.licenseAppCode || 'MUVEKKIL_KASA_DESKTOP' : null,
                          }))
                        }}
                      />
                      {form.licenseRequired ? (
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Lisans appCode</label>
                          <select
                            value={form.licenseAppCode ?? ''}
                            onChange={(e) => update('licenseAppCode', e.target.value)}
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          >
                            {DESKTOP_LICENSE_PROGRAMS.map((p) => (
                              <option key={p.appCode} value={p.appCode}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                      <TextArea
                        label="Teslimat açıklaması (detay sayfasında)"
                        value={form.shortDescription}
                        onChange={(v) => update('shortDescription', v)}
                        rows={3}
                        hint="Hesap bilgileri ve erişim süreci müşteriye e-posta ile iletilir."
                      />
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'media' ? (
              <Card>
                <CardBody className="space-y-6">
                  <p className="text-sm text-slate-600">
                    Kapak görseli ile teslimat dosyası ayrıdır. Görseller için IMAGE, indirilecek dosya için ZIP/EXE/PDF
                    seçin.
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-sm font-medium text-slate-800">Kapak görseli</p>
                    <ImageUploadSizeNote spec="productCover" className="mb-3" />
                    <div className="flex flex-wrap items-start gap-4">
                      {coverPreview ? (
                        <SafeImage
                          src={coverPreview}
                          alt=""
                          className="h-24 w-36 rounded-lg border border-slate-200 object-cover"
                          productPlaceholder
                          placeholder
                        />
                      ) : (
                        <div className="flex h-24 w-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="min-w-[240px] flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => setCoverPickerOpen(true)}>
                            <Images className="h-4 w-4" />
                            Medya seç
                          </Button>
                          {form.coverImageMediaId ? (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setForm((p) => ({ ...p, coverImageMediaId: null }))
                                setCoverPreviewUrl(null)
                              }}
                            >
                              Seçimi kaldır
                            </Button>
                          ) : null}
                        </div>
                        <details className="text-sm text-slate-600">
                          <summary className="cursor-pointer font-medium">Alternatif: URL ile kapak</summary>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={useCoverUrl}
                                onChange={(e) => {
                                  setUseCoverUrl(e.target.checked)
                                  if (e.target.checked) {
                                    setForm((p) => ({ ...p, coverImageMediaId: null }))
                                    setCoverPreviewUrl(null)
                                  }
                                }}
                              />
                              URL modu
                            </label>
                            {useCoverUrl ? (
                              <Input
                                label="Kapak görsel URL"
                                hint={imageUploadSizeHint('productCover')}
                                value={form.coverImage ?? ''}
                                onChange={(e) => {
                                  update('coverImage', e.target.value)
                                  setCoverPreviewUrl(resolveMediaUrl(e.target.value))
                                }}
                                placeholder="/uploads/... veya https://..."
                              />
                            ) : null}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">Galeri görselleri</p>
                      <ImageUploadSizeNote spec="productGallery" className="mt-1" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => setGalleryPickerOpen(true)}>
                        <Images className="h-4 w-4" />
                        Görsel ekle
                      </Button>
                    </div>
                    {galleryRows.length === 0 ? (
                      <p className="text-sm text-slate-500">Henüz galeri görseli seçilmedi.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {galleryRows.map((row) => (
                          <div key={row.key} className="relative">
                            <SafeImage
                              src={row.preview}
                              alt=""
                              className="h-20 w-28 rounded-lg border object-cover"
                              productPlaceholder
                              placeholder
                            />
                            <button
                              type="button"
                              className="absolute -right-2 -top-2 rounded-full border bg-white p-1 text-slate-600 shadow hover:text-red-600"
                              onClick={() => setGalleryRows((rows) => rows.filter((r) => r.key !== row.key))}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {showDownload ? (
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-800">Teslimat dosyası</p>
                      <p className="mb-3 text-xs text-slate-500">
                        Ödeme onayı sonrası müşteriye gönderilecek indirme dosyası — kapak görselinden ayrı seçilir.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => setDownloadPickerOpen(true)}>
                          Teslimat dosyası seç
                        </Button>
                      </div>
                      {downloadInfo ? (
                        <p className="mt-2 text-sm text-slate-700">
                          {downloadInfo.name} — {(downloadInfo.size / 1024).toFixed(1)} KB
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'seo' ? (
              <Card>
                <CardBody className="space-y-4">
                  <Input
                    label="SEO başlık"
                    value={form.seoTitle ?? ''}
                    onChange={(e) => update('seoTitle', e.target.value)}
                  />
                  <TextArea
                    label="SEO açıklama"
                    value={form.seoDescription ?? ''}
                    onChange={(v) => update('seoDescription', v)}
                    rows={3}
                  />
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <p className="font-medium text-slate-700">Canonical önizleme</p>
                    <p className="mt-1 font-mono text-xs text-brand-700">
                      /yazilimlar/{form.slug.trim() || slugifySoftwareName(form.name) || 'slug'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CheckboxField
                      label="Yayında (aktif)"
                      checked={form.isActive}
                      onChange={(v) => update('isActive', v)}
                      description="Pasif ürünler public listede görünmez."
                    />
                    <CheckboxField
                      label="Öne çıkan"
                      checked={form.isFeatured}
                      onChange={(v) => update('isFeatured', v)}
                    />
                  </div>
                  <Input
                    label="Sıralama"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => update('sortOrder', Number.parseInt(e.target.value, 10) || 0)}
                  />
                  <p className="text-xs text-slate-500">Küçük değerler listede önce görünür.</p>
                </CardBody>
              </Card>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <ProductFormSummary form={form} presetId={presetId} coverPreview={coverPreview} />
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-1 mt-6 border-t border-slate-200 bg-white/95 px-1 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/urunler')}>
              İptal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Kaydediliyor…' : isNew ? 'Oluştur' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </form>

      <div className="lg:hidden">
        <ProductFormSummary form={form} presetId={presetId} coverPreview={coverPreview} />
      </div>

      <MediaPickerModal
        open={coverPickerOpen}
        title="Kapak görseli seç"
        allowedTypes={['IMAGE']}
        imageSizeSpec="productCover"
        onClose={() => setCoverPickerOpen(false)}
        onSelect={onCoverSelect}
      />
      <MediaPickerModal
        open={galleryPickerOpen}
        title="Galeri görseli ekle"
        allowedTypes={['IMAGE']}
        imageSizeSpec="productGallery"
        onClose={() => setGalleryPickerOpen(false)}
        onSelect={onGallerySelect}
      />
      <MediaPickerModal
        open={downloadPickerOpen}
        title="Teslimat dosyası seç"
        allowedTypes={['DOWNLOAD', 'DOCUMENT']}
        onClose={() => setDownloadPickerOpen(false)}
        onSelect={onDownloadSelect}
      />
    </div>
  )
}
