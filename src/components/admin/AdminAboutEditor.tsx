import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { ABOUT_ICON_OPTIONS } from '@/components/site/about/aboutIcons'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ManagedImageField } from '@/components/admin/ManagedImageField'
import type { AboutPageContent, AboutSimpleCard, AboutTimelineStep, AboutIconCard, AboutBrandCard, AboutStatCard } from '@/types/aboutPageContent'

type TabId = 'hero' | 'whatIs' | 'timeline' | 'diff' | 'brands' | 'work' | 'structure' | 'vision' | 'cta' | 'seo'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'hero', label: 'Hero' },
  { id: 'whatIs', label: 'Woontegra Nedir' },
  { id: 'timeline', label: 'Nasıl Başladık' },
  { id: 'diff', label: 'Farklı Yapan' },
  { id: 'brands', label: 'Markalar' },
  { id: 'work', label: 'Çalışma Yaklaşımı' },
  { id: 'structure', label: 'Yapı' },
  { id: 'vision', label: 'Vizyon' },
  { id: 'cta', label: 'CTA' },
  { id: 'seo', label: 'SEO' },
]

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

function moveItem<T extends { order: number }>(items: T[], index: number, dir: -1 | 1): T[] {
  const swap = index + dir
  if (swap < 0 || swap >= items.length) return items
  const next = items.slice()
  const a = next[index]
  const b = next[swap]
  next[index] = { ...b, order: a.order }
  next[swap] = { ...a, order: b.order }
  return next.sort((x, y) => x.order - y.order).map((item, i) => ({ ...item, order: i }))
}

type Props = {
  value: AboutPageContent
  onChange: (value: AboutPageContent) => void
}

