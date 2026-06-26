import type { ImageUploadSpecKey } from '@/constants/imageUploadSpecs'
import { IMAGE_UPLOAD_SPECS } from '@/constants/imageUploadSpecs'
import { cn } from '@/utils/cn'

type Props = {
  spec: ImageUploadSpecKey
  className?: string
}

/** Görsel yükleme alanı altında önerilen piksel boyutu notu. */
export function ImageUploadSizeNote({ spec, className }: Props) {
  return (
    <p className={cn('text-xs leading-relaxed text-slate-500', className)}>
      {IMAGE_UPLOAD_SPECS[spec].hint}
    </p>
  )
}

type GuideProps = {
  className?: string
}

/** Medya kütüphanesi ve benzeri ekranlarda tüm boyut rehberi. */
export function ImageUploadGuidePanel({ className }: GuideProps) {
  const rows = Object.entries(IMAGE_UPLOAD_SPECS) as [ImageUploadSpecKey, (typeof IMAGE_UPLOAD_SPECS)[ImageUploadSpecKey]][]

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-4', className)}>
      <h3 className="text-sm font-semibold text-slate-900">Görsel boyut rehberi</h3>
      <p className="mt-1 text-xs text-slate-600">
        Tutarlı görünüm için aşağıdaki ölçülere göre yükleyin. Görseller sitede object-cover ile kırpılabilir.
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map(([key, row]) => (
          <li key={key} className="text-xs text-slate-600">
            <span className="font-medium text-slate-800">{row.label}:</span> {row.hint}
          </li>
        ))}
      </ul>
    </div>
  )
}
