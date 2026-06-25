import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SafeImage } from '@/components/ui/SafeImage'
import { enabledBrands, type HomePageContent } from '@/types/homePageContent'

type Props = { brands: HomePageContent['brands'] }

export function HomeBrands({ brands }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cards = enabledBrands(brands.cards)
  if (!cards.length) return null

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' })
  }

  return (
    <section className="overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900">{brands.title}</h2>
          {brands.subtitle ? <p className="text-lg text-slate-600">{brands.subtitle}</p> : null}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -ml-6 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-green-500 hover:bg-green-500 hover:text-white"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div ref={scrollRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pb-8 scrollbar-hide">
            {cards.map((brand) => (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-[calc(33.333%-16px)] min-w-[300px] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-72 overflow-hidden bg-slate-100">
                  <SafeImage
                    src={brand.image}
                    alt={brand.name}
                    aspectRatio="aspect-auto h-72"
                    placeholder
                    loading="lazy"
                    wrapperClassName="h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{brand.name}</h3>
                  <p className="text-base text-slate-600">{brand.text}</p>
                </div>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 -mr-6 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-green-500 hover:bg-green-500 hover:text-white"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
