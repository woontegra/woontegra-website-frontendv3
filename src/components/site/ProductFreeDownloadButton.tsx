import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { PublicProductDownloadFile } from '@/types/product'
import { triggerFreeProductDownload } from '@/lib/downloadFile'
import { resolveProductDownloadButtonLabel } from '@/lib/freeProductDownload'

type Props = {
  file: PublicProductDownloadFile
  variant?: 'primary' | 'secondary'
}

export function ProductFreeDownloadButton({ file, variant = 'primary' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = resolveProductDownloadButtonLabel(file)
  const buttonVariant = file.type === 'portable' ? 'secondary' : variant

  const handleClick = async () => {
    setError(null)
    setLoading(true)
    try {
      await triggerFreeProductDownload(file.downloadPath)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <Button
        type="button"
        className="min-w-[160px]"
        variant={buttonVariant}
        disabled={loading}
        onClick={() => void handleClick()}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {loading ? 'İndirme hazırlanıyor...' : label}
      </Button>
      {error ? <p className="max-w-xs text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
