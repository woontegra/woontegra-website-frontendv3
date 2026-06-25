import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { AdminTechnicalDetails } from '@/components/admin/AdminTechnicalDetails'

type Props = {
  backTo?: string
  backLabel?: string
  title: string
  subtitle?: string
  publicPath?: string
  statusMessage?: string | null
  errorMessage?: string | null
  saving?: boolean
  onSave?: () => void
  saveLabel?: string
  technicalDetails?: Array<{ label: string; value: string }>
  meta?: React.ReactNode
  children: React.ReactNode
}

export function AdminPageEditorShell({
  backTo = '/admin/sayfalar',
  backLabel = 'Sayfalara dön',
  title,
  subtitle,
  publicPath,
  statusMessage,
  errorMessage,
  saving = false,
  onSave,
  saveLabel = 'Kaydet',
  technicalDetails = [],
  meta,
  children,
}: Props) {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {meta}
          {technicalDetails.length ? <AdminTechnicalDetails items={technicalDetails} /> : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {publicPath ? (
            <Link
              to={publicPath}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:bg-slate-50"
            >
              Canlı sayfayı aç
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
          {onSave ? (
            <Button disabled={saving} onClick={onSave}>
              <Save className="h-4 w-4" />
              {saving ? 'Kaydediliyor…' : saveLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="text-sm text-red-700">{errorMessage}</CardBody>
        </Card>
      ) : null}
      {statusMessage ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardBody className="text-sm text-emerald-800">{statusMessage}</CardBody>
        </Card>
      ) : null}

      {children}
    </div>
  )
}
