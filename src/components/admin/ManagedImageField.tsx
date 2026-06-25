import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MediaPickerModal } from '@/components/admin/MediaPickerModal'
import { extractMediaUrl } from '@/lib/resolveMediaUrl'
import { resolveImageUrl } from '@/lib/resolveImageUrl'
import type { CatalogMedia } from '@/types/catalogMedia'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}

export function ManagedImageField({ label, value, onChange, hint }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const preview = value.trim() ? resolveImageUrl(value) : ''

  const onSelect = (media: CatalogMedia) => {
    onChange(extractMediaUrl(media) || media.url)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {preview ? (
            <img
              src={preview}
              alt=""
              className="max-h-full max-w-full object-contain p-1"
              onError={(e) => {
                e.currentTarget.src = resolveImageUrl(null, { placeholder: true })
              }}
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300" />
          )}
        </div>
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
      <Input
        label="Görsel yolu (manuel)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/... veya /uploads/..."
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
