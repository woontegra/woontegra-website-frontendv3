import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AdminPageEditorShell } from '@/components/admin/AdminPageEditorShell'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/services/api/client'
import { cmsPagesService } from '@/services/api/cmsPages'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 6,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

export function AdminPagesNewPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () => {
      const trimmedSlug = slug.trim() || slugify(title)
      const bodyParts: string[] = []
      if (description.trim()) bodyParts.push(`<p class="page-lead">${description.trim()}</p>`)
      if (content.trim()) bodyParts.push(content.trim())
      return cmsPagesService.create({
        title: title.trim(),
        slug: trimmedSlug,
        content: bodyParts.join('\n') || '<p></p>',
        status,
      })
    },
    onSuccess: () => {
      navigate('/admin/sayfalar', { replace: true })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const publicPath = slug.trim() ? `/${slug.trim()}` : undefined

  return (
    <AdminPageEditorShell
      title="Yeni özel sayfa"
      subtitle="Dinamik CMS sayfası oluşturun"
      publicPath={publicPath}
      errorMessage={error}
      saving={createMutation.isPending}
      onSave={() => {
        if (!title.trim()) {
          setError('Sayfa başlığı gerekli')
          return
        }
        setError(null)
        void createMutation.mutateAsync()
      }}
      saveLabel="Oluştur ve kaydet"
      technicalDetails={[
        { label: 'API', value: 'POST /api/pages' },
        { label: 'Public route', value: publicPath ?? '/…' },
      ]}
    >
      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Sayfa Ayarları</h2>
          <Input label="Sayfa başlığı *" value={title} onChange={(e) => handleTitleChange(e.target.value)} />
          <Input
            label="Slug (URL)"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            placeholder="ornek-sayfa"
          />
          <TextArea
            label="Kısa açıklama"
            hint="İçeriğin üstüne lead paragraf olarak eklenir."
            value={description}
            onChange={setDescription}
            rows={2}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Durum</label>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
            >
              <option value="published">Yayında</option>
              <option value="draft">Taslak (pasif)</option>
            </select>
          </div>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            SEO başlık ve açıklama alanları dinamik sayfa modelinde backend tarafında ayrı tutulmaz; public
            sayfada tarayıcı başlığı sayfa adından türetilir.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">İçerik</h2>
          <TextArea
            label="HTML içerik"
            hint="Basit HTML kullanabilirsiniz. Craft.js builder içeriği desteklenir (JSON ile başlayan içerik)."
            value={content}
            onChange={setContent}
            rows={14}
          />
        </CardBody>
      </Card>
    </AdminPageEditorShell>
  )
}
