import { useParams } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { legalDocumentsService } from '@/services/api/legalDocuments'
import { resolveLegalDocumentHtml } from '@/data/legalDocumentApiFallbacks'
import { ALL_LEGAL_DOC_TYPES, type LegalDocType } from '@/types/legalDocuments'
import { LegalHtmlBody, LegalPageLayout } from '@/components/site/LegalPageLayout'

export function LegalTypeDocumentPage() {
  const { type = '' } = useParams()
  const docType = ALL_LEGAL_DOC_TYPES.includes(type as LegalDocType) ? (type as LegalDocType) : null

  const { data, isLoading, isError } = useQuery({
    queryKey: ['legal-document', docType],
    queryFn: () => legalDocumentsService.preview(docType!),
    enabled: Boolean(docType),
  })

  usePageMeta({
    title: data?.title || 'Yasal belge',
    description: data?.title,
  })

  if (!docType) return <Navigate to="/" replace />

  const title = data?.title?.trim() || 'Yasal belge'
  const html = resolveLegalDocumentHtml(docType, data?.content)
  const showFallbackNote = isError || !data?.content?.trim()

  return (
    <LegalPageLayout title={title} subtitle="Woontegra yasal belge metni">
      <p className="mb-6 text-sm text-slate-600">
        <Link to="/yazilimlar" className="font-medium text-brand-700 hover:underline">
          Yazılımlar
        </Link>
      </p>
      {isLoading ? (
        <LoadingState label="Yükleniyor…" />
      ) : (
        <>
          {showFallbackNote ? (
            <p className="mb-4 text-xs text-slate-500">
              Önizleme metni yüklenemedi veya henüz özelleştirilmedi; varsayılan metin gösteriliyor. Özelleştirmek
              için Admin Panel → Yasal Metinler bölümünü kullanın.
            </p>
          ) : null}
          <LegalHtmlBody html={html} />
        </>
      )}
    </LegalPageLayout>
  )
}
