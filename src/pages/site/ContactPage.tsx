import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { ContactForm } from '@/components/site/ContactForm'
import { Card, CardBody } from '@/components/ui/Card'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { pageContentService } from '@/services/api/pageContent'
import { getErrorMessage } from '@/services/api/client'
import { defaultContactContent } from '@/types/pageContent'

export function ContactPage() {
  const [params] = useSearchParams()
  const subject = params.get('konu')?.trim() ?? ''

  const { data: settings } = usePublicSiteSettings()
  const { data, isError, error } = useQuery({
    queryKey: ['page-content', 'contact'],
    queryFn: () => pageContentService.getContact(),
    placeholderData: defaultContactContent,
    ...publicQueryOptions,
  })

  const content = { ...defaultContactContent, ...data }

  const email = settings?.contactEmail?.trim() || content.email?.trim()
  const phone = settings?.contactPhone?.trim() || content.phone?.trim()
  const address = settings?.contactAddress?.trim() || content.address?.trim()

  usePageMeta({
    title: 'İletişim',
    description: content.heroSubtitle || 'Woontegra ile iletişime geçin.',
  })

  const contactCards = useMemo(
    () =>
      [
        email
          ? { icon: Mail, label: 'E-posta', value: email, href: `mailto:${email}` }
          : null,
        phone
          ? { icon: Phone, label: 'Telefon', value: phone, href: `tel:${phone.replace(/\s/g, '')}` }
          : null,
        address
          ? { icon: MapPin, label: 'Adres', value: address, href: null as string | null }
          : null,
        content.whatsApp?.trim()
          ? {
              icon: MessageCircle,
              label: 'WhatsApp',
              value: content.whatsApp.trim(),
              href: `https://wa.me/${content.whatsApp.replace(/\D/g, '')}`,
            }
          : null,
      ].filter(Boolean),
    [email, phone, address, content.whatsApp],
  )

  return (
    <div>
      <PageHero
        eyebrow="İletişim"
        title={content.heroTitle || defaultContactContent.heroTitle!}
        description={
          content.heroSubtitle ||
          'Yazılım, lisans ve kurumsal proje talepleriniz için ekibimiz size en kısa sürede dönüş yapar.'
        }
        image={content.heroImage || defaultContactContent.heroImage}
        imageAlt="Woontegra iletişim"
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'İletişim' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {isError ? (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardBody>
              <p className="text-sm text-amber-900">{getErrorMessage(error, 'İçerik yüklenemedi')}</p>
            </CardBody>
          </Card>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {contactCards.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {contactCards.map((card) => {
                  const Icon = card!.icon
                  const inner = (
                    <Card className="h-full">
                      <CardBody className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card!.label}</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{card!.value}</p>
                        </div>
                      </CardBody>
                    </Card>
                  )
                  return card!.href ? (
                    <a key={card!.label} href={card!.href} className="block transition hover:opacity-90">
                      {inner}
                    </a>
                  ) : (
                    <div key={card!.label}>{inner}</div>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardBody className="text-sm text-slate-600">
                  İletişim bilgileri site ayarlarından veya bu sayfanın admin içeriğinden yönetilir.
                </CardBody>
              </Card>
            )}

            {content.mapEmbedUrl?.trim() ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  title="Harita"
                  src={content.mapEmbedUrl.trim()}
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </div>

          <Card className="lg:col-span-3">
            <CardBody className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {content.formTitle || 'Bize yazın'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Mesajınız ekibimize iletilir; en kısa sürede dönüş yapılır.</p>
              </div>
              <ContactForm defaultSubject={subject} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
