import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  CreditCard,
  Eye,
  FileText,
  Image,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminOrdersService } from '@/services/api/adminOrders'
import { adminLicensesService } from '@/services/api/adminLicenses'
import { adminProductsService } from '@/services/api/adminProducts'
import { contactMessagesAdminService } from '@/services/api/contactMessagesAdmin'
import { siteSettingsService } from '@/services/api/siteSettings'
import { formatMoney } from '@/utils/formatMoney'
import {
  formatDateTime,
  paymentBadgeLabel,
  paymentBadgeTone,
  paymentMethodLabel,
  resolvePaymentBadgeKind,
} from '@/utils/adminOrderUi'
import { buildAdminDashboardData, truncateText } from '@/utils/adminDashboardStats'
import { cn } from '@/utils/cn'

const QUICK_ACTIONS = [
  { label: 'Yeni ürün ekle', href: '/admin/urunler/yeni', icon: Package },
  { label: 'Ürünleri yönet', href: '/admin/urunler', icon: Boxes },
  { label: 'Siparişleri gör', href: '/admin/siparisler', icon: ShoppingBag },
  { label: 'Medya yükle', href: '/admin/medya', icon: Image },
  { label: 'Ana sayfayı düzenle', href: '/admin/ana-sayfa', icon: LayoutDashboard },
  { label: 'Sayfaları yönet', href: '/admin/sayfalar', icon: FileText },
  { label: 'Menü yönetimi', href: '/admin/menu-yonetimi', icon: Menu },
  { label: 'Ödeme ayarları', href: '/admin/odeme-ayarlari', icon: Settings },
] as const

function SectionError({ label }: { label: string }) {
  return <p className="text-sm text-amber-700">{label} yüklenemedi; diğer bölümler gösteriliyor.</p>
}

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string
  value: string
  href?: string
  highlight?: boolean
}) {
  const body = (
    <Card className={cn(highlight && 'ring-1 ring-amber-200')}>
      <CardBody className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-xl font-semibold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  )
  if (href) {
    return (
      <Link to={href} className="block transition hover:opacity-90">
        {body}
      </Link>
    )
  }
  return body
}

