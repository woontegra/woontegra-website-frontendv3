import { useQuery } from '@tanstack/react-query'

import { ExternalLink, Link2, ListPlus, Menu, Pencil, Plus } from 'lucide-react'

import { Link } from 'react-router-dom'

import { AdminTechnicalDetails } from '@/components/admin/AdminTechnicalDetails'

import { Badge } from '@/components/ui/Badge'

import { Button } from '@/components/ui/Button'

import { Card, CardBody } from '@/components/ui/Card'

import { LoadingState } from '@/components/ui/LoadingState'

import { PageHeader } from '@/components/ui/PageHeader'

import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'

import { SITE_PAGE_DEFINITIONS } from '@/data/sitePages'

import { buildFooterQuickLink, buildMenuQuickLink } from '@/lib/cmsQuickLinks'
import { footerGroupIdForPageKey } from '@/lib/cmsReservedSlugs'

import { cmsPagesService } from '@/services/api/cmsPages'

import { pageContentService } from '@/services/api/pageContent'



type StaticPageRow = {

  kind: 'static'

  id: string

  title: string

  path: string

  key: string

  pageTypeLabel: string

  enabled: boolean

  updatedAt: string | null

  editPath: string

}



type CmsPageRow = {

  kind: 'cms'

  id: string

  title: string

  path: string

  slug: string

  pageTypeLabel: string

  enabled: boolean

  updatedAt: string | null

  editPath: string

}



type PageRow = StaticPageRow | CmsPageRow



function formatDate(value?: string | null): string {

  if (!value) return '—'

  const d = new Date(value)

  if (Number.isNaN(d.getTime())) return '—'

  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)

}



