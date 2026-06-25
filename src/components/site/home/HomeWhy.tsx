import { HomeIcon } from '@/components/site/home/homeIcons'
import { enabledWhy, type HomePageContent } from '@/types/homePageContent'

type Props = { why: HomePageContent['why'] }

export function HomeWhy({ why }: Props) {
  const cards = enabledWhy(why.cards)
  if (!cards.length) return null

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900">{why.title}</h2>
          {why.subtitle ? <p className="text-lg text-slate-600">{why.subtitle}</p> : null}
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-gray-200 bg-slate-50 p-8 transition-all duration-300 hover:border-green-500 hover:shadow-xl"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 ${item.color}`}>
                <HomeIcon name={item.icon} className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-base leading-relaxed text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
