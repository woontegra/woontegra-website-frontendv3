import { Card, CardBody } from '@/components/ui/Card'

type Props = {
  title: string
  endpointHint?: string
  description: string
  children?: React.ReactNode
}

export function AdminMissingEndpointCard({ title, endpointHint, description, children }: Props) {
  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardBody className="space-y-3">
        <p className="text-sm font-semibold text-amber-950">{title}</p>
        {endpointHint ? (
          <p className="font-mono text-xs text-amber-900">{endpointHint}</p>
        ) : null}
        <p className="text-sm text-amber-900">{description}</p>
        {children}
      </CardBody>
    </Card>
  )
}
