import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getErrorMessage } from '@/services/api/client'
import { legalDocumentsAdminService } from '@/services/api/legalDocumentsAdmin'
import {
  ALL_LEGAL_DOC_TYPES,
  LEGAL_DOC_TYPE_LABELS,
  legalDocPublicPath,
  type AdminLegalDocumentInput,
  type LegalDocType,
} from '@/types/legalDocuments'

const PLACEHOLDER_HINT =
  'Şablonda kullanılabilir: customerName, customerEmail, orderNo, orderTotal, currency, productList, sellerTitle, sellerEmail, sellerAddress, sellerPhone, sellerTaxOffice, sellerTaxNumber, sellerMersis, sellerWebsite (çift süslü parantez içinde).'

const emptyForm: AdminLegalDocumentInput = {
  type: 'PRE_INFORMATION',
  title: '',
  content: '',
  version: 1,
  isActive: true,
}

function TextArea({
  label,
  value,
  onChange,
  rows = 18,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="min-h-[320px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

export function AdminLegalDocumentFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [form, setForm] = useState<AdminLegalDocumentInput>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'legal-documents', id],
    queryFn: () => legalDocumentsAdminService.getById(id!),
    enabled: !isNew && Boolean(id),
  })

  useEffect(() => {
    if (!data) return
    setForm({
      type: data.type as LegalDocType,
      title: data.title,
      content: data.content,
      version: data.version,
      isActive: data.isActive,
    })
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const title = form.title.trim()
      if (!title) throw new Error('Başlık zorunludur')
      if (!form.content.trim()) throw new Error('İçerik zorunludur')
      const payload = {
        title,
        content: form.content,
        version: Math.max(1, form.version),
        isActive: form.isActive,
      }
      if (isNew) return legalDocumentsAdminService.create({ ...payload, type: form.type })
      return legalDocumentsAdminService.patch(id!, payload)
    },
    onSuccess: () => {
      setSuccess('Kaydedildi')
      setFormError(null)
      window.setTimeout(() => navigate('/admin/yasal-metinler'), 800)
    },
    onError: (err) => {
      setFormError(getErrorMessage(err))
      setSuccess(null)
    },
  })

  const publicPath = legalDocPublicPath(form.type)

  if (!isNew && isLoading) {
    return (
      <div className="w-full min-w-0 py-12">
        <LoadingState label="Belge yükleniyor…" />
      </div>
    )
  }

  if (!isNew && isError) {
    return (
      <div className="w-full min-w-0 py-12">
        <EmptyState title="Belge bulunamadı" description="Kayıt silinmiş veya geçersiz olabilir." />
        <div className="mt-4 text-center">
          <Link to="/admin/yasal-metinler">
            <Button variant="secondary">Listeye dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link
        to="/admin/yasal-metinler"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Yasal metinlere dön
      </Link>

      <PageHeader
        title={isNew ? 'Yeni yasal belge' : 'Yasal belge düzenle'}
        description={isNew ? 'POST /api/admin/legal-documents' : 'PATCH /api/admin/legal-documents/:id'}
      />

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Card>
        <CardBody className="space-y-5">
          {isNew ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Belge tipi *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LegalDocType }))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {ALL_LEGAL_DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LEGAL_DOC_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Belge tipi: <strong>{LEGAL_DOC_TYPE_LABELS[form.type]}</strong> ({form.type}) — değiştirilemez
            </p>
          )}

          {publicPath ? (
            <Link
              to={publicPath}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              Canlı sayfayı aç: {publicPath}
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}

          <Input
            label="Başlık *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <TextArea
            label="HTML içerik *"
            value={form.content}
            onChange={(v) => setForm((f) => ({ ...f, content: v }))}
            hint={PLACEHOLDER_HINT}
          />

          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Sürüm</label>
              <input
                type="number"
                min={1}
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: Math.max(1, Number(e.target.value) || 1) }))}
                className="h-10 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300"
              />
              Aktif
            </label>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Link to="/admin/yasal-metinler">
          <Button variant="secondary">İptal</Button>
        </Link>
        <Button disabled={saveMutation.isPending} onClick={() => void saveMutation.mutateAsync()}>
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
