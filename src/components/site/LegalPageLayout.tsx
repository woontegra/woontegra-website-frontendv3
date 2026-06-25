import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  updatedAt?: string
  children: ReactNode
}

export function LegalPageLayout({ title, subtitle, updatedAt, children }: Props) {
  return (
    <article className="border-b border-slate-200 bg-white">
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-base leading-relaxed text-slate-600">{subtitle}</p> : null}
          {updatedAt ? <p className="mt-2 text-xs text-slate-500">Son güncelleme: {updatedAt}</p> : null}
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</div>
    </article>
  )
}

const legalProse =
  'legal-prose prose prose-slate max-w-none text-slate-800 prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-brand-700 [&_.legal-doc_h2]:mt-6 [&_.legal-doc_h2]:text-xl'

export function LegalHtmlBody({ html }: { html: string }) {
  return <div className={legalProse} dangerouslySetInnerHTML={{ __html: html }} />
}

export function LegalSectionsBody({
  sections,
}: {
  sections: { title: string; body: string; listItems?: string[] }[]
}) {
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.title}>
          {s.title ? <h2 className="text-xl font-semibold text-slate-900">{s.title}</h2> : null}
          {s.body ? <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{s.body}</p> : null}
          {s.listItems && s.listItems.length > 0 ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {s.listItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}
