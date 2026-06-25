import { Link } from 'react-router-dom'
import { Card, CardBody } from '@/components/ui/Card'
import {
  CMS_ADMIN_HINT,
  CMS_ADMIN_LINK,
  LEGAL_DOCUMENTS_ADMIN_HINT,
  LEGAL_DOCUMENTS_ADMIN_LINK,
} from '@/constants/adminContentHints'

export function CmsAdminHintCard() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardBody className="text-sm text-amber-950">
        <p className="font-medium">{CMS_ADMIN_HINT}</p>
        <p className="mt-2">
          <Link to={CMS_ADMIN_LINK} className="font-medium text-brand-700 hover:underline">
            Admin Panel → İçerikler
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}

export function LegalDocumentsAdminHintCard() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardBody className="text-sm text-amber-950">
        <p className="font-medium">{LEGAL_DOCUMENTS_ADMIN_HINT}</p>
        <p className="mt-2">
          <Link to={LEGAL_DOCUMENTS_ADMIN_LINK} className="font-medium text-brand-700 hover:underline">
            Admin Panel → Yasal Metinler
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
