import { useRef, useState } from 'react'
import { ImageIcon, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MediaPickerModal } from '@/components/admin/MediaPickerModal'
import { extractMediaUrl } from '@/lib/resolveMediaUrl'
import { resolveImageUrl } from '@/lib/resolveImageUrl'
import { catalogMediaService } from '@/services/api/catalogMedia'
import { getErrorMessage } from '@/services/api/client'
import type { CatalogMedia } from '@/types/catalogMedia'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
  /** thumb: küçük kare; wide: 16:9 blog/kapak önizlemesi */
  previewVariant?: 'thumb' | 'wide'
  allowDirectUpload?: boolean
  /** true ise manuel URL alanı varsayılan kapalı, aç/kapat ile gösterilir */
  manualUrlCollapsible?: boolean
}

export function ManagedImageField({
  label,
  value,
  onChange,
  hint,
  previewVariant = 'thumb',
  allowDirectUpload = false,
  manualUrlCollapsible = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [manualUrlOpen, setManualUrlOpen] = useState(!manualUrlCollapsible)
  const preview = value.trim() ? resolveImageUrl(value) : ''

  const onSelect = (media: CatalogMedia) => {
    onChange(extractMediaUrl(media) || media.url)
    setUploadError(null)
  }

  const onDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const created = await catalogMediaService.upload(file)
      onChange(extractMediaUrl(created) || created.url)
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Yükleme başarısız'))
    } finally {
      setUploading(false)
    }
  }

  const previewBoxClass =
    previewVariant === 'wide'
      ? 'aspect-video w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-50'
      : 'flex h-24 w-36 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50'

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <div className={previewVariant === 'wide' ? 'space-y-3' : 'flex flex-wrap items-start gap-4'}>
        <div className={previewBoxClass}>
          {preview ? (
            <img
              src={preview}
              alt=""
              className={
                previewVariant === 'wide'
                  ? 'h-full w-full object-cover'
                  : 'max-h-full max-w-full object-contain p-1'
              }
              onError={(e) => {
                e.currentTarget.src = resolveImageUrl(null, { placeholder: true })
              }}
            />
          ) : (
            <div className="flex h-full min-h-[6rem] w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-slate-300" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            Medyadan seç
          </Button>
          {allowDirectUpload ? (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onDirectUpload} />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Yükleniyor…' : 'Yükle'}
              </Button>
            </>
          ) : null}
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              Temizle
            </Button>
          ) : null}
        </div>
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
      {manualUrlCollapsible ? (
        <button
          type="button"
          className="text-xs font-medium text-brand-700 hover:underline"
          onClick={() => setManualUrlOpen((open) => !open)}
        >
          {manualUrlOpen ? 'Manuel URL alanını gizle' : 'Manuel URL gir'}
        </button>
      ) : null}
      {manualUrlOpen ? (
        <Input
          label="Görsel yolu (manuel)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... veya /images/..."
        />
      ) : null}
      <MediaPickerModal
        open={pickerOpen}
        title={`${label} seç`}
        allowedTypes={['IMAGE']}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
      />
    </div>
  )
}
