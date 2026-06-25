import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronDown,
  CreditCard,
  FileText,
  FolderTree,
  History,
  Home,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  PanelLeft,
  Package,
  Palette,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Tags,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

type NavGroup = {
  id: string
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    id: 'panel',
    title: 'Panel',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    id: 'satis',
    title: 'Satış',
    items: [
      { to: '/admin/siparisler', label: 'Siparişler', icon: ShoppingBag },
      { to: '/admin/odemeler', label: 'Ödemeler', icon: Wallet },
      { to: '/admin/lisanslar', label: 'Lisanslar', icon: KeyRound },
      { to: '/admin/musteri-talepleri', label: 'Müşteri Talepleri', icon: Users },
    ],
  },
  {
    id: 'urunler',
    title: 'Ürünler',
    items: [
      { to: '/admin/urunler', label: 'Ürünler', icon: Package },
      { to: '/admin/kategoriler', label: 'Kategoriler', icon: FolderTree },
      { to: '/admin/markalar', label: 'Markalar', icon: Tags },
      { to: '/admin/ozellikler', label: 'Özellikler', icon: Sparkles },
    ],
  },
  {
    id: 'icerik',
    title: 'İçerik',
    items: [
      { to: '/admin/ana-sayfa', label: 'Ana Sayfa', icon: Home },
      { to: '/admin/sayfalar', label: 'Sayfalar', icon: FileText },
      { to: '/admin/hizmetler', label: 'Hizmetler', icon: Briefcase },
      { to: '/admin/cozumler', label: 'Çözümler', icon: Layers },
      { to: '/admin/menu-yonetimi', label: 'Menü Yönetimi', icon: Menu },
      { to: '/admin/footer-yonetimi', label: 'Footer Yönetimi', icon: PanelLeft },
      { to: '/admin/blog', label: 'Blog', icon: BookOpen },
      { to: '/admin/yasal-metinler', label: 'Yasal Metinler', icon: Shield },
      { to: '/admin/medya', label: 'Medya', icon: ImageIcon },
      { to: '/admin/seo', label: 'SEO', icon: Search },
    ],
  },
  {
    id: 'entegrasyon',
    title: 'Entegrasyon',
    items: [
      { to: '/admin/odeme-ayarlari', label: 'Ödeme Ayarları', icon: CreditCard },
      { to: '/admin/lisans-ayarlari', label: 'Lisans Ayarları', icon: Shield },
      { to: '/admin/eposta-ayarlari', label: 'E-posta Ayarları', icon: Mail },
    ],
  },
  {
    id: 'pazarlama',
    title: 'Pazarlama',
    items: [
      { to: '/admin/kampanyalar', label: 'Kampanyalar', icon: Megaphone },
      { to: '/admin/kuponlar', label: 'Kuponlar', icon: Ticket },
    ],
  },
  {
    id: 'operasyon',
    title: 'Operasyon',
    items: [
      { to: '/admin/raporlar', label: 'Raporlar', icon: BarChart3 },
      { to: '/admin/islem-gecmisi', label: 'İşlem Geçmişi', icon: History },
    ],
  },
  {
    id: 'ayarlar',
    title: 'Ayarlar',
    items: [
      { to: '/admin/ayarlar', label: 'Site Ayarları', icon: Settings, end: true },
      { to: '/admin/gorunum-ayarlari', label: 'Görünüm Ayarları', icon: Palette },
      { to: '/admin/kullanici-ayarlari', label: 'Kullanıcı Ayarları', icon: Users },
    ],
  },
]

function isItemActive(pathname: string, to: string, end?: boolean): boolean {
  if (end) return pathname === to || pathname === `${to}/`
  return pathname === to || pathname.startsWith(`${to}/`)
}

function findActiveGroupId(pathname: string): string | null {
  for (const group of navGroups) {
    if (group.items.some((item) => isItemActive(pathname, item.to, item.end))) {
      return group.id
    }
  }
  return null
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { adminUser, clearAdminSession } = useAuthStore()

  const activeGroupId = useMemo(() => findActiveGroupId(location.pathname), [location.pathname])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of navGroups) {
      initial[group.id] = group.id === activeGroupId
    }
    return initial
  })

  useEffect(() => {
    if (!activeGroupId) return
    setOpenGroups((prev) => ({ ...prev, [activeGroupId]: true }))
  }, [activeGroupId])

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const logout = () => {
    clearAdminSession()
    navigate('/giris')
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center border-b border-slate-100 px-4">
          <span className="text-sm font-semibold text-slate-900">Woontegra Yönetim</span>
        </div>
        <nav className="max-h-[45vh] space-y-1 overflow-y-auto p-3 lg:max-h-none">
          {navGroups.map((group) => {
            const isOpen = openGroups[group.id] ?? false
            const groupActive = group.id === activeGroupId

            return (
              <div key={group.id} className="py-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50',
                    groupActive && 'text-brand-700',
                  )}
                  aria-expanded={isOpen}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen ? (
                  <ul className="mt-0.5 space-y-0.5 pl-1">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                              isActive
                                ? 'bg-brand-50 text-brand-700'
                                : 'text-slate-600 hover:bg-slate-50',
                            )
                          }
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <p className="truncate text-sm text-slate-500">{adminUser?.email ?? 'Yönetici'}</p>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Çıkış
          </Button>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
