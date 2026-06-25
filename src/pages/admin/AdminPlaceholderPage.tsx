import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type Props = {
  title: string
  description?: string
}

export function AdminPlaceholderPage({ title, description }: Props) {
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title={title} />
      <Card>
        <CardBody>
          <EmptyState
            title={title}
            description={description ?? 'Bu modül sonraki aşamada bağlanacak.'}
          />
        </CardBody>
      </Card>
    </div>
  )
}
