import type { ServiceDetailContent } from '@/data/serviceDetailContent'

export type ServicePageOverrides = Partial<
  ServiceDetailContent & {
    enabled?: boolean
    menuTitle?: string
    showInHeader?: boolean
    showInFooter?: boolean
    sortOrder?: number
    seoTitle?: string
    seoDescription?: string
  }
>

function mergeHero(
  base: ServiceDetailContent['hero'],
  partial?: Partial<ServiceDetailContent['hero']>,
): ServiceDetailContent['hero'] {
  if (!partial) return base
  return {
    ...base,
    eyebrow: partial.eyebrow?.trim() || base.eyebrow,
    title: partial.title?.trim() || base.title,
    description: partial.description?.trim() || base.description,
    image: partial.image?.trim() || base.image,
    imageAlt: partial.imageAlt?.trim() || base.imageAlt,
    primaryCta: partial.primaryCta?.text?.trim() ? partial.primaryCta : base.primaryCta,
    secondaryCta: partial.secondaryCta?.text?.trim() ? partial.secondaryCta : base.secondaryCta,
  }
}

export function mergeServicePage(base: ServiceDetailContent, partial: ServicePageOverrides): ServiceDetailContent {
  return {
    ...base,
    heroTheme: partial.heroTheme ?? base.heroTheme,
    hero: mergeHero(base.hero, partial.hero),
    problems: partial.problems?.items?.length
      ? { ...base.problems, ...partial.problems, items: partial.problems.items }
      : base.problems,
    approach: {
      ...base.approach,
      ...(partial.approach ?? {}),
      title: partial.approach?.title?.trim() || base.approach.title,
      description: partial.approach?.description?.trim() || base.approach.description,
      bullets: partial.approach?.bullets?.length ? partial.approach.bullets : base.approach.bullets,
      flowSteps: partial.approach?.flowSteps?.length ? partial.approach.flowSteps : base.approach.flowSteps,
    },
    scope: partial.scope?.items?.length
      ? { ...base.scope, ...partial.scope, items: partial.scope.items }
      : base.scope,
    process: partial.process?.steps?.length
      ? { ...base.process, ...partial.process, steps: partial.process.steps }
      : base.process,
    whyUs: partial.whyUs?.items?.length ? { ...base.whyUs, ...partial.whyUs, items: partial.whyUs.items } : base.whyUs,
    technology: partial.technology?.items?.length
      ? { ...base.technology, ...partial.technology, items: partial.technology.items }
      : base.technology,
    cta: {
      ...base.cta,
      ...(partial.cta ?? {}),
      title: partial.cta?.title?.trim() || base.cta.title,
      description: partial.cta?.description?.trim() || base.cta.description,
      buttonText: partial.cta?.buttonText?.trim() || base.cta.buttonText,
      buttonTo: partial.cta?.buttonTo?.trim() || base.cta.buttonTo,
      secondaryButtonText: partial.cta?.secondaryButtonText?.trim() || base.cta.secondaryButtonText,
      secondaryButtonTo: partial.cta?.secondaryButtonTo?.trim() || base.cta.secondaryButtonTo,
    },
  }
}

export function servicePageSeo(
  base: ServiceDetailContent,
  partial: ServicePageOverrides,
): { title: string; description: string } {
  return {
    title: partial.seoTitle?.trim() || `${base.hero.title} | Woontegra`,
    description: partial.seoDescription?.trim() || base.hero.description,
  }
}
