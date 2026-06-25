import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AdminPageEditorShell } from '@/components/admin/AdminPageEditorShell'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { getErrorMessage } from '@/services/api/client'
import { cmsPagesService } from '@/services/api/cmsPages'

function TextArea({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

export function AdminCmsPageEditPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pageQuery = useQuery({
    queryKey: ['admin', 'cms-page', id],
    queryFn: () => cmsPagesService.getById(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (!pageQuery.data) return
    setTitle(pageQuery.data.title)
    setSlug(pageQuery.data.slug)
    setContent(pageQuery.data.content ?? '')
    setStatus(pageQuery.data.status === 'draft' ? 'draft' : 'published')
  }, [pageQuery.data])

  const saveMutation = useMutation({
    mutationFn: () =>
      cmsPagesService.update(id, {
        title: title.trim(),
        slug: slug.trim(),
        content,
        status,
      }),
    onSuccess: () => {
      setMessage('Kaydedildi')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms-pages'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms-page', id] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'site-pages'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (!id) return <Navigate to="/admin/sayfalar" replace />

  const publicPath = slug.trim() ? `/${slug.trim()}` : undefined

  return (
    <AdminPageEditorShell
      title={title || 'Özel sayfa'}
      subtitle={`Özel CMS sayfası · /${slug || '…'}`}
      publicPath={publicPath}
      statusMessage={message}
      errorMessage={error}
      saving={saveMutation.isPending}
      onSave={() => void saveMutation.mutateAsync()}
      technicalDetails={[
        { label: 'ID', value: id },
        { label: 'API', value: `PUT /api/admin/cms/pages/${id}` },
        { label: 'Public route', value: publicPath ?? '—' },
      ]}
    >
      {pageQuery.isLoading ? <LoadingState label="Sayfa yükleniyor…" /> : null}

      {!pageQuery.isLoading && pageQuery.data ? (
        <>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Sayfa Ayarları</h2>
              <Input label="Sayfa başlığı" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Slug (public route)" value={slug} onChange={(e) => setSlug(e.target.value)} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Durum</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                >
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak</option>
                </select>
              </div>
              <p className="text-xs text-slate-500">
                SEO alanları bu modelde backend&apos;de ayrı tutulmaz; public meta başlıktan türetilir.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">İçerik</h2>
              <TextArea label="HTML içerik" value={content} onChange={setContent} rows={16} />
            </CardBody>
          </Card>
        </>
      ) : null}
    </AdminPageEditorShell>
  )
}
