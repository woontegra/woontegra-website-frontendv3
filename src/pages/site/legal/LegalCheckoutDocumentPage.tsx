import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/ui/LoadingState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { legalDocumentsService } from '@/services/api/legalDocuments'
import { resolveLegalDocumentHtml } from '@/data/legalDocumentApiFallbacks'
import { LEGAL_CHECKOUT_DOC } from '@/types/legalDocuments'
import { LegalHtmlBody, LegalPageLayout } from '@/components/site/LegalPageLayout'

type Props = {
  slug: keyof typeof LEGAL_CHECKOUT_DOC
}

export function LegalCheckoutDocumentPage({ slug }: Props) {
  const cfg = LEGAL_CHECKOUT_DOC[slug]

  const { data, isLoading, isError } = useQuery({
    queryKey: ['legal-document', cfg.type],
    queryFn: () => legalDocumentsService.preview(cfg.type),
  })

  usePageMeta({
    title: cfg.seoTitle,
    description: cfg.seoDescription,
  })

  const title = data?.title?.trim() || cfg.title
  const html = resolveLegalDocumentHtml(cfg.type, data?.content)
  const showFallbackNote = isError || !data?.content?.trim()

  return (
    <LegalPageLayout title={title} subtitle={cfg.subtitle} updatedAt={data?.version ? `Sürüm ${data.version}` : undefined}>
      <p className="mb-6 text-sm text-slate-600">
        <Link to="/yazilimlar" className="font-medium text-brand-700 hover:underline">
          Yazılımlar
        </Link>
        <span className="mx-2 text-slate-300">·</span>
        <Link to="/" className="font-medium text-brand-700 hover:underline">
          Ana sayfa
        </Link>
      </p>

      {isLoading ? (
        <LoadingState label="Yasal metin yükleniyor…" />
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
