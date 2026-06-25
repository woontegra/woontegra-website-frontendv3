import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { SOLUTION_CATALOG } from '@/data/solutionCatalog'

export function AdminSolutionsListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Çözümler"
        description="Çözüm detay sayfalarını yönetin. Ana liste sayfası /admin/sayfalar üzerinden düzenlenebilir."
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
              {SOLUTION_CATALOG.map((solution) => (
                <TR key={solution.slug}>
                  <TD className="font-medium text-slate-900">{solution.title}</TD>
                  <TD className="font-mono text-xs text-slate-600">{solution.slug}</TD>
                  <TD>
                    <a
                      href={`/cozumler/${solution.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-700 hover:underline"
                    >
                      /cozumler/{solution.slug}
                    </a>
                  </TD>
                  <TD className="text-right">
                    <Link
                      to={`/admin/cozumler/${encodeURIComponent(solution.slug)}/duzenle`}
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
        Çözümler ana sayfası:{' '}
        <Link to="/admin/sayfalar/solutions/duzenle" className="font-medium text-brand-700 hover:underline">
          Sayfalar → Çözümler
        </Link>
        .
      </p>
    </div>
  )
}