export function AdminDashboardPage() {
  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', 'dashboard'],
    queryFn: () => adminOrdersService.list(),
    retry: 1,
  })

  const licensesQuery = useQuery({
    queryKey: ['admin', 'licenses', 'dashboard'],
    queryFn: () => adminLicensesService.list(),
    retry: 1,
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'dashboard'],
    queryFn: () => adminProductsService.list(),
    retry: 1,
  })

  const messagesQuery = useQuery({
    queryKey: ['admin', 'contact-messages', 'dashboard'],
    queryFn: () => contactMessagesAdminService.list(),
    retry: 1,
  })

  const settingsQuery = useQuery({
    queryKey: ['admin', 'siteSettings', 'dashboard'],
    queryFn: () => siteSettingsService.getAdmin(),
    retry: 1,
  })

  const loading =
    ordersQuery.isLoading &&
    licensesQuery.isLoading &&
    productsQuery.isLoading &&
    messagesQuery.isLoading

  const refetchAll = () => {
    void ordersQuery.refetch()
    void licensesQuery.refetch()
    void productsQuery.refetch()
    void messagesQuery.refetch()
    void settingsQuery.refetch()
  }

  const isFetching =
    ordersQuery.isFetching ||
    licensesQuery.isFetching ||
    productsQuery.isFetching ||
    messagesQuery.isFetching ||
    settingsQuery.isFetching

  const dashboard = useMemo(() => {
    if (!ordersQuery.data && !licensesQuery.data && !productsQuery.data && !messagesQuery.data) {
      return null
    }
    return buildAdminDashboardData({
      orders: ordersQuery.data ?? [],
      licenses: licensesQuery.data ?? [],
      products: productsQuery.data ?? [],
      messages: messagesQuery.data ?? [],
      siteSettings: settingsQuery.data ?? null,
    })
  }, [ordersQuery.data, licensesQuery.data, productsQuery.data, messagesQuery.data, settingsQuery.data])

  const allFailed =
    ordersQuery.isError &&
    licensesQuery.isError &&
    productsQuery.isError &&
    messagesQuery.isError

  return (
    <div className="w-full min-w-0 space-y-5">
      <PageHeader
        title="Dashboard"
        description="Satış, sipariş, lisans ve site yönetimi özeti."
        actions={
          <Button variant="secondary" size="sm" onClick={refetchAll} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Yenile
          </Button>
        }
      />

      {loading ? <LoadingState label="Dashboard yükleniyor…" /> : null}

      {allFailed ? (
        <EmptyState
          title="Dashboard yüklenemedi"
          description="Veriler alınamadı. Oturumunuzun açık olduğundan emin olun ve yenileyin."
        />
      ) : null}

      {!loading && dashboard ? (
        <>
          {/* Alerts */}
          <Card className={dashboard.alerts.length > 0 ? 'border-amber-200 bg-amber-50/50' : ''}>
            <CardBody className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-slate-900">Dikkat gerekenler</h2>
              </div>
              {dashboard.alerts.length === 0 ? (
                <p className="text-sm text-slate-600">Şu an dikkat gerektiren kayıt yok.</p>
              ) : (
                <ul className="space-y-1.5">
                  {dashboard.alerts.map((a) => (
                    <li key={a.id}>
                      {a.href ? (
                        <Link
                          to={a.href}
                          className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-700"
                        >
                          <Badge tone={a.tone === 'danger' ? 'danger' : a.tone === 'warning' ? 'warning' : 'default'}>
                            !
                          </Badge>
                          {a.message}
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-700">{a.message}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Summary cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <StatCard
              label="Bugünkü ciro"
              value={formatMoney(dashboard.todayRevenue, dashboard.todayCurrency)}
              href="/admin/siparisler"
            />
            <StatCard
              label="Bu ay ciro"
              value={formatMoney(dashboard.baseStats.monthlyRevenue, dashboard.baseStats.monthlyCurrency)}
              href="/admin/siparisler"
            />
            <StatCard label="Toplam sipariş" value={String(dashboard.baseStats.totalOrders)} href="/admin/siparisler" />
            <StatCard
              label="Bekleyen ödeme"
              value={String(dashboard.baseStats.pendingPayment)}
              href="/admin/siparisler?status=PENDING"
            />
            <StatCard
              label="Havale bekleyen"
              value={String(dashboard.baseStats.bankTransferPending)}
              href="/admin/odemeler"
            />
            <StatCard label="Ödenen sipariş" value={String(dashboard.baseStats.paidOrders)} href="/admin/siparisler" />
            <StatCard label="Toplam ürün" value={String(dashboard.totalProducts)} href="/admin/urunler" />
            <StatCard
              label="Aktif lisans kayıtları"
              value={String(dashboard.activeLicenses)}
              href="/admin/lisanslar"
            />
            <StatCard
              label="Okunmamış talepler"
              value={String(dashboard.unreadMessages)}
              href="/admin/musteri-talepleri"
              highlight={dashboard.unreadMessages > 0}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {/* Order operations */}
            <Card className="xl:col-span-2">
              <CardBody className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Sipariş operasyonu</h2>
                    <p className="text-xs text-slate-500">Son siparişler ve hızlı özet filtreler</p>
                  </div>
                  <Link to="/admin/siparisler" className="text-xs font-medium text-brand-600 hover:underline">
                    Tüm siparişler
                  </Link>
                </div>

                {ordersQuery.isError ? <SectionError label="Siparişler" /> : null}

                <div className="grid gap-2 sm:grid-cols-3">
                  <Link
                    to="/admin/siparisler?status=PENDING"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-brand-200"
                  >
                    <span className="text-slate-500">Ödeme bekleyen</span>
                    <p className="font-semibold text-slate-900">{dashboard.paymentPendingOrders.length}+</p>
                  </Link>
                  <Link
                    to="/admin/odemeler"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-brand-200"
                  >
                    <span className="text-slate-500">Havale bekleyen</span>
                    <p className="font-semibold text-slate-900">{dashboard.bankPendingOrders.length}+</p>
                  </Link>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-500">Bugün gelen</span>
                    <p className="font-semibold text-slate-900">{dashboard.todayOrderCount}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Sipariş no</TH>
                        <TH>Müşteri</TH>
                        <TH className="hidden md:table-cell">Ürün</TH>
                        <TH>Tutar</TH>
                        <TH className="hidden sm:table-cell">Ödeme</TH>
                        <TH>Durum</TH>
                        <TH className="hidden lg:table-cell">Tarih</TH>
                        <TH className="w-10"> </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {dashboard.recentOrders.length === 0 ? (
                        <TR>
                          <TD colSpan={8} className="text-center text-sm text-slate-500">
                            Henüz sipariş yok.
                          </TD>
                        </TR>
                      ) : (
                        dashboard.recentOrders.map((row) => {
                          const payKind = resolvePaymentBadgeKind(row)
                          return (
                            <TR key={row.id}>
                              <TD className="whitespace-nowrap font-medium">{row.orderNo}</TD>
                              <TD>
                                <div className="min-w-[8rem] max-w-[10rem] truncate">{row.customerName || '—'}</div>
                              </TD>
                              <TD className="hidden max-w-[10rem] truncate md:table-cell">{row.productSummary || '—'}</TD>
                              <TD className="whitespace-nowrap">{formatMoney(row.total, row.currency)}</TD>
                              <TD className="hidden sm:table-cell">
                                <span className="text-xs text-slate-600">{paymentMethodLabel(row)}</span>
                              </TD>
                              <TD>
                                <Badge tone={paymentBadgeTone(payKind)}>{paymentBadgeLabel(payKind)}</Badge>
                              </TD>
                              <TD className="hidden whitespace-nowrap text-xs text-slate-500 lg:table-cell">
                                {formatDateTime(row.createdAt)}
                              </TD>
                              <TD>
                                <Link
                                  to={`/admin/siparisler/${encodeURIComponent(row.id)}`}
                                  className="inline-flex text-brand-600 hover:text-brand-700"
                                  title="Detay"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </TD>
                            </TR>
                          )
                        })
                      )}
                    </TBody>
                  </Table>
                </div>
              </CardBody>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardBody className="space-y-3 p-4">
                <h2 className="text-sm font-semibold text-slate-900">Hızlı işlemler</h2>
                <div className="grid gap-2">
                  {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brand-600" />
                      <span className="flex-1">{label}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Sales summary */}
            <Card>
              <CardBody className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand-600" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Satış özeti</h2>
                    <p className="text-xs text-slate-500">Son 7 gün performansı</p>
                  </div>
                </div>

                {ordersQuery.isError ? <SectionError label="Satış verisi" /> : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Bu ay toplam ciro</p>
                    <p className="text-lg font-semibold">
                      {formatMoney(dashboard.baseStats.monthlyRevenue, dashboard.baseStats.monthlyCurrency)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Ortalama sipariş tutarı</p>
                    <p className="text-lg font-semibold">
                      {formatMoney(dashboard.avgOrderValue, dashboard.avgOrderCurrency)}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Gün</TH>
                        <TH>Ciro</TH>
                        <TH>Sipariş</TH>
                        <TH className="w-32">Grafik</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {dashboard.last7Days.map((day) => (
                        <TR key={day.dateKey}>
                          <TD className="whitespace-nowrap text-sm">{day.label}</TD>
                          <TD className="whitespace-nowrap text-sm">{formatMoney(day.revenue, day.currency)}</TD>
                          <TD className="text-sm">{day.orderCount}</TD>
                          <TD>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-500"
                                style={{ width: `${Math.round((day.revenue / dashboard.maxDayRevenue) * 100)}%` }}
                              />
                            </div>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </CardBody>
            </Card>

            {/* Product performance */}
            <Card>
              <CardBody className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Ürün performansı</h2>
                    <p className="text-xs text-slate-500">Satış adedi ve ciro (siparişlerden)</p>
                  </div>
                  <Link to="/admin/urunler" className="text-xs font-medium text-brand-600 hover:underline">
                    Ürünler
                  </Link>
                </div>

                {productsQuery.isError ? <SectionError label="Ürünler" /> : null}

                <div className="flex flex-wrap gap-2">
                  <Badge tone="success">{dashboard.activeProducts} aktif</Badge>
                  <Badge tone="default">{dashboard.inactiveProducts} pasif</Badge>
                  {dashboard.noPriceProducts.length > 0 ? (
                    <Badge tone="warning">{dashboard.noPriceProducts.length} fiyatsız</Badge>
                  ) : null}
                  {dashboard.activeNotForSaleProducts.length > 0 ? (
                    <Badge tone="warning">{dashboard.activeNotForSaleProducts.length} satışa kapalı</Badge>
                  ) : null}
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Ürün</TH>
                        <TH>Adet</TH>
                        <TH>Ciro</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {dashboard.topProducts.length === 0 ? (
                        <TR>
                          <TD colSpan={3} className="text-center text-sm text-slate-500">
                            Ödenmiş sipariş verisi yok.
                          </TD>
                        </TR>
                      ) : (
                        dashboard.topProducts.map((p) => (
                          <TR key={p.name}>
                            <TD className="max-w-[12rem] truncate">{p.name}</TD>
                            <TD>{p.quantity}</TD>
                            <TD className="whitespace-nowrap">{formatMoney(p.revenue, p.currency)}</TD>
                          </TR>
                        ))
                      )}
                    </TBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* License / delivery */}
            <Card>
              <CardBody className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand-600" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Lisans ve teslimat</h2>
                    <p className="text-xs text-slate-500">Merkezi lisans kaydı durumu</p>
                  </div>
                </div>

                {licensesQuery.isError ? <SectionError label="Lisanslar" /> : null}

                <div className="rounded-lg border border-brand-100 bg-brand-50/40 px-3 py-2 text-xs text-slate-600">
                  Lisans üretimi bu panelde yapılmaz. Kayıtlar merkezi Woontegra lisans sunucusu ile senkronize
                  edilir; teslimat ve e-posta durumu sipariş detayından takip edilir.
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Lisans kayıtlı sipariş</p>
                    <p className="text-lg font-semibold">{dashboard.ordersWithLicenseCount}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Kayıt bekleyen (ödendi)</p>
                    <p className="text-lg font-semibold text-amber-700">{dashboard.paidAwaitingLicense.length}+</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Sipariş</TH>
                        <TH>Müşteri</TH>
                        <TH>Lisans durumu</TH>
                        <TH className="w-10"> </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {dashboard.paidAwaitingLicense.length === 0 &&
                      dashboard.recentOrders.filter((o) => dashboard.licenseByOrderId.has(o.id)).length === 0 ? (
                        <TR>
                          <TD colSpan={4} className="text-center text-sm text-slate-500">
                            Lisans ilişkili sipariş bulunamadı.
                          </TD>
                        </TR>
                      ) : (
                        <>
                          {dashboard.paidAwaitingLicense.map((row) => (
                            <TR key={`await-${row.id}`}>
                              <TD className="whitespace-nowrap font-medium">{row.orderNo}</TD>
                              <TD className="max-w-[8rem] truncate">{row.customerEmail}</TD>
                              <TD>
                                <Badge tone="warning">Merkezi kayıt bekliyor</Badge>
                              </TD>
                              <TD>
                                <Link
                                  to={`/admin/siparisler/${encodeURIComponent(row.id)}`}
                                  className="text-xs text-brand-600 hover:underline"
                                >
                                  Detay
                                </Link>
                              </TD>
                            </TR>
                          ))}
                          {dashboard.recentOrders
                            .filter((o) => dashboard.licenseByOrderId.has(o.id))
                            .slice(0, 4)
                            .map((row) => {
                              const licList = dashboard.licenseByOrderId.get(row.id) ?? []
                              const active = licList.some((l) => l.status === 'ACTIVE')
                              return (
                                <TR key={`lic-${row.id}`}>
                                  <TD className="whitespace-nowrap font-medium">{row.orderNo}</TD>
                                  <TD className="max-w-[8rem] truncate">{row.customerEmail}</TD>
                                  <TD>
                                    <Badge tone={active ? 'success' : 'default'}>
                                      {licList.length} merkezi kayıt
                                    </Badge>
                                  </TD>
                                  <TD>
                                    <Link
                                      to={`/admin/siparisler/${encodeURIComponent(row.id)}`}
                                      className="text-xs text-brand-600 hover:underline"
                                    >
                                      Detay
                                    </Link>
                                  </TD>
                                </TR>
                              )
                            })}
                        </>
                      )}
                    </TBody>
                  </Table>
                </div>

                <Link to="/admin/lisanslar" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                  Lisans kayıtları
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>

            {/* Contact messages */}
            <Card className={dashboard.unreadMessages > 0 ? 'ring-1 ring-amber-200' : ''}>
              <CardBody className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-600" />
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Son müşteri talepleri</h2>
                      {dashboard.unreadMessages > 0 ? (
                        <p className="text-xs font-medium text-amber-700">{dashboard.unreadMessages} okunmamış</p>
                      ) : (
                        <p className="text-xs text-slate-500">İletişim formu mesajları</p>
                      )}
                    </div>
                  </div>
                  <Link to="/admin/musteri-talepleri" className="text-xs font-medium text-brand-600 hover:underline">
                    Tümü
                  </Link>
                </div>

                {messagesQuery.isError ? <SectionError label="Müşteri talepleri" /> : null}

                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Ad</TH>
                        <TH className="hidden sm:table-cell">E-posta</TH>
                        <TH>Mesaj</TH>
                        <TH className="hidden md:table-cell">Tarih</TH>
                        <TH>Durum</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {dashboard.recentMessages.length === 0 ? (
                        <TR>
                          <TD colSpan={5} className="text-center text-sm text-slate-500">
                            Henüz mesaj yok.
                          </TD>
                        </TR>
                      ) : (
                        dashboard.recentMessages.map((m) => (
                          <TR key={m.id} className={!m.read ? 'bg-amber-50/40' : undefined}>
                            <TD className="font-medium">{m.name || '—'}</TD>
                            <TD className="hidden max-w-[8rem] truncate sm:table-cell">{m.email}</TD>
                            <TD className="max-w-[10rem] truncate text-sm">{truncateText(m.message, 48)}</TD>
                            <TD className="hidden whitespace-nowrap text-xs text-slate-500 md:table-cell">
                              {formatDateTime(m.createdAt)}
                            </TD>
                            <TD>
                              <Badge tone={m.read ? 'default' : 'warning'}>{m.read ? 'Okundu' : 'Yeni'}</Badge>
                            </TD>
                          </TR>
                        ))
                      )}
                    </TBody>
                  </Table>
                </div>

                <Link
                  to="/admin/musteri-talepleri"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  <Users className="h-3 w-3" />
                  Müşteri talepleri sayfası
                </Link>
              </CardBody>
            </Card>
          </div>

          {/* Site management info */}
          <Card>
            <CardBody className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-slate-900">Site yönetimi</h2>
                <Badge tone="brand">Woontegra</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Ürünler, siparişler, ödemeler, lisanslar, blog ve içerikler bu panelden yönetilir. Toplam{' '}
                {dashboard.baseStats.licenseRecords} lisans kaydı listeleniyor.
              </p>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  )
}
