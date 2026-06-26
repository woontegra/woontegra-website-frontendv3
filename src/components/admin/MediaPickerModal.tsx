import { useEffect, useRef, useState } from 'react'
import { Copy, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { catalogMediaService } from '@/services/api/catalogMedia'
import { getErrorMessage } from '@/services/api/client'
import type { CatalogMedia, CatalogMediaFileType } from '@/types/catalogMedia'
import { ImageUploadSizeNote } from '@/components/admin/ImageUploadSizeNote'
import type { ImageUploadSpecKey } from '@/constants/imageUploadSpecs'
import { resolveCatalogMediaPreviewUrl } from '@/lib/resolveCatalogMediaPreviewUrl'

type Props = {
  open: boolean
  title: string
  allowedTypes: CatalogMediaFileType[]
  imageSizeSpec?: ImageUploadSpecKey
  onClose: () => void
  onSelect: (media: CatalogMedia) => void
}

export function MediaPickerModal({ open, title, allowedTypes, imageSizeSpec, onClose, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<CatalogMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      setError(null)
      setLoading(true)
      try {
        const lists = await Promise.all(allowedTypes.map((t) => catalogMediaService.list(t)))
        if (cancelled) return
        const merged = lists
          .flat()
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        setItems(merged)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Medya listesi yüklenemedi'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, allowedTypes])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const created = await catalogMediaService.upload(file)
      setItems((prev) => [created, ...prev])
    } catch (err) {
      setError(getErrorMessage(err, 'Yükleme başarısız'))
    } finally {
      setUploading(false)
    }
  }

  const copyUrl = async (media: CatalogMedia) => {
    try {
      await navigator.clipboard.writeText(media.url)
      setCopiedId(media.id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('URL kopyalanamadı')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">Katalog medya: /api/admin/media</p>
            <div>
              <input ref={inputRef} type="file" className="hidden" onChange={onUpload} />
              <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {uploading ? 'Yükleniyor…' : 'Yükle'}
              </Button>
            </div>
          </div>
          {allowedTypes.includes('IMAGE') ? (
            <ImageUploadSizeNote spec={imageSizeSpec ?? 'mediaGeneral'} className="mt-2" />
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? <LoadingState label="Medya yükleniyor…" /> : null}
          {error ? (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <EmptyState title="Medya yok" description="Dosya yükleyin veya medya kütüphanesine ekleyin." />
          ) : null}

          <ul className="divide-y divide-slate-100">
            {items.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                {m.fileType === 'IMAGE' ? (
                  <img
                    src={resolveCatalogMediaPreviewUrl(m.publicUrl || m.url)}
                    alt=""
                    className="h-14 w-20 rounded border object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/product-placeholder.svg'
                    }}
                  />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded border bg-slate-100 text-xs font-medium text-slate-600">
                    {m.fileType}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{m.originalName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {(m.fileSize / 1024).toFixed(1)} KB · {m.mimeType}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => void copyUrl(m)}>
                    <Copy className="h-3.5 w-3.5" />
                    {copiedId === m.id ? 'Kopyalandı' : 'URL'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onSelect(m)
                      onClose()
                    }}
                  >
                    Seç
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
