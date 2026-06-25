import { cn } from '@/utils/cn'

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/80', className)} />
}

export function PageHeroSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn('border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16 md:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <Bone className="h-6 w-24" />
            <Bone className="h-10 w-full max-w-lg" />
            <Bone className="h-10 w-4/5 max-w-md" />
            <Bone className="mt-2 h-5 w-full max-w-xl" />
            <Bone className="h-5 w-3/4 max-w-lg" />
          </div>
          <Bone className="aspect-[4/3] w-full max-w-xl justify-self-center rounded-2xl lg:max-w-none" />
        </div>
      </div>
    </section>
  )
}

export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Bone className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Bone className="h-4 w-20" />
            <Bone className="h-6 w-full" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ArticleContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-3xl space-y-4 px-4 py-8', className)}>
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-5/6" />
      <Bone className="mt-6 h-8 w-2/3" />
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-4/5" />
    </div>
  )
}

export function BlogDetailSkeleton() {
  return (
    <article className="bg-slate-50">
      <PageHeroSkeleton />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[78rem] flex-wrap gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Bone className="h-6 w-20" />
          <Bone className="h-5 w-28" />
          <Bone className="h-5 w-24" />
        </div>
      </div>
      <div className="mx-auto max-w-[78rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="mx-auto max-w-[52rem] space-y-4">
            <Bone className="h-8 w-2/3" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-5/6" />
            <Bone className="mt-6 h-4 w-full" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="bg-white">
      <PageHeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Bone className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Bone className="h-6 w-24" />
            <Bone className="h-10 w-full" />
            <Bone className="h-8 w-32" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-3/4" />
            <div className="flex gap-3 pt-4">
              <Bone className="h-11 w-36" />
              <Bone className="h-11 w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
