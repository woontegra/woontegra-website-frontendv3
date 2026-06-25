import { useEffect, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { HOME_ICON_OPTIONS } from '@/components/site/home/homeIcons'
import { getErrorMessage } from '@/services/api/client'
import { pageContentService } from '@/services/api/pageContent'
import {
  defaultHomePageContent,
  type HomeBrandCard,
  type HomeIntroCard,
  type HomePageContent,
  type HomeProcessStep,
  type HomeServiceCard,
  type HomeWhyCard,
} from '@/types/homePageContent'

type TabId = 'hero' | 'intro' | 'services' | 'brands' | 'why' | 'process' | 'cta'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'hero', label: 'Hero' },
  { id: 'intro', label: 'Giriş metni' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'brands', label: 'Markalar' },
  { id: 'why', label: 'Neden Woontegra' },
  { id: 'process', label: 'Süreç' },
  { id: 'cta', label: 'CTA' },
]

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const GRADIENT_OPTIONS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-yellow-500 to-orange-500',
  'from-teal-500 to-green-500',
]

const WHY_COLOR_OPTIONS = [
  'bg-gradient-to-br from-yellow-500 to-orange-500',
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-green-500 to-emerald-500',
  'bg-gradient-to-br from-red-500 to-pink-500',
  'bg-gradient-to-br from-teal-500 to-green-500',
]

function SectionToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
      Bölüm aktif
    </label>
  )
}

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

function normalizeIntroCards(cards: HomeIntroCard[]): HomeIntroCard[] {
  return cards
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((c, i) => ({ ...c, order: i }))
}

