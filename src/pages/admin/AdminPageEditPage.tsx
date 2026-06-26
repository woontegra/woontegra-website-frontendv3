import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AdminAboutEditor } from '@/components/admin/AdminAboutEditor'
import { AdminMarketingPageEditor } from '@/components/admin/AdminMarketingPageEditor'
import { AdminLegalPageEditor, type AdminLegalPageEditorHandle } from '@/components/admin/AdminLegalPageEditor'
import { AdminPageEditorShell } from '@/components/admin/AdminPageEditorShell'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { getSitePageByKey } from '@/data/sitePages'
import { getErrorMessage } from '@/services/api/client'
import { pageContentService } from '@/services/api/pageContent'
import { LEGAL_PAGE_DEFINITIONS } from '@/types/legalPageContent'
import { ManagedImageField } from '@/components/admin/ManagedImageField'
import {
  defaultQuotePageContent,
  defaultServicesPageContent,
  defaultSolutionsPageContent,
  defaultToolsPageContent,
  MARKETING_PAGE_KEYS,
  type MarketingPageContent,
} from '@/types/marketingPageContent'
import {
  defaultAboutPageContent,
  defaultContactContent,
  PAGE_CONTENT_KEYS,
  type AboutPageContent,
  type ContactPageContent,
} from '@/types/pageContent'
import { defaultFaqPageContent, type FaqPageContent } from '@/types/faqPageContent'

function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 3,
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

