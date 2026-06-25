import { Link } from 'react-router-dom'

import type { PublicBlogPost } from '@/types/blog'

import { formatBlogDate } from '@/types/blog'

import { Card, CardBody } from '@/components/ui/Card'

import { Badge } from '@/components/ui/Badge'

import { SafeImage } from '@/components/ui/SafeImage'



type Props = {

  post: PublicBlogPost

  compact?: boolean

}



export function BlogCard({ post, compact = false }: Props) {
  return (

    <Card className="group flex h-full flex-col overflow-hidden border-slate-200/80 transition hover:border-brand-200 hover:shadow-lg">

      <Link to={`/blog/${post.slug}`} className="block">

        <div className={`overflow-hidden bg-slate-100 ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
          <SafeImage
            src={post.featuredImage}
            alt={post.title}
            aspectRatio={compact ? 'aspect-[16/9]' : 'aspect-[16/10]'}
            placeholder
            loading="lazy"
          />
        </div>

      </Link>

      <CardBody className="flex flex-1 flex-col gap-3 p-5">

        <div className="flex flex-wrap items-center gap-2">

          {post.category ? <Badge>{post.category.name}</Badge> : null}

          <span className="text-xs text-slate-500">{formatBlogDate(post.publishedAt || post.createdAt)}</span>

        </div>

        <Link to={`/blog/${post.slug}`}>

          <h3 className={`line-clamp-2 font-semibold text-slate-900 transition group-hover:text-brand-700 ${compact ? 'text-base' : 'text-lg'}`}>

            {post.title}

          </h3>

        </Link>

        {post.excerpt ? (

          <p className={`line-clamp-3 flex-1 text-slate-600 ${compact ? 'text-sm' : 'text-sm'}`}>{post.excerpt}</p>

        ) : null}

        <Link

          to={`/blog/${post.slug}`}

          className="text-sm font-semibold text-brand-700 hover:text-brand-800"

        >

          Devamını oku →

        </Link>

      </CardBody>

    </Card>

  )

}