export function AdminPagesListPage() {

  const { data, isLoading } = useQuery({

    queryKey: ['admin', 'site-pages'],

    queryFn: async (): Promise<PageRow[]> => {

      const staticRows = await Promise.all(

        SITE_PAGE_DEFINITIONS.map(async (page) => {

          const raw = await pageContentService.getRawByKey(page.key)

          const updatedAt =

            raw && typeof raw === 'object' && 'updatedAt' in raw ? String((raw as { updatedAt?: string }).updatedAt) : null

          const enabled =

            raw && typeof raw === 'object' && 'enabled' in raw

              ? (raw as { enabled?: boolean }).enabled !== false

              : true

          return {

            kind: 'static' as const,

            id: page.key,

            title: page.title,

            path: page.path,

            key: page.key,

            pageTypeLabel: page.pageTypeLabel,

            enabled,

            updatedAt,

            editPath: `/admin/sayfalar/${encodeURIComponent(page.key)}/duzenle`,

          }

        }),

      )



      let cmsRows: CmsPageRow[] = []

      try {

        const cmsPages = await cmsPagesService.list()

        cmsRows = cmsPages.map((page) => ({

          kind: 'cms' as const,

          id: page.id,

          title: page.title,

          slug: page.slug,

          path: `/${page.slug}`,

          pageTypeLabel: 'Özel CMS',

          enabled: page.status === 'published',

          updatedAt: page.updatedAt,

          editPath: `/admin/sayfalar/ozel/${page.id}/duzenle`,

        }))

      } catch {

        cmsRows = []

      }



      return [...staticRows, ...cmsRows]

    },

  })



  return (

    <div className="w-full min-w-0 space-y-6">

      <PageHeader

        title="Sayfalar"

        description="Site sayfalarını düzenleyin, menü ve footer bağlantıları oluşturun."

        actions={

          <Link to="/admin/sayfalar/yeni">

            <Button>

              <Plus className="h-4 w-4" />

              Yeni sayfa

            </Button>

          </Link>

        }

      />



      <AdminTechnicalDetails

        items={[

          { label: 'Sistem sayfaları', value: 'GET/PUT /api/page-content/:key' },

          { label: 'Özel CMS sayfaları', value: 'POST /api/pages · GET/PUT /api/admin/cms/pages/:id' },

        ]}

      />



      <Card className="border-brand-200 bg-brand-50/50">

        <CardBody className="text-sm text-slate-700">

          Checkout yasal belgeleri{' '}

          <Link to="/admin/yasal-metinler" className="font-semibold text-brand-700 hover:underline">

            Yasal Metinler

          </Link>{' '}

          sayfasından yönetilir. Header menüsü için{' '}

          <Link to="/admin/menu-yonetimi" className="font-semibold text-brand-700 hover:underline">

            Menü Yönetimi

          </Link>

          , footer için{' '}

          <Link to="/admin/footer-yonetimi" className="font-semibold text-brand-700 hover:underline">

            Footer Yönetimi

          </Link>{' '}

          kullanın.

        </CardBody>

      </Card>



      {isLoading ? <LoadingState label="Sayfalar yükleniyor…" /> : null}



      {data ? (

        <Card>

          <CardBody className="overflow-x-auto p-0">

            <Table>

              <THead>

                <TR>

                  <TH>Sayfa başlığı</TH>

                  <TH>Public route</TH>

                  <TH>Tip</TH>

                  <TH>Durum</TH>

                  <TH>Güncelleme</TH>

                  <TH className="text-right">İşlemler</TH>

                </TR>

              </THead>

              <TBody>

                {data.map((row) => {

                  const menuLink =

                    row.kind === 'static'

                      ? buildMenuQuickLink({ sitePageKey: row.key, label: row.title, path: row.path })

                      : buildMenuQuickLink({ cmsPageId: row.id, label: row.title, path: row.path })

                  const footerLink = buildFooterQuickLink({

                    sitePageKey: row.kind === 'static' ? row.key : undefined,

                    label: row.title,

                    path: row.path,

                    groupId:
                      row.kind === 'static' ? footerGroupIdForPageKey(row.key) : 'kurumsal',

                  })



                  return (

                    <TR key={row.kind === 'static' ? row.key : row.id}>

                      <TD className="font-medium text-slate-900">{row.title}</TD>

                      <TD>

                        <Link

                          to={row.path}

                          target="_blank"

                          className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"

                        >

                          {row.path}

                          <ExternalLink className="h-3 w-3" />

                        </Link>

                      </TD>

                      <TD>{row.pageTypeLabel}</TD>

                      <TD>

                        <Badge tone={row.enabled ? 'success' : 'default'}>{row.enabled ? 'Yayında' : 'Pasif'}</Badge>

                      </TD>

                      <TD className="text-xs text-slate-500">{formatDate(row.updatedAt)}</TD>

                      <TD>

                        <div className="flex flex-wrap justify-end gap-1.5">

                          <Link to={row.editPath}>

                            <Button variant="secondary" size="sm">

                              <Pencil className="h-3.5 w-3.5" />

                              Düzenle

                            </Button>

                          </Link>

                          <Link to={row.path} target="_blank">

                            <Button variant="secondary" size="sm">

                              <ExternalLink className="h-3.5 w-3.5" />

                              Canlı

                            </Button>

                          </Link>

                          <Link to={menuLink}>

                            <Button variant="secondary" size="sm">

                              <Menu className="h-3.5 w-3.5" />

                              Menüye ekle

                            </Button>

                          </Link>

                          <Link to={footerLink}>

                            <Button variant="secondary" size="sm">

                              <ListPlus className="h-3.5 w-3.5" />

                              Footera ekle

                            </Button>

                          </Link>

                        </div>

                      </TD>

                    </TR>

                  )

                })}

              </TBody>

            </Table>

          </CardBody>

        </Card>

      ) : null}



      {data && data.every((r) => r.kind === 'static') ? (

        <Card className="border-amber-200 bg-amber-50">

          <CardBody className="flex gap-2 text-sm text-amber-900">

            <Link2 className="mt-0.5 h-4 w-4 shrink-0" />

            <p>

              Özel CMS sayfaları listelenemedi. Backend dinamik sayfa endpoint&apos;i erişilebilir değilse yalnızca

              sistem sayfaları düzenlenebilir; yeni sayfa oluşturma bu durumda başarısız olur.

            </p>

          </CardBody>

        </Card>

      ) : null}

    </div>

  )

}


