import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MediaPickerModal } from '@/components/admin/MediaPickerModal'
import type { CatalogMedia } from '@/types/catalogMedia'
import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'
import { buildBrandedAssetUrl } from '@/utils/mediaUrl'

type Props = {
  label: string
  value: string
  logoUpdatedAt?: string
  onChange: (url: string) => void
  hint?: string
}

export function SettingsMediaField({ label, value, logoUpdatedAt, onChange, hint }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const preview = buildBrandedAssetUrl(value, logoUpdatedAt)

  const onSelect = (media: CatalogMedia) => {
    onChange(media.url)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            <img
              src={preview}
              alt=""
              className="max-h-full max-w-full object-contain p-1"
              onError={(e) => {
                e.currentTarget.src = buildBrandedAssetUrl(DEFAULT_HEADER_LOGO_PATH)
              }}
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
              Medyadan seç
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
                Temizle
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <Input
        label="URL (manuel)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/... veya https://..."
      />
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