export function AdminAboutEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<TabId>('hero')
  const patch = (partial: Partial<AboutPageContent>) => onChange({ ...value, ...partial, version: 2 })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-4">
          {tab === 'hero' ? (
            <>
              <Input label="Etiket" value={value.hero.eyebrow} onChange={(e) => patch({ hero: { ...value.hero, eyebrow: e.target.value } })} />
              <Input label="Başlık" value={value.hero.title} onChange={(e) => patch({ hero: { ...value.hero, title: e.target.value } })} />
              <textarea className={fieldClass} rows={3} value={value.hero.subtitle} onChange={(e) => patch({ hero: { ...value.hero, subtitle: e.target.value } })} placeholder="Hero açıklama" />
              <ManagedImageField label="Hero görseli" value={value.hero.image} onChange={(image) => patch({ hero: { ...value.hero, image } })} />
            </>
          ) : null}

          {tab === 'whatIs' ? (
            <>
              <Input label="Bölüm başlığı" value={value.whatIs.title} onChange={(e) => patch({ whatIs: { ...value.whatIs, title: e.target.value } })} />
              {value.whatIs.paragraphs.map((p, i) => (
                <textarea key={i} className={fieldClass} rows={2} value={p} onChange={(e) => {
                  const paragraphs = [...value.whatIs.paragraphs]
                  paragraphs[i] = e.target.value
                  patch({ whatIs: { ...value.whatIs, paragraphs } })
                }} />
              ))}
              <textarea className={fieldClass} rows={2} value={value.whatIs.highlight} onChange={(e) => patch({ whatIs: { ...value.whatIs, highlight: e.target.value } })} placeholder="Vurgulu metin" />
              <SimpleCardsEditor
                cards={value.whatIs.cards}
                onChange={(cards) => patch({ whatIs: { ...value.whatIs, cards } })}
              />
            </>
          ) : null}

          {tab === 'timeline' ? (
            <>
              <Input label="Başlık" value={value.timeline.title} onChange={(e) => patch({ timeline: { ...value.timeline, title: e.target.value } })} />
              <Input label="Alt başlık" value={value.timeline.subtitle} onChange={(e) => patch({ timeline: { ...value.timeline, subtitle: e.target.value } })} />
              <TimelineEditor steps={value.timeline.steps} onChange={(steps) => patch({ timeline: { ...value.timeline, steps } })} />
            </>
          ) : null}

          {tab === 'diff' ? (
            <>
              <Input label="Başlık" value={value.differentiators.title} onChange={(e) => patch({ differentiators: { ...value.differentiators, title: e.target.value } })} />
              <Input label="Alt başlık" value={value.differentiators.subtitle} onChange={(e) => patch({ differentiators: { ...value.differentiators, subtitle: e.target.value } })} />
              <IconCardsEditor cards={value.differentiators.cards} onChange={(cards) => patch({ differentiators: { ...value.differentiators, cards } })} />
            </>
          ) : null}

          {tab === 'brands' ? (
            <>
              <Input label="Başlık" value={value.brands.title} onChange={(e) => patch({ brands: { ...value.brands, title: e.target.value } })} />
              <textarea className={fieldClass} rows={2} value={value.brands.subtitle} onChange={(e) => patch({ brands: { ...value.brands, subtitle: e.target.value } })} />
              <BrandsEditor cards={value.brands.cards} onChange={(cards) => patch({ brands: { ...value.brands, cards } })} />
            </>
          ) : null}

          {tab === 'work' ? (
            <>
              <Input label="Başlık" value={value.workApproach.title} onChange={(e) => patch({ workApproach: { ...value.workApproach, title: e.target.value } })} />
              <Input label="Alt başlık" value={value.workApproach.subtitle} onChange={(e) => patch({ workApproach: { ...value.workApproach, subtitle: e.target.value } })} />
              <IconCardsEditor cards={value.workApproach.cards} onChange={(cards) => patch({ workApproach: { ...value.workApproach, cards } })} />
            </>
          ) : null}

          {tab === 'structure' ? (
            <>
              <Input label="Başlık" value={value.structure.title} onChange={(e) => patch({ structure: { ...value.structure, title: e.target.value } })} />
              {value.structure.paragraphs.map((p, i) => (
                <textarea key={i} className={fieldClass} rows={2} value={p} onChange={(e) => {
                  const paragraphs = [...value.structure.paragraphs]
                  paragraphs[i] = e.target.value
                  patch({ structure: { ...value.structure, paragraphs } })
                }} />
              ))}
              <StatsEditor stats={value.structure.stats} onChange={(stats) => patch({ structure: { ...value.structure, stats } })} />
            </>
          ) : null}

          {tab === 'vision' ? (
            <>
              <Input label="Başlık" value={value.vision.title} onChange={(e) => patch({ vision: { ...value.vision, title: e.target.value } })} />
              {value.vision.paragraphs.map((p, i) => (
                <textarea key={i} className={fieldClass} rows={2} value={p} onChange={(e) => {
                  const paragraphs = [...value.vision.paragraphs]
                  paragraphs[i] = e.target.value
                  patch({ vision: { ...value.vision, paragraphs } })
                }} />
              ))}
            </>
          ) : null}

          {tab === 'cta' ? (
            <>
              <Input label="Başlık" value={value.cta.title} onChange={(e) => patch({ cta: { ...value.cta, title: e.target.value } })} />
              <textarea className={fieldClass} rows={2} value={value.cta.subtitle} onChange={(e) => patch({ cta: { ...value.cta, subtitle: e.target.value } })} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Buton metni" value={value.cta.buttonText} onChange={(e) => patch({ cta: { ...value.cta, buttonText: e.target.value } })} />
                <Input label="Buton linki" value={value.cta.buttonHref} onChange={(e) => patch({ cta: { ...value.cta, buttonHref: e.target.value } })} />
              </div>
            </>
          ) : null}

          {tab === 'seo' ? (
            <textarea className={fieldClass} rows={3} value={value.metaDescription ?? ''} onChange={(e) => patch({ metaDescription: e.target.value })} placeholder="Meta description" />
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

function CardActions({ index, total, onMove, onRemove }: { index: number; total: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1">
      <Button type="button" variant="secondary" size="sm" disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp className="h-3.5 w-3.5" /></Button>
      <Button type="button" variant="secondary" size="sm" disabled={index === total - 1} onClick={() => onMove(1)}><ChevronDown className="h-3.5 w-3.5" /></Button>
      <Button type="button" variant="secondary" size="sm" onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

function SimpleCardsEditor({ cards, onChange }: { cards: AboutSimpleCard[]; onChange: (c: AboutSimpleCard[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold">Kartlar</h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...cards, { id: crypto.randomUUID(), title: 'Yeni kart', text: '', order: cards.length, enabled: true }])}><Plus className="h-3.5 w-3.5" /> Ekle</Button>
      </div>
      {cards.map((card, index) => (
        <div key={card.id} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.enabled} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, enabled: e.target.checked } : c)))} /> Aktif</label>
            <CardActions index={index} total={cards.length} onMove={(d) => onChange(moveItem(cards, index, d))} onRemove={() => onChange(cards.filter((c) => c.id !== card.id))} />
          </div>
          <Input label="Başlık" value={card.title} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, title: e.target.value } : c)))} />
          <textarea className={`${fieldClass} mt-2`} rows={2} value={card.text} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, text: e.target.value } : c)))} />
        </div>
      ))}
    </div>
  )
}

