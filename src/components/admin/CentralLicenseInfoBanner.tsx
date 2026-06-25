import { Card, CardBody } from '@/components/ui/Card'
import { CENTRAL_LICENSE_PUBLIC_MESSAGE } from '@/constants/centralLicenseServer'

type Props = {
  compact?: boolean
  extra?: string
}

export function CentralLicenseInfoBanner({ compact, extra }: Props) {
  return (
    <Card className="border-sky-200 bg-sky-50/60">
      <CardBody className={compact ? 'py-3' : undefined}>
        <p className="text-sm font-medium text-sky-950">Merkezi Woontegra Lisans Server</p>
        <p className="mt-1 text-sm text-sky-900/90">{CENTRAL_LICENSE_PUBLIC_MESSAGE}</p>
        {extra ? <p className="mt-2 text-xs text-sky-800">{extra}</p> : null}
      </CardBody>
    </Card>
  )
}
