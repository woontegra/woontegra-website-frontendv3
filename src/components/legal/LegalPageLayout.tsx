import { useEffect, type ReactNode } from 'react'
import { PageHero } from '@/components/site/PageHero'
import { LAYOUT_CONTAINER_CLASS } from '@/lib/layoutConstants'
import { formatLegalDate } from '@/data/legalCompanyInfo'

export type LegalTocItem = {
  id: string
  label: string
}

type LegalPageLayoutProps = {
  title: string
  subtitle: string
  seoTitle: string
  seoDescription: string
  updatedAt?: string
  toc?: LegalTocItem[]
  children: ReactNode
}

export function LegalPageLayout({
  title,
  subtitle,
  seoTitle,
  seoDescription,
  updatedAt,
  toc = [],
  children,
}: LegalPageLayoutProps) {
  useEffect(() => {
    document.title = seoTitle
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', seoDescription)
  }, [seoTitle, seoDescription])

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Yasal Bilgilendirme"
        title={title}
        description={subtitle}
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: title }]}
      >
        {updatedAt ? (
          <p className="mt-4 text-sm text-slate-400">Son güncelleme: {formatLegalDate(updatedAt)}</p>
        ) : null}
      </PageHero>

      <section className="py-12 md:py-16">
        <div className={`${LAYOUT_CONTAINER_CLASS} ${toc.length > 0 ? 'max-w-6xl' : 'max-w-4xl'}`}>
          <div className={toc.length > 0 ? 'grid gap-10 lg:grid-cols-[220px_1fr]' : ''}>
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <nav className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">İçindekiler</p>
                  <ul className="space-y-1">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-emerald-700"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
            <div className="legal-prose min-w-0">{children}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function LegalSection({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: ReactNode
}) {
  const sectionId = id ?? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <section id={sectionId} className="mb-10 scroll-mt-28">
      <h2 className="section-title text-2xl md:text-3xl">{title}</h2>
      <div className="body-text mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
