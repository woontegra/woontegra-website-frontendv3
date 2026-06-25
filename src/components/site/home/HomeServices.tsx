import { HomeIcon } from '@/components/site/home/homeIcons'
import { enabledServices, type HomePageContent } from '@/types/homePageContent'

type Props = { services: HomePageContent['services'] }

export function HomeServices({ services }: Props) {
  const cards = enabledServices(services.cards)
  if (!cards.length) return null

  return (
    <section id="hizmetler" className="bg-slate-900 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">{services.title}</h2>
          {services.subtitle ? <p className="text-lg text-gray-400">{services.subtitle}</p> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl border border-slate-700 bg-slate-800 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-green-500/50"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 transition-opacity group-hover:opacity-10`} />
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} shadow-lg`}>
                <HomeIcon name={service.icon} className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{service.title}</h3>
              <p className="text-base leading-relaxed text-gray-400">{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