export function AdminPageEditPage() {
  const { key = '' } = useParams()
  const queryClient = useQueryClient()
  const legalEditorRef = useRef<AdminLegalPageEditorHandle>(null)
  const sitePage = getSitePageByKey(key)
  const legalDef = LEGAL_PAGE_DEFINITIONS.find((d) => d.key === key)

  const [about, setAbout] = useState<AboutPageContent>(defaultAboutPageContent)
  const [contact, setContact] = useState<ContactPageContent>(defaultContactContent)
  const [marketing, setMarketing] = useState<MarketingPageContent>(defaultServicesPageContent)
  const [faq, setFaq] = useState<FaqPageContent>(defaultFaqPageContent)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const aboutQuery = useQuery({
    queryKey: ['page-content', 'about'],
    queryFn: () => pageContentService.getAbout(),
    enabled: key === PAGE_CONTENT_KEYS.about,
  })

  const contactQuery = useQuery({
    queryKey: ['page-content', 'contact'],
    queryFn: () => pageContentService.getContact(),
    enabled: key === PAGE_CONTENT_KEYS.contact,
  })

  const marketingDefaults: Record<string, MarketingPageContent> = {
    [MARKETING_PAGE_KEYS.services]: defaultServicesPageContent,
    [MARKETING_PAGE_KEYS.solutions]: defaultSolutionsPageContent,
    [MARKETING_PAGE_KEYS.quote]: defaultQuotePageContent,
    [MARKETING_PAGE_KEYS.tools]: defaultToolsPageContent,
  }
  const isMarketingKey = key in marketingDefaults

  const marketingQuery = useQuery({
    queryKey: ['page-content', key],
    queryFn: () => pageContentService.getMarketingPage(key, marketingDefaults[key]),
    enabled: isMarketingKey,
  })

  const faqQuery = useQuery({
    queryKey: ['page-content', MARKETING_PAGE_KEYS.faq],
    queryFn: () => pageContentService.getFaqPage(),
    enabled: key === MARKETING_PAGE_KEYS.faq,
  })

  useEffect(() => {
    if (aboutQuery.data) setAbout(aboutQuery.data)
  }, [aboutQuery.data])

  useEffect(() => {
    if (contactQuery.data) setContact({ ...defaultContactContent, ...contactQuery.data })
  }, [contactQuery.data])

  useEffect(() => {
    if (marketingQuery.data) setMarketing(marketingQuery.data)
  }, [marketingQuery.data])

  useEffect(() => {
    if (faqQuery.data) setFaq(faqQuery.data)
  }, [faqQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (key === PAGE_CONTENT_KEYS.about) return pageContentService.updateAbout(about)
      if (key === PAGE_CONTENT_KEYS.contact) return pageContentService.updateContact(contact)
      if (isMarketingKey) return pageContentService.updateMarketingPage(key, marketing, marketingDefaults[key])
      if (key === MARKETING_PAGE_KEYS.faq) return pageContentService.updateFaqPage(faq)
      if (legalDef) {
        const ok = await legalEditorRef.current?.save()
        if (!ok) throw new Error('Kayıt başarısız')
        return null
      }
      throw new Error('Geçersiz sayfa')
    },
    onSuccess: () => {
      setMessage('Kaydedildi')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['page-content'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'site-pages'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (!sitePage) return <Navigate to="/admin/sayfalar" replace />

  const loading =
    (key === PAGE_CONTENT_KEYS.about && aboutQuery.isLoading) ||
    (key === PAGE_CONTENT_KEYS.contact && contactQuery.isLoading) ||
    (isMarketingKey && marketingQuery.isLoading) ||
    (key === MARKETING_PAGE_KEYS.faq && faqQuery.isLoading)

  return (
    <AdminPageEditorShell
      title={sitePage.title}
      subtitle={`${sitePage.pageTypeLabel} · ${sitePage.path}`}
      publicPath={sitePage.path}
      statusMessage={message}
      errorMessage={error}
      saving={saveMutation.isPending || legalEditorRef.current?.saving}
      onSave={() => void saveMutation.mutateAsync()}
      technicalDetails={[
        { label: 'Key', value: sitePage.key },
        { label: 'API', value: `PUT /api/page-content/${sitePage.key}` },
        { label: 'Public route', value: sitePage.path },
      ]}
    >
      {loading ? <LoadingState label="Yükleniyor…" /> : null}

      {!loading && key === PAGE_CONTENT_KEYS.about ? <AdminAboutEditor value={about} onChange={setAbout} /> : null}

      {!loading && key === PAGE_CONTENT_KEYS.contact ? (
        <>
          <Card className="border-amber-200 bg-amber-50">
            <CardBody className="text-sm text-amber-900">
              Genel iletişim bilgileri (e-posta, telefon, adres) Site Ayarları bölümünden de kullanılır. Public
              sayfada site ayarı doluysa o değer önceliklidir.
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Sayfa Ayarları</h2>
              <Input
                label="Hero başlık"
                value={contact.heroTitle ?? ''}
                onChange={(e) => setContact((p) => ({ ...p, heroTitle: e.target.value }))}
              />
              <TextArea
                label="Hero alt başlık"
                value={contact.heroSubtitle ?? ''}
                onChange={(v) => setContact((p) => ({ ...p, heroSubtitle: v }))}
              />
              <ManagedImageField
                label="Hero görseli"
                sizeSpec="pageHero"
                value={contact.heroImage ?? ''}
                onChange={(heroImage) => setContact((p) => ({ ...p, heroImage }))}
              />
              <Input label="Form başlığı" value={contact.formTitle ?? ''} onChange={(e) => setContact((p) => ({ ...p, formTitle: e.target.value }))} />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">İletişim bilgileri</h2>
              <Input label="E-posta" value={contact.email ?? ''} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} />
              <Input label="Telefon" value={contact.phone ?? ''} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} />
              <TextArea label="Adres" value={contact.address ?? ''} onChange={(v) => setContact((p) => ({ ...p, address: v }))} />
              <div className="space-y-1.5">
                <Input
                  label="WhatsApp (opsiyonel)"
                  value={contact.whatsApp ?? ''}
                  onChange={(e) => setContact((p) => ({ ...p, whatsApp: e.target.value }))}
                />
                <p className="text-xs text-slate-500">Örn. 905321234567 — boş bırakılırsa gösterilmez.</p>
              </div>
              <TextArea
                label="Harita embed URL (opsiyonel)"
                hint="Google Maps embed src URL'si. Boş bırakılırsa harita gösterilmez."
                value={contact.mapEmbedUrl ?? ''}
                onChange={(v) => setContact((p) => ({ ...p, mapEmbedUrl: v }))}
                rows={2}
              />
            </CardBody>
          </Card>
        </>
      ) : null}

      {!loading && isMarketingKey ? (
        <AdminMarketingPageEditor
          value={marketing}
          onChange={setMarketing}
          showHeroImage={key !== MARKETING_PAGE_KEYS.quote}
        />
      ) : null}

      {!loading && key === MARKETING_PAGE_KEYS.faq ? (
        <div className="space-y-6">
          <AdminMarketingPageEditor
            value={{
              enabled: true,
              heroEyebrow: faq.heroEyebrow,
              heroTitle: faq.heroTitle,
              heroDescription: faq.heroDescription,
              heroImage: faq.heroImage,
              highlight1: 'Hızlı yanıtlar',
              highlight2: 'Kategori bazlı düzen',
              sectionEyebrow: '',
              sectionTitle: '',
              sectionDescription: '',
              ctaTitle: faq.ctaTitle,
              ctaDescription: faq.ctaDescription,
              ctaButtonText: faq.ctaButtonText,
              ctaButtonLink: faq.ctaButtonLink,
              ctaSecondaryButtonText: '',
              ctaSecondaryButtonLink: '',
              seoTitle: faq.seoTitle,
              seoDescription: faq.seoDescription,
            }}
            onChange={(m) =>
              setFaq((p: FaqPageContent) => ({
                ...p,
                heroEyebrow: m.heroEyebrow,
                heroTitle: m.heroTitle,
                heroDescription: m.heroDescription,
                heroImage: m.heroImage,
                ctaTitle: m.ctaTitle,
                ctaDescription: m.ctaDescription,
                ctaButtonText: m.ctaButtonText,
                ctaButtonLink: m.ctaButtonLink,
                seoTitle: m.seoTitle,
                seoDescription: m.seoDescription,
              }))
            }
          />
        </div>
      ) : null}

      {!loading && legalDef ? (
        <AdminLegalPageEditor
          key={legalDef.key}
          ref={legalEditorRef}
          definition={legalDef}
          embedded
          onMessage={(msg) => {
            if (msg?.type === 'success') setMessage(msg.text)
            if (msg?.type === 'error') setError(msg.text)
          }}
        />
      ) : null}
    </AdminPageEditorShell>
  )
}
