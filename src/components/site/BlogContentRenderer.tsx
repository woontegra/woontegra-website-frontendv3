import { isHtmlContent } from '@/lib/blogReading'
import { cn } from '@/utils/cn'

type Props = {
  html: string
  className?: string
}

export function BlogContentRenderer({ html, className }: Props) {
  if (!html.trim()) return null

  if (isHtmlContent(html)) {
    return (
      <div
        className={cn('blog-prose', className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className={cn('blog-prose whitespace-pre-line text-base leading-relaxed text-slate-700', className)}>
      {html}
    </div>
  )
}
