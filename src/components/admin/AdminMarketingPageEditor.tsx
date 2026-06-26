import { Input } from '@/components/ui/Input'
import { ManagedImageField } from '@/components/admin/ManagedImageField'
import type { MarketingPageContent } from '@/types/marketingPageContent'

type Props = {
  value: MarketingPageContent
  onChange: (value: MarketingPageContent) => void
  showHeroImage?: boolean
}

export function AdminMarketingPageEditor({ value, onChange, showHeroImage = true }: Props) {
  const patch = (partial: Partial<MarketingPageContent>) => onChange({ ...value, ...partial })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Hero eyebrow" value={value.heroEyebrow} onChange={(e) => patch({ heroEyebrow: e.target.value })} />
        <Input label="Hero başlık" value={value.heroTitle} onChange={(e) => patch({ heroTitle: e.target.value })} />
      </div>
      <textarea
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={3}
        value={value.heroDescription}
        onChange={(e) => patch({ heroDescription: e.target.value })}
        placeholder="Hero açıklama"
      />
      {showHeroImage ? (
        <ManagedImageField label="Hero görseli" sizeSpec="pageHero" value={value.heroImage} onChange={(heroImage) => patch({ heroImage })} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Vurgu 1" value={value.highlight1} onChange={(e) => patch({ highlight1: e.target.value })} />
        <Input label="Vurgu 2" value={value.highlight2} onChange={(e) => patch({ highlight2: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Bölüm eyebrow" value={value.sectionEyebrow} onChange={(e) => patch({ sectionEyebrow: e.target.value })} />
        <Input label="Bölüm başlık" value={value.sectionTitle} onChange={(e) => patch({ sectionTitle: e.target.value })} />
      </div>
      <textarea
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={2}
        value={value.sectionDescription}
        onChange={(e) => patch({ sectionDescription: e.target.value })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="CTA başlık" value={value.ctaTitle} onChange={(e) => patch({ ctaTitle: e.target.value })} />
        <Input label="CTA buton metni" value={value.ctaButtonText} onChange={(e) => patch({ ctaButtonText: e.target.value })} />
      </div>
      <textarea
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={2}
        value={value.ctaDescription}
        onChange={(e) => patch({ ctaDescription: e.target.value })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="CTA link" value={value.ctaButtonLink} onChange={(e) => patch({ ctaButtonLink: e.target.value })} />
        <Input label="İkincil CTA metni" value={value.ctaSecondaryButtonText} onChange={(e) => patch({ ctaSecondaryButtonText: e.target.value })} />
      </div>
      <Input label="İkincil CTA link" value={value.ctaSecondaryButtonLink} onChange={(e) => patch({ ctaSecondaryButtonLink: e.target.value })} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="SEO başlık" value={value.seoTitle} onChange={(e) => patch({ seoTitle: e.target.value })} />
        <Input label="SEO açıklama" value={value.seoDescription} onChange={(e) => patch({ seoDescription: e.target.value })} />
      </div>
    </div>
  )
}