function IconCardsEditor({ cards, onChange }: { cards: AboutIconCard[]; onChange: (c: AboutIconCard[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold">Kartlar</h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...cards, { id: crypto.randomUUID(), icon: 'sparkles', title: 'Yeni', text: '', gradient: 'from-blue-500 to-cyan-500', order: cards.length, enabled: true }])}><Plus className="h-3.5 w-3.5" /> Ekle</Button>
      </div>
      {cards.map((card, index) => (
        <div key={card.id} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.enabled} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, enabled: e.target.checked } : c)))} /> Aktif</label>
            <CardActions index={index} total={cards.length} onMove={(d) => onChange(moveItem(cards, index, d))} onRemove={() => onChange(cards.filter((c) => c.id !== card.id))} />
          </div>
          <Input label="Başlık" value={card.title} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, title: e.target.value } : c)))} />
          <select className={`${fieldClass} mt-2`} value={card.icon} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, icon: e.target.value } : c)))}>{ABOUT_ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <textarea className={`${fieldClass} mt-2`} rows={2} value={card.text} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, text: e.target.value } : c)))} />
        </div>
      ))}
    </div>
  )
}

function TimelineEditor({ steps, onChange }: { steps: AboutTimelineStep[]; onChange: (s: AboutTimelineStep[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold">Adımlar</h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...steps, { id: crypto.randomUUID(), icon: 'eye', title: 'Yeni adım', text: '', color: 'bg-blue-500', order: steps.length, enabled: true }])}><Plus className="h-3.5 w-3.5" /> Ekle</Button>
      </div>
      {steps.map((step, index) => (
        <div key={step.id} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={step.enabled} onChange={(e) => onChange(steps.map((s) => (s.id === step.id ? { ...s, enabled: e.target.checked } : s)))} /> Aktif</label>
            <CardActions index={index} total={steps.length} onMove={(d) => onChange(moveItem(steps, index, d))} onRemove={() => onChange(steps.filter((s) => s.id !== step.id))} />
          </div>
          <Input label="Başlık" value={step.title} onChange={(e) => onChange(steps.map((s) => (s.id === step.id ? { ...s, title: e.target.value } : s)))} />
          <textarea className={`${fieldClass} mt-2`} rows={2} value={step.text} onChange={(e) => onChange(steps.map((s) => (s.id === step.id ? { ...s, text: e.target.value } : s)))} />
        </div>
      ))}
    </div>
  )
}

function BrandsEditor({ cards, onChange }: { cards: AboutBrandCard[]; onChange: (c: AboutBrandCard[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold">Markalar</h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...cards, { id: crypto.randomUUID(), name: 'Yeni marka', text: '', image: '/images/brand-bilirkisi.jpg', url: 'https://', order: cards.length, enabled: true }])}><Plus className="h-3.5 w-3.5" /> Ekle</Button>
      </div>
      {cards.map((card, index) => (
        <div key={card.id} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.enabled} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, enabled: e.target.checked } : c)))} /> Aktif</label>
            <CardActions index={index} total={cards.length} onMove={(d) => onChange(moveItem(cards, index, d))} onRemove={() => onChange(cards.filter((c) => c.id !== card.id))} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Marka adı" value={card.name} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, name: e.target.value } : c)))} />
            <Input label="Görsel URL" value={card.image} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, image: e.target.value } : c)))} />
            <Input label="Site URL" value={card.url} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, url: e.target.value } : c)))} />
          </div>
          <textarea className={`${fieldClass} mt-2`} rows={2} value={card.text} onChange={(e) => onChange(cards.map((c) => (c.id === card.id ? { ...c, text: e.target.value } : c)))} />
        </div>
      ))}
    </div>
  )
}

function StatsEditor({ stats, onChange }: { stats: AboutStatCard[]; onChange: (s: AboutStatCard[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold">İstatistik kartları</h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...stats, { id: crypto.randomUUID(), icon: 'target', title: 'Yeni', text: '', order: stats.length, enabled: true }])}><Plus className="h-3.5 w-3.5" /> Ekle</Button>
      </div>
      {stats.map((stat, index) => (
        <div key={stat.id} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 flex justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={stat.enabled} onChange={(e) => onChange(stats.map((s) => (s.id === stat.id ? { ...s, enabled: e.target.checked } : s)))} /> Aktif</label>
            <CardActions index={index} total={stats.length} onMove={(d) => onChange(moveItem(stats, index, d))} onRemove={() => onChange(stats.filter((s) => s.id !== stat.id))} />
          </div>
          <Input label="Başlık" value={stat.title} onChange={(e) => onChange(stats.map((s) => (s.id === stat.id ? { ...s, title: e.target.value } : s)))} />
          <textarea className={`${fieldClass} mt-2`} rows={2} value={stat.text} onChange={(e) => onChange(stats.map((s) => (s.id === stat.id ? { ...s, text: e.target.value } : s)))} />
        </div>
      ))}
    </div>
  )
}
