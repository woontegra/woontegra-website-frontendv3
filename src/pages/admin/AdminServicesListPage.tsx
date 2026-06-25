import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { SERVICE_CATALOG } from '@/data/serviceCatalog'

export function AdminServicesListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hizmetler"
        description="Hizmet landing ve detay sayfalarını yönetin. Liste sayfası /admin/sayfalar üzerinden düzenlenebilir."
      />

      <Card>
        <CardBody className="overflow-x-auto p-0">
          <Table>
            <THead>
              <TR>
                <TH>Başlık</TH>
                <TH>Slug</TH>
                <TH>Public URL</TH>
                <TH className="text-right">İşlem</TH>
              </TR>
            </THead>
            <TBody>
              {SERVICE_CATALOG.map((service) => (
                <TR key={service.slug}>
                  <TD className="font-medium text-slate-900">{service.title}</TD>
                  <TD className="font-mono text-xs text-slate-600">{service.slug}</TD>
                  <TD>
                    <a href={service.path} target="_blank" rel="noreferrer" className="text-sm text-brand-700 hover:underline">
                      {service.path}
                    </a>
                  </TD>
                  <TD className="text-right">
                    <Link
                      to={`/admin/hizmetler/${encodeURIComponent(service.slug)}/duzenle`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <p className="text-sm text-slate-500">
        Hizmetler ana sayfası:{' '}
        <Link to="/admin/sayfalar/services/duzenle" className="font-medium text-brand-700 hover:underline">
          Sayfalar → Hizmetler
        </Link>
        . Header dropdown:{' '}
        <Link to="/admin/menu-yonetimi" className="font-medium text-brand-700 hover:underline">
          Menü Yönetimi
        </Link>
        .
      </p>
    </div>
  )
}
