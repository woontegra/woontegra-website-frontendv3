import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { AdminMissingEndpointCard } from '@/components/admin/AdminMissingEndpointCard'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminProductsService } from '@/services/api/adminProducts'

export function AdminFeaturesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'products', 'features-audit'],
    queryFn: () => adminProductsService.list(),
  })

  const rows = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    bullets: (p.featureBullets ?? '').trim(),
    active: p.isActive,
  }))

  const emptyBullets = rows.filter((r) => !r.bullets)

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Ürün özellikleri"
        description="Ayrı özellik kataloğu yok; ürün kartları featureBullets alanı ile yönetilir."
      />

      <AdminMissingEndpointCard
        title="Backend endpoint bulunamadı"
        endpointHint="Beklenen: GET/POST/PATCH /api/admin/product-attributes (veya benzeri) — mevcut değil"
        description="Ürün özellikleri ayrı CRUD tablosu olarak backend'de tanımlı değil. Özellik maddeleri her ürünün düzenleme formundaki featureBullets (satır satır metin) alanından yönetilir."
      />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Ürün özellik maddeleri denetimi</h2>
          <p className="text-sm text-slate-600">
            GET <code className="rounded bg-slate-100 px-1">/api/admin/products</code> — boş featureBullets olan
            ürünler aşağıda listelenir.
          </p>

          {isLoading ? <LoadingState label="Ürünler yükleniyor…" /> : null}
          {isError ? <p className="text-sm text-red-600">Ürün listesi alınamadı.</p> : null}

          {!isLoading && !isError ? (
            <>
              <p className="text-sm text-slate-700">
                Toplam {rows.length} ürün · {emptyBullets.length} tanesinde özellik maddesi boş
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Ürün</TH>
                      <TH>Özellik maddeleri</TH>
                      <TH>Durum</TH>
                      <TH> </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {emptyBullets.length === 0 ? (
                      <TR>
                        <TD colSpan={4}>Tüm ürünlerde özellik maddesi tanımlı.</TD>
                      </TR>
                    ) : (
                      emptyBullets.map((r) => (
                        <TR key={r.id}>
                          <TD>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-xs text-slate-500">{r.slug}</p>
                          </TD>
                          <TD className="text-amber-700">Boş</TD>
                          <TD>{r.active ? 'Aktif' : 'Pasif'}</TD>
                          <TD>
                            <Link
                              to={`/admin/urunler/${r.id}/duzenle`}
                              className="text-sm font-medium text-brand-700 hover:underline"
                            >
                              Düzenle
                            </Link>
                          </TD>
                        </TR>
                      ))
                    )}
                  </TBody>
                </Table>
              </div>
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}
