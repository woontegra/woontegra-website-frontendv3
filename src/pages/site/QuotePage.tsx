import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { Button } from '@/components/ui/Button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getApiRootUrl } from '@/utils/env'
import { pageContentService } from '@/services/api/pageContent'
import { defaultQuotePageContent, MARKETING_PAGE_KEYS } from '@/types/marketingPageContent'

const projectTypes = [
  { id: 'software', label: 'Yazılım Geliştirme', icon: '💻' },
  { id: 'web-design', label: 'Web Tasarım', icon: '🎨' },
  { id: 'ecommerce', label: 'E-Ticaret', icon: '🛒' },
  { id: 'saas', label: 'SaaS Ürün', icon: '☁️' },
  { id: 'trademark', label: 'Marka & Patent', icon: '📋' },
  { id: 'consulting', label: 'Danışmanlık', icon: '💡' },
  { id: 'game', label: 'Oyun Geliştirme', icon: '🎮' },
]

const budgetOptions = [
  { value: '10-50K', label: '10–50 bin ₺' },
  { value: '50-100K', label: '50–100 bin ₺' },
  { value: '100K+', label: '100 bin ₺ ve üzeri' },
]

const timelineOptions = [
  { value: 'urgent', label: 'Acil' },
  { value: '1-3-months', label: '1-3 Ay' },
  { value: 'flexible', label: 'Esnek' },
]

export function QuotePage() {
  const { data: page = defaultQuotePageContent } = useQuery({
    queryKey: ['page-content', MARKETING_PAGE_KEYS.quote],
    queryFn: () => pageContentService.getMarketingPage(MARKETING_PAGE_KEYS.quote, defaultQuotePageContent),
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    budget: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  usePageMeta({ title: page.seoTitle, description: page.seoDescription })

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (step === 1 && !formData.type) newErrors.type = 'Lütfen bir proje türü seçin'
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Proje açıklaması gerekli'
      if (!formData.budget) newErrors.budget = 'Bütçe aralığı seçin'
      if (!formData.timeline) newErrors.timeline = 'Zaman seçin'
    }
    if (step === 3) {
      if (!formData.name.trim()) newErrors.name = 'Ad Soyad gerekli'
      if (!formData.email.trim()) newErrors.email = 'E-posta gerekli'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Geçerli bir e-posta adresi girin'
      if (!formData.phone.trim()) newErrors.phone = 'Telefon gerekli'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setIsSubmitting(true)
    try {
      const apiRoot = getApiRootUrl()
      const response = await fetch(`${apiRoot}/api/mail/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Gönderilemedi')
      setSubmitted(true)
    } catch {
      setErrors({ submit: 'Teklif gönderilemedi. Lütfen tekrar deneyin veya iletişime geçin.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white">
        <PageHero
          eyebrow="Teklif"
          title="Talebiniz alındı"
          description="Ekibimiz en kısa sürede sizinle iletişime geçecektir."
          breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Teklif Al' }]}
        />
      </div>
    )
  }

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        description={page.heroDescription}
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Teklif Al' }]}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${currentStep >= step ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
          ))}
        </div>

        {currentStep === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: type.id }))}
                className={`rounded-xl border p-4 text-left transition-all ${formData.type === type.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="mt-2 font-semibold text-slate-900">{type.label}</p>
              </button>
            ))}
            {errors.type ? <p className="text-sm text-red-600 sm:col-span-2">{errors.type}</p> : null}
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4">
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={5}
              placeholder="Projenizi kısaca anlatın"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
            {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={formData.budget} onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))}>
              <option value="">Bütçe aralığı seçin</option>
              {budgetOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={formData.timeline} onChange={(e) => setFormData((p) => ({ ...p, timeline: e.target.value }))}>
              <option value="">Zaman planı seçin</option>
              {timelineOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Ad Soyad" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Şirket (opsiyonel)" value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} />
            {errors.submit ? <p className="text-sm text-red-600">{errors.submit}</p> : null}
          </div>
        ) : null}

        <div className="mt-8 flex justify-between">
          {currentStep > 1 ? (
            <Button type="button" variant="secondary" onClick={() => { setCurrentStep(currentStep - 1); setErrors({}) }}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
          ) : (
            <span />
          )}
          {currentStep < 3 ? (
            <Button type="button" onClick={() => validateStep(currentStep) && setCurrentStep(currentStep + 1)}>
              İleri <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? 'Gönderiliyor…' : 'Teklif Gönder'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