export function AdminHomePage() {
  const [tab, setTab] = useState<TabId>('hero')
  const [content, setContent] = useState<HomePageContent>(defaultHomePageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void pageContentService
      .getHome()
      .then(setContent)
      .catch((err) => setError(getErrorMessage(err, 'Ana sayfa yüklenemedi')))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const saved = await pageContentService.updateHome(content)
      setContent(saved)
      setMessage('Ana sayfa kaydedildi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt başarısız'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Ana sayfa yükleniyor…" />

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Ana Sayfa Yönetimi"
        description="Kurumsal ana sayfa bölümlerini düzenleyin."
        actions={
          <Button onClick={() => void save()} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

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
              <SectionToggle enabled={content.hero.enabled} onChange={(enabled) => setContent((c) => ({ ...c, hero: { ...c.hero, enabled } }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Etiket" value={content.hero.tag} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, tag: e.target.value } }))} />
                <Input label="Hero görseli" value={content.hero.image} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, image: e.target.value } }))} />
              </div>
              <Input label="Başlık" value={content.hero.title} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, title: e.target.value } }))} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                <textarea className={fieldClass} rows={3} value={content.hero.subtitle} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Birinci buton" value={content.hero.button1Text} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, button1Text: e.target.value } }))} />
                <Input label="Birinci buton linki" value={content.hero.button1Href} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, button1Href: e.target.value } }))} />
                <Input label="İkinci buton" value={content.hero.button2Text} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, button2Text: e.target.value } }))} />
                <Input label="İkinci buton linki" value={content.hero.button2Href} onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, button2Href: e.target.value } }))} />
              </div>
            </>
          ) : null}

          {tab === 'intro' ? (
            <>
              <SectionToggle enabled={content.intro.enabled} onChange={(enabled) => setContent((c) => ({ ...c, intro: { ...c.intro, enabled } }))} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Üst küçük metin</label>
                <textarea
                  className={fieldClass}
                  rows={2}
                  value={content.intro.eyebrow}
                  onChange={(e) => setContent((c) => ({ ...c, intro: { ...c.intro, eyebrow: e.target.value } }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Ana vurgu</label>
                <textarea
                  className={fieldClass}
                  rows={3}
                  value={content.intro.title}
                  onChange={(e) => setContent((c) => ({ ...c, intro: { ...c.intro, title: e.target.value } }))}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-semibold text-slate-900">Vurgu kartları</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      intro: {
                        ...c.intro,
                        cards: normalizeIntroCards([
                          ...c.intro.cards,
                          {
                            id: crypto.randomUUID(),
                            title: 'Yeni kart',
                            description: '',
                            icon: String(c.intro.cards.length + 1).padStart(2, '0'),
                            order: c.intro.cards.length,
                            enabled: true,
                          },
                        ]),
                      },
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Ekle
                </Button>
              </div>

              <div className="space-y-3">
                {content.intro.cards
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((card, index) => (
                    <div key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={card.enabled}
                              onChange={(e) =>
                                setContent((c) => ({
                                  ...c,
                                  intro: {
                                    ...c.intro,
                                    cards: c.intro.cards.map((x) => (x.id === card.id ? { ...x, enabled: e.target.checked } : x)),
                                  },
                                }))
                              }
                            />
                            Aktif
                          </label>
                          <span className="text-xs text-slate-400">#{index + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setContent((c) => ({
                                ...c,
                                intro: { ...c.intro, cards: moveItem(c.intro.cards, index, -1) },
                              }))
                            }
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setContent((c) => ({
                                ...c,
                                intro: { ...c.intro, cards: moveItem(c.intro.cards, index, 1) },
                              }))
                            }
                            disabled={index === content.intro.cards.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setContent((c) => ({
                                ...c,
                                intro: { ...c.intro, cards: c.intro.cards.filter((x) => x.id !== card.id).map((x, i) => ({ ...x, order: i })) },
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-[160px_1fr]">
                        <Input
                          label="İkon / numara"
                          value={card.icon ?? ''}
                          onChange={(e) =>
                            setContent((c) => ({
                              ...c,
                              intro: { ...c.intro, cards: c.intro.cards.map((x) => (x.id === card.id ? { ...x, icon: e.target.value } : x)) },
                            }))
                          }
                        />
                        <Input
                          label="Başlık"
                          value={card.title}
                          onChange={(e) =>
                            setContent((c) => ({
                              ...c,
                              intro: { ...c.intro, cards: c.intro.cards.map((x) => (x.id === card.id ? { ...x, title: e.target.value } : x)) },
                            }))
                          }
                        />
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                        <textarea
                          className={fieldClass}
                          rows={2}
                          value={card.description}
                          onChange={(e) =>
                            setContent((c) => ({
                              ...c,
                              intro: { ...c.intro, cards: c.intro.cards.map((x) => (x.id === card.id ? { ...x, description: e.target.value } : x)) },
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : null}

          {tab === 'services' ? (
            <ListSectionEditor
              enabled={content.services.enabled}
              onToggle={(enabled) => setContent((c) => ({ ...c, services: { ...c.services, enabled } }))}
              title={content.services.title}
              subtitle={content.services.subtitle}
              onTitle={(title) => setContent((c) => ({ ...c, services: { ...c.services, title } }))}
              onSubtitle={(subtitle) => setContent((c) => ({ ...c, services: { ...c.services, subtitle } }))}
              cards={content.services.cards}
              onCards={(cards) => setContent((c) => ({ ...c, services: { ...c.services, cards } }))}
              renderCard={(card, index, cards, setCards) => (
                <ServiceCardEditor key={card.id} card={card} index={index} cards={cards} setCards={setCards} />
              )}
              newCard={() => ({ id: crypto.randomUUID(), icon: 'code', title: 'Yeni hizmet', text: '', color: GRADIENT_OPTIONS[0], order: content.services.cards.length, enabled: true })}
            />
          ) : null}

          {tab === 'brands' ? (
            <ListSectionEditor
              enabled={content.brands.enabled}
              onToggle={(enabled) => setContent((c) => ({ ...c, brands: { ...c.brands, enabled } }))}
              title={content.brands.title}
              subtitle={content.brands.subtitle}
              onTitle={(title) => setContent((c) => ({ ...c, brands: { ...c.brands, title } }))}
              onSubtitle={(subtitle) => setContent((c) => ({ ...c, brands: { ...c.brands, subtitle } }))}
              cards={content.brands.cards}
              onCards={(cards) => setContent((c) => ({ ...c, brands: { ...c.brands, cards } }))}
              renderCard={(card, index, cards, setCards) => (
                <BrandCardEditor key={card.id} card={card} index={index} cards={cards} setCards={setCards} />
              )}
              newCard={() => ({ id: crypto.randomUUID(), name: 'Yeni marka', text: '', image: '/images/brand-bilirkisi.jpg', url: 'https://', order: content.brands.cards.length, enabled: true })}
            />
          ) : null}

          {tab === 'why' ? (
            <ListSectionEditor
              enabled={content.why.enabled}
              onToggle={(enabled) => setContent((c) => ({ ...c, why: { ...c.why, enabled } }))}
              title={content.why.title}
              subtitle={content.why.subtitle}
              onTitle={(title) => setContent((c) => ({ ...c, why: { ...c.why, title } }))}
              onSubtitle={(subtitle) => setContent((c) => ({ ...c, why: { ...c.why, subtitle } }))}
              cards={content.why.cards}
              onCards={(cards) => setContent((c) => ({ ...c, why: { ...c.why, cards } }))}
              renderCard={(card, index, cards, setCards) => (
                <WhyCardEditor key={card.id} card={card} index={index} cards={cards} setCards={setCards} />
              )}
              newCard={() => ({ id: crypto.randomUUID(), icon: 'award', title: 'Yeni madde', text: '', color: WHY_COLOR_OPTIONS[0], order: content.why.cards.length, enabled: true })}
            />
          ) : null}

          {tab === 'process' ? (
            <>
              <SectionToggle enabled={content.process.enabled} onChange={(enabled) => setContent((c) => ({ ...c, process: { ...c.process, enabled } }))} />
              <Input label="Başlık" value={content.process.title} onChange={(e) => setContent((c) => ({ ...c, process: { ...c.process, title: e.target.value } }))} />
              <Input label="Alt başlık" value={content.process.subtitle} onChange={(e) => setContent((c) => ({ ...c, process: { ...c.process, subtitle: e.target.value } }))} />
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold">Adımlar</h3>
                <Button type="button" variant="secondary" size="sm" onClick={() => setContent((c) => ({ ...c, process: { ...c.process, steps: [...c.process.steps, { id: crypto.randomUUID(), step: String(c.process.steps.length + 1).padStart(2, '0'), title: 'Yeni adım', text: '', color: GRADIENT_OPTIONS[0], order: c.process.steps.length, enabled: true }] } }))}>
                  <Plus className="h-3.5 w-3.5" /> Ekle
                </Button>
              </div>
              {content.process.steps.map((step, index) => (
                <ProcessStepEditor key={step.id} step={step} index={index} steps={content.process.steps} onChange={(steps) => setContent((c) => ({ ...c, process: { ...c.process, steps } }))} />
              ))}
            </>
          ) : null}

          {tab === 'cta' ? (
            <>
              <SectionToggle enabled={content.cta.enabled} onChange={(enabled) => setContent((c) => ({ ...c, cta: { ...c.cta, enabled } }))} />
              <Input label="Başlık" value={content.cta.title} onChange={(e) => setContent((c) => ({ ...c, cta: { ...c.cta, title: e.target.value } }))} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                <textarea className={fieldClass} rows={2} value={content.cta.subtitle} onChange={(e) => setContent((c) => ({ ...c, cta: { ...c.cta, subtitle: e.target.value } }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Buton metni" value={content.cta.buttonText} onChange={(e) => setContent((c) => ({ ...c, cta: { ...c.cta, buttonText: e.target.value } }))} />
                <Input label="Buton linki" value={content.cta.buttonHref} onChange={(e) => setContent((c) => ({ ...c, cta: { ...c.cta, buttonHref: e.target.value } }))} />
              </div>
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

function ListSectionEditor<T extends { id: string; order: number; enabled: boolean }>({
  enabled,
  onToggle,
  title,
  subtitle,
  onTitle,
  onSubtitle,
  cards,
  onCards,
  renderCard,
  newCard,
}: {
  enabled: boolean
  onToggle: (v: boolean) => void
  title: string
  subtitle: string
  onTitle: (v: string) => void
  onSubtitle: (v: string) => void
  cards: T[]
  onCards: (cards: T[]) => void
  renderCard: (card: T, index: number, cards: T[], setCards: (cards: T[]) => void) => ReactNode
  newCard: () => T
}) {
  return (
    <>
      <SectionToggle enabled={enabled} onChange={onToggle} />
      <Input label="Bölüm başlığı" value={title} onChange={(e) => onTitle(e.target.value)} />
      <Input label="Alt başlık" value={subtitle} onChange={(e) => onSubtitle(e.target.value)} />
      <div className="flex justify-between">
        <h3 className="text-sm font-semibold">Kartlar</h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => onCards([...cards, newCard()])}>
          <Plus className="h-3.5 w-3.5" /> Ekle
        </Button>
      </div>
      <div className="space-y-3">{cards.map((card, index) => renderCard(card, index, cards, onCards))}</div>
    </>
  )
}

function CardActions({ index, total, onMove, onRemove }: { index: number; total: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1">
      <Button type="button" variant="secondary" size="sm" disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp className="h-3.5 w-3.5" /></Button>
      <Button type="button" variant="secondary" size="sm" disabled={index === total - 1} onClick={() => onMove(1)}><ChevronDown className="h-3.5 w-3.5" /></Button>
      <Button type="button" variant="secondary" size="sm" onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

function ServiceCardEditor({ card, index, cards, setCards }: { card: HomeServiceCard; index: number; cards: HomeServiceCard[]; setCards: (c: HomeServiceCard[]) => void }) {
  const patch = (p: Partial<HomeServiceCard>) => setCards(cards.map((c) => (c.id === card.id ? { ...c, ...p } : c)))
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex justify-between">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /> Aktif</label>
        <CardActions index={index} total={cards.length} onMove={(dir) => setCards(moveItem(cards, index, dir))} onRemove={() => setCards(cards.filter((c) => c.id !== card.id))} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Başlık" value={card.title} onChange={(e) => patch({ title: e.target.value })} />
        <select className={fieldClass} value={card.icon} onChange={(e) => patch({ icon: e.target.value })}>{HOME_ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        <select className={fieldClass} value={card.color} onChange={(e) => patch({ color: e.target.value })}>{GRADIENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      </div>
      <textarea className={`${fieldClass} mt-3`} rows={2} value={card.text} onChange={(e) => patch({ text: e.target.value })} />
    </div>
  )
}

function BrandCardEditor({ card, index, cards, setCards }: { card: HomeBrandCard; index: number; cards: HomeBrandCard[]; setCards: (c: HomeBrandCard[]) => void }) {
  const patch = (p: Partial<HomeBrandCard>) => setCards(cards.map((c) => (c.id === card.id ? { ...c, ...p } : c)))
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex justify-between">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /> Aktif</label>
        <CardActions index={index} total={cards.length} onMove={(dir) => setCards(moveItem(cards, index, dir))} onRemove={() => setCards(cards.filter((c) => c.id !== card.id))} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Marka adı" value={card.name} onChange={(e) => patch({ name: e.target.value })} />
        <Input label="Görsel URL" value={card.image} onChange={(e) => patch({ image: e.target.value })} />
        <Input label="Bağlantı URL" value={card.url} onChange={(e) => patch({ url: e.target.value })} />
      </div>
      <textarea className={`${fieldClass} mt-3`} rows={2} value={card.text} onChange={(e) => patch({ text: e.target.value })} />
    </div>
  )
}

function WhyCardEditor({ card, index, cards, setCards }: { card: HomeWhyCard; index: number; cards: HomeWhyCard[]; setCards: (c: HomeWhyCard[]) => void }) {
  const patch = (p: Partial<HomeWhyCard>) => setCards(cards.map((c) => (c.id === card.id ? { ...c, ...p } : c)))
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex justify-between">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /> Aktif</label>
        <CardActions index={index} total={cards.length} onMove={(dir) => setCards(moveItem(cards, index, dir))} onRemove={() => setCards(cards.filter((c) => c.id !== card.id))} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Başlık" value={card.title} onChange={(e) => patch({ title: e.target.value })} />
        <select className={fieldClass} value={card.icon} onChange={(e) => patch({ icon: e.target.value })}>{HOME_ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        <select className={fieldClass} value={card.color} onChange={(e) => patch({ color: e.target.value })}>{WHY_COLOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      </div>
      <textarea className={`${fieldClass} mt-3`} rows={2} value={card.text} onChange={(e) => patch({ text: e.target.value })} />
    </div>
  )
}

function ProcessStepEditor({ step, index, steps, onChange }: { step: HomeProcessStep; index: number; steps: HomeProcessStep[]; onChange: (s: HomeProcessStep[]) => void }) {
  const patch = (p: Partial<HomeProcessStep>) => onChange(steps.map((s) => (s.id === step.id ? { ...s, ...p } : s)))
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex justify-between">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={step.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /> Aktif</label>
        <CardActions index={index} total={steps.length} onMove={(dir) => onChange(moveItem(steps, index, dir))} onRemove={() => onChange(steps.filter((s) => s.id !== step.id))} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Adım no" value={step.step} onChange={(e) => patch({ step: e.target.value })} />
        <Input label="Başlık" value={step.title} onChange={(e) => patch({ title: e.target.value })} />
        <select className={`${fieldClass} self-end`} value={step.color} onChange={(e) => patch({ color: e.target.value })}>{GRADIENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      </div>
      <textarea className={`${fieldClass} mt-3`} rows={2} value={step.text} onChange={(e) => patch({ text: e.target.value })} />
    </div>
  )
}
