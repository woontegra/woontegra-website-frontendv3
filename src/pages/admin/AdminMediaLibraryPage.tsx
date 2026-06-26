import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { catalogMediaService } from '@/services/api/catalogMedia'
import { getErrorMessage } from '@/services/api/client'
import type { CatalogMedia } from '@/types/catalogMedia'
import { resolveCatalogMediaPreviewUrl } from '@/lib/resolveCatalogMediaPreviewUrl'
import { ImageUploadGuidePanel } from '@/components/admin/ImageUploadSizeNote'

export function AdminMediaLibraryPage() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'catalog-media'],
    queryFn: () => catalogMediaService.list(),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => catalogMediaService.upload(file),
    onSuccess: () => {
      setUploadError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'catalog-media'] })
    },
    onError: (err) => setUploadError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogMediaService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'catalog-media'] }),
  })

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void uploadMutation.mutateAsync(file)
  }

  const copyUrl = async (m: CatalogMedia) => {
    try {
      await navigator.clipboard.writeText(m.url)
      setCopiedId(m.id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setUploadError('URL kopyalanamadı')
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Medya kütüphanesi"
        description="Ürün kapak, galeri ve indirme dosyaları için katalog medya."
        actions={
          <>
            <input ref={inputRef} type="file" className="hidden" onChange={onFile} />
            <Button onClick={() => inputRef.current?.click()} disabled={uploadMutation.isPending}>
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? 'Yükleniyor…' : 'Dosya yükle'}
            </Button>
          </>
        }
      />

      {uploadError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{uploadError}</p>
          </CardBody>
        </Card>
      ) : null}

      <ImageUploadGuidePanel />

      {isLoading ? <LoadingState label="Medya yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>
              Tekrar dene
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState title="Henüz medya yok" description="Görsel veya dosya yükleyerek başlayın." />
      ) : null}

      {data && data.length > 0 ? (
        <Table>
          <THead>
            <TR>
              <TH>Önizleme</TH>
              <TH>Dosya</TH>
              <TH>Tür</TH>
              <TH>Boyut</TH>
              <TH>URL</TH>
              <TH className="text-right">İşlem</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((m) => (
              <TR key={m.id}>
                <TD>
                  {m.fileType === 'IMAGE' ? (
                    <img
                      src={resolveCatalogMediaPreviewUrl(m.publicUrl || m.url)}
                      alt=""
                      className="h-12 w-16 rounded border object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/product-placeholder.svg'
                      }}
                    />
                  ) : (
                    <span className="text-xs text-slate-500">{m.fileType}</span>
                  )}
                </TD>
                <TD className="font-medium">{m.originalName}</TD>
                <TD>{m.fileType}</TD>
                <TD>{(m.fileSize / 1024).toFixed(1)} KB</TD>
                <TD className="max-w-[200px] truncate font-mono text-xs text-slate-500">{m.url}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => void copyUrl(m)}>
                      <Copy className="h-3.5 w-3.5" />
                      {copiedId === m.id ? 'OK' : 'Kopyala'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`“${m.originalName}” silinsin mi?`)) void deleteMutation.mutateAsync(m.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : null}
    </div>
  )
}
