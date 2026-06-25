import { enabledProcessSteps, type HomePageContent } from '@/types/homePageContent'

type Props = { process: HomePageContent['process'] }

export function HomeProcess({ process }: Props) {
  const steps = enabledProcessSteps(process.steps)
  if (!steps.length) return null

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">{process.title}</h2>
          {process.subtitle ? <p className="text-lg text-gray-400">{process.subtitle}</p> : null}
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.id} className="group text-center">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110 ${item.color}`}
              >
                {item.step}
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
              <p className="text-base leading-relaxed text-gray-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
