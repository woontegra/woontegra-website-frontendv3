import type { ReactNode } from 'react'
import type { ServiceDetailContent } from '@/data/serviceDetailContent'
import { Input } from '@/components/ui/Input'

type Props = {
  form: ServiceDetailContent
  onChange: (next: ServiceDetailContent) => void
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white" open>
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">{title}</summary>
      <div className="space-y-4 border-t border-slate-100 px-4 py-4">{children}</div>
    </details>
  )
}

export function AdminServiceContentSections({ form, onChange }: Props) {
  const patch = (partial: Partial<ServiceDetailContent>) => onChange({ ...form, ...partial })

  return (
    <div className="space-y-4">
      <SectionCard title="Sorunlar bölümü">
        <Input
          label="Başlık"
          value={form.problems.title}
          onChange={(e) => patch({ problems: { ...form.problems, title: e.target.value } })}
        />
        <Input
          label="Alt başlık"
          value={form.problems.subtitle}
          onChange={(e) => patch({ problems: { ...form.problems, subtitle: e.target.value } })}
        />
      </SectionCard>

      <SectionCard title="Yaklaşım bölümü">
        <Input
          label="Başlık"
          value={form.approach.title}
          onChange={(e) => patch({ approach: { ...form.approach, title: e.target.value } })}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Açıklama</label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.approach.description}
            onChange={(e) => patch({ approach: { ...form.approach, description: e.target.value } })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Madde işaretleri (her satır bir madde)</label>
          <textarea
            className="min-h-[96px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.approach.bullets.join('\n')}
            onChange={(e) =>
              patch({
                approach: {
                  ...form.approach,
                  bullets: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Kapsam bölümü">
        <Input
          label="Başlık"
          value={form.scope.title}
          onChange={(e) => patch({ scope: { ...form.scope, title: e.target.value } })}
        />
        <Input
          label="Alt başlık"
          value={form.scope.subtitle}
          onChange={(e) => patch({ scope: { ...form.scope, subtitle: e.target.value } })}
        />
      </SectionCard>

      <SectionCard title="Süreç bölümü">
        <Input
          label="Başlık"
          value={form.process.title}
          onChange={(e) => patch({ process: { ...form.process, title: e.target.value } })}
        />
        <Input
          label="Alt başlık"
          value={form.process.subtitle}
          onChange={(e) => patch({ process: { ...form.process, subtitle: e.target.value } })}
        />
      </SectionCard>

      <SectionCard title="Neden biz bölümü">
        <Input
          label="Başlık"
          value={form.whyUs.title}
          onChange={(e) => patch({ whyUs: { ...form.whyUs, title: e.target.value } })}
        />
      </SectionCard>

      <SectionCard title="Teknoloji bölümü">
        <Input
          label="Başlık"
          value={form.technology.title}
          onChange={(e) => patch({ technology: { ...form.technology, title: e.target.value } })}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Açıklama</label>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.technology.description}
            onChange={(e) => patch({ technology: { ...form.technology, description: e.target.value } })}
          />
        </div>
      </SectionCard>

      <SectionCard title="CTA bölümü">
        <Input label="Başlık" value={form.cta.title} onChange={(e) => patch({ cta: { ...form.cta, title: e.target.value } })} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Açıklama</label>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.cta.description}
            onChange={(e) => patch({ cta: { ...form.cta, description: e.target.value } })}
          />
        </div>
        <Input
          label="Buton metni"
          value={form.cta.buttonText}
          onChange={(e) => patch({ cta: { ...form.cta, buttonText: e.target.value } })}
        />
        <Input
          label="Buton linki"
          value={form.cta.buttonTo}
          onChange={(e) => patch({ cta: { ...form.cta, buttonTo: e.target.value } })}
        />
      </SectionCard>
    </div>
  )
}
