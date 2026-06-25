import { Link } from 'react-router-dom'
import { Download, Shield } from 'lucide-react'
import { PageHero } from '@/components/site/PageHero'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getApiRootUrl } from '@/utils/env'

const DEFAULT_SCREENSHOT = '/images/woontegra-sifre-kasasi-ekran.png'

export function SifreKasasiPage() {
  usePageMeta({
    title: 'Woontegra Şifre Kasası | Ücretsiz Araç',
    description: 'Giriş bilgilerinizi yerel ve şifreli şekilde saklayan ücretsiz Windows masaüstü uygulaması.',
  })

  const apiRoot = getApiRootUrl()
  const setupUrl = `${apiRoot}/api/public/downloads/sifre-kasasi/setup`
  const portableUrl = `${apiRoot}/api/public/downloads/sifre-kasasi/portable`

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Ücretsiz Araç"
        title="Woontegra Şifre Kasası"
        description="Giriş bilgilerinizi cihazınızda yerel ve şifreli şekilde saklayın. Woontegra sunucularına aktarılmaz."
        image={DEFAULT_SCREENSHOT}
        imageAlt="Woontegra Şifre Kasası ekran görüntüsü"
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Ücretsiz Araçlar', href: '/ucretsiz-araclar' },
          { label: 'Şifre Kasası' },
        ]}
        highlights={[
          { icon: Shield, title: 'Veriler cihazınızda kalır' },
          { icon: Download, title: 'Kurulum ve taşınabilir sürüm' },
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={setupUrl}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Kurulum dosyasını indir
          </a>
          <a
            href={portableUrl}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Taşınabilir sürüm
          </a>
        </div>
      </PageHero>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-base leading-relaxed text-slate-600">
            Woontegra Şifre Kasası, avukatlık ve işletme ekipleri için geliştirilmiş ücretsiz bir Windows masaüstü
            uygulamasıdır. Detaylı içerik yönetimi admin paneldeki Ücretsiz Araçlar bölümünden yapılabilir.
          </p>
          <Link to="/ucretsiz-araclar" className="mt-6 inline-block text-sm font-medium text-emerald-700 hover:underline">
            ← Tüm ücretsiz araçlar
          </Link>
        </div>
      </section>
    </div>
  )
}
