import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { LinkTargetSelector, resolveLinkTargetHref, type LinkTargetValue } from '@/components/admin/LinkTargetSelector'
import { NavigationMenuPreview } from '@/components/admin/NavigationMenuPreview'
import { SITE_PAGE_DEFINITIONS } from '@/data/sitePages'
import { SERVICE_CATALOG } from '@/data/serviceCatalog'
import { SOLUTION_CATALOG } from '@/data/solutionCatalog'
import {
  getEffectiveHeaderNavigation,
  isAdminNavigationComplete,
  isPublicNavigationComplete,
} from '@/lib/navigationMenuState'
import { DEFAULT_NAV_TEMPLATE_ROWS, seedDefaultNavigationMenu } from '@/lib/seedDefaultNavigationMenu'
import { getErrorMessage } from '@/services/api/client'
import { navigationMenuService } from '@/services/api/navigationMenu'
import { productCategoriesService, type ProductCategory } from '@/services/api/productCategories'
import type { AdminNavigationMenuInput, AdminNavigationMenuItem, NavigationMenuItemType, PublicNavigationMenuItem } from '@/types/navigationMenu'

type UiMenuKind =
  | NavigationMenuItemType
  | 'SITE_PAGE'
  | 'BLOG_POST'
  | 'BLOG_LIST'
  | 'HOME'
  | 'EXTERNAL_URL'
  | 'SERVICE_LIST'
  | 'SERVICE'
  | 'SOLUTION_LIST'
  | 'SOFTWARE_LIST'
  | 'SOLUTION'

const UI_MENU_KIND_LABELS: Record<UiMenuKind, string> = {
  HOME: 'Ana sayfa',
  BLOG_LIST: 'Blog listesi',
  BLOG_POST: 'Blog yazısı',
  SERVICE_LIST: 'Hizmet listesi',
  SERVICE: 'Hizmet',
  SOLUTION_LIST: 'Çözüm listesi',
  SOFTWARE_LIST: 'Yazılım listesi',
  SOLUTION: 'Çözüm',
  SITE_PAGE: 'Site sayfası',
  EXTERNAL_URL: 'Dış bağlantı',
  CUSTOM_URL: 'Özel URL',
  PRODUCT: 'Ürün / Yazılım',
  CATEGORY: 'Yazılım kategorisi',
  PAGE: 'CMS sayfa',
}

const empty: AdminNavigationMenuInput = {
  label: '',
  type: 'CUSTOM_URL',
  url: '',
  productId: null,
  categoryId: null,
  pageId: null,
  parentId: null,
  sortOrder: 0,
  isActive: true,
  openInNewTab: false,
}

function uiKindFromRow(row: AdminNavigationMenuItem): UiMenuKind {
  if (row.type === 'CUSTOM_URL') {
    const url = (row.url ?? '').trim()
    if (url === '/') return 'HOME'
    if (url === '/blog') return 'BLOG_LIST'
    if (url === '/hizmetler') return 'SERVICE_LIST'
    if (url === '/cozumler') return 'SOLUTION_LIST'
    if (url === '/yazilimlar') return 'SOFTWARE_LIST'
    if (/^https?:\/\//i.test(url)) return 'EXTERNAL_URL'
    if (SERVICE_CATALOG.some((s) => s.path === url)) return 'SERVICE'
    if (SOLUTION_CATALOG.some((s) => `/cozumler/${s.slug}` === url)) return 'SOLUTION'
    if (SITE_PAGE_DEFINITIONS.some((p) => p.path === url)) return 'SITE_PAGE'
    if (url.startsWith('/blog/')) return 'BLOG_POST'
  }
  return row.type
}

function buildPayload(form: AdminNavigationMenuInput, uiKind: UiMenuKind): AdminNavigationMenuInput {
  if (uiKind === 'HOME' || uiKind === 'BLOG_LIST' || uiKind === 'SITE_PAGE' || uiKind === 'BLOG_POST' || uiKind === 'EXTERNAL_URL' || uiKind === 'SERVICE_LIST' || uiKind === 'SERVICE' || uiKind === 'SOLUTION_LIST' || uiKind === 'SOFTWARE_LIST' || uiKind === 'SOLUTION') {
    return {
      ...form,
      type: 'CUSTOM_URL',
      url: (form.url ?? '').trim(),
      productId: null,
      categoryId: null,
      pageId: null,
    }
  }
  return {
    ...form,
    url: form.type === 'CUSTOM_URL' ? (form.url ?? '').trim() : null,
    productId: form.type === 'PRODUCT' ? form.productId : null,
    categoryId: form.type === 'CATEGORY' ? form.categoryId : null,
    pageId: form.type === 'PAGE' ? form.pageId : null,
  }
}

function validateForm(form: AdminNavigationMenuInput, uiKind: UiMenuKind): string | null {
  if (!form.label.trim()) return 'Başlık gerekli'
  if (uiKind === 'HOME' || uiKind === 'BLOG_LIST' || uiKind === 'SERVICE_LIST' || uiKind === 'SOLUTION_LIST' || uiKind === 'SOFTWARE_LIST') return null
  if (uiKind === 'SITE_PAGE' && !(form.url ?? '').trim()) return 'Site sayfası seçin'
  if (uiKind === 'BLOG_POST' && !(form.url ?? '').trim()) return 'Blog yazısı seçin'
  if (uiKind === 'EXTERNAL_URL') {
    const u = (form.url ?? '').trim()
    if (!/^https?:\/\//i.test(u)) return 'Dış bağlantı https:// ile başlamalı'
  }
  if (form.type === 'CUSTOM_URL' && uiKind === 'CUSTOM_URL') {
    const u = (form.url ?? '').trim()
    if (!u) return 'URL gerekli'
    if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) return 'URL / veya http(s) ile başlamalı'
  }
  if (form.type === 'PRODUCT' && !form.productId) return 'Ürün seçin'
  if (form.type === 'CATEGORY' && !form.categoryId) return 'Kategori seçin'
  if (form.type === 'PAGE' && !form.pageId) return 'CMS sayfa seçin'
  return null
}

function linkTargetFromRow(row: AdminNavigationMenuItem, kind: UiMenuKind): LinkTargetValue {
  if (kind === 'HOME') return { kind: 'home', url: '/' }
  if (kind === 'BLOG_LIST') return { kind: 'blog-list', url: '/blog' }
  if (kind === 'SERVICE_LIST') return { kind: 'service-list', url: '/hizmetler' }
  if (kind === 'SOLUTION_LIST') return { kind: 'solution-list', url: '/cozumler' }
  if (kind === 'SOFTWARE_LIST') return { kind: 'software-list', url: '/yazilimlar' }
  if (kind === 'SERVICE') {
    const service = SERVICE_CATALOG.find((s) => s.path === row.url)
    return { kind: 'service', serviceSlug: service?.slug, url: row.url ?? '/hizmetler' }
  }
  if (kind === 'SOLUTION') {
    const solution = SOLUTION_CATALOG.find((s) => `/cozumler/${s.slug}` === row.url)
    return { kind: 'solution', solutionSlug: solution?.slug, url: row.url ?? '/cozumler' }
  }
  if (kind === 'SITE_PAGE') {
    const page = SITE_PAGE_DEFINITIONS.find((p) => p.path === row.url)
    return { kind: 'site-page', sitePageKey: page?.key, url: row.url ?? '/' }
  }
  if (kind === 'BLOG_POST') {
    return { kind: 'blog-post', blogPostSlug: (row.url ?? '').replace(/^\/blog\//, ''), url: row.url ?? '' }
  }
  if (kind === 'EXTERNAL_URL') return { kind: 'external-url', url: row.url ?? '' }
  if (row.type === 'PRODUCT') return { kind: 'product', productId: row.productId ?? undefined, url: row.resolvedUrl }
  if (row.type === 'CATEGORY') return { kind: 'category', categoryId: row.categoryId ?? undefined, url: row.resolvedUrl }
  if (row.type === 'PAGE') return { kind: 'cms-page', cmsPageId: row.pageId ?? undefined, url: row.resolvedUrl }
  return { kind: 'custom-url', url: row.url ?? '/' }
}

function sortMenuRows(a: AdminNavigationMenuItem, b: AdminNavigationMenuItem): number {
  return a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'tr')
}

function buildAdminTreeRows(items: AdminNavigationMenuItem[]): AdminNavigationMenuItem[] {
  const topLevel = items.filter((i) => !i.parentId).slice().sort(sortMenuRows)
  const rows: AdminNavigationMenuItem[] = []
  for (const parent of topLevel) {
    rows.push(parent)
    rows.push(...items.filter((i) => i.parentId === parent.id).slice().sort(sortMenuRows))
  }
  const listed = new Set(rows.map((r) => r.id))
  rows.push(...items.filter((i) => !listed.has(i.id)).slice().sort(sortMenuRows))
  return rows
}

export function AdminNavigationMenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const quickHandled = useRef(false)
  const [items, setItems] = useState<AdminNavigationMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AdminNavigationMenuInput>(empty)
  const [uiKind, setUiKind] = useState<UiMenuKind>('CUSTOM_URL')
  const [linkTarget, setLinkTarget] = useState<LinkTargetValue>({ kind: 'custom-url', url: '/' })
  const [quickHint, setQuickHint] = useState<string | null>(null)
  const [publicItems, setPublicItems] = useState<PublicNavigationMenuItem[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [seeding, setSeeding] = useState(false)

  const treeItems = useMemo(() => buildAdminTreeRows(items), [items])

  const dbComplete = useMemo(() => isAdminNavigationComplete(items), [items])
  const publicComplete = useMemo(() => isPublicNavigationComplete(publicItems), [publicItems])

  const effectiveNav = useMemo(
    () => getEffectiveHeaderNavigation(publicItems),
    [publicItems],
  )

  const parentLabelById = useMemo(() => {
    const map = new Map<string, string>()
    items.forEach((i) => map.set(i.id, i.label))
    for (const row of DEFAULT_NAV_TEMPLATE_ROWS) {
      map.set(row.key, row.label)
    }
    return map
  }, [items])

  const parentOptions = useMemo(
    () => items.filter((i) => !i.parentId && i.id !== editingId).slice().sort(sortMenuRows),
    [items, editingId],
  )

  const load = async () => {
    setError(null)
    try {
      setLoading(true)
      const [adminItems, pubItems, cats] = await Promise.all([
        navigationMenuService.listAdmin(),
        navigationMenuService.listPublic(),
        productCategoriesService.list(),
      ])
      setItems(adminItems)
      setPublicItems(pubItems)
      setCategories(cats)
    } catch (err) {
      setError(getErrorMessage(err, 'Menü yüklenemedi'))
    } finally {
      setLoading(false)
    }
  }

  const importDefaultMenu = async () => {
    if (!window.confirm('Varsayılan header menüsü panele aktarılsın mı? Mevcut kayıtlar korunur, eksikler eklenir.')) return
    setSeeding(true)
    setError(null)
    try {
      const result = await seedDefaultNavigationMenu(items, categories)
      await load()
      setSuccessMessage(
        `Varsayılan menü aktarıldı: ${result.created} yeni, ${result.updated} güncellendi, ${result.skipped} zaten vardı.`,
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Varsayılan menü aktarılamadı'))
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (quickHandled.current || loading) return
    if (searchParams.get('quick') !== 'menu') return

    const label = searchParams.get('label') ?? ''
    const path = searchParams.get('path') ?? '/'
    const sitePageKey = searchParams.get('sitePageKey')
    const cmsPageId = searchParams.get('cmsPageId')

    quickHandled.current = true
    setEditingId(null)
    setForm({
      ...empty,
      label,
      sortOrder: items.length,
    })

    if (cmsPageId) {
      setUiKind('PAGE')
      setLinkTarget({ kind: 'cms-page', cmsPageId, url: path })
      setForm((f) => ({
        ...f,
        label,
        type: 'PAGE',
        pageId: cmsPageId,
        sortOrder: items.length,
      }))
    } else if (sitePageKey) {
      setUiKind('SITE_PAGE')
      setLinkTarget({ kind: 'site-page', sitePageKey, url: path })
      setForm((f) => ({
        ...f,
        label,
        type: 'CUSTOM_URL',
        url: path,
        sortOrder: items.length,
      }))
    } else {
      setUiKind('CUSTOM_URL')
      setLinkTarget({ kind: 'custom-url', url: path })
      setForm((f) => ({
        ...f,
        label,
        type: 'CUSTOM_URL',
        url: path,
        sortOrder: items.length,
      }))
    }

    setSearchParams({}, { replace: true })
    setQuickHint(`“${label || 'Sayfa'}” menü formuna eklendi. Kontrol edip alttaki Ekle butonuna basın.`)
    document.getElementById('menu-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, items.length, searchParams, setSearchParams])

  const resetForm = () => {
    setEditingId(null)
    setForm(empty)
    setUiKind('CUSTOM_URL')
    setLinkTarget({ kind: 'custom-url', url: '/' })
    setQuickHint(null)
  }

  const startEdit = async (row: AdminNavigationMenuItem) => {
    try {
      const full = await navigationMenuService.getById(row.id)
      const kind = uiKindFromRow(full)
      setEditingId(full.id)
      setUiKind(kind)
      setForm({
        label: full.label,
        type: full.type,
        url: full.url ?? '',
        productId: full.productId,
        categoryId: full.categoryId,
        pageId: full.pageId,
        parentId: full.parentId,
        sortOrder: full.sortOrder,
        isActive: full.isActive,
        openInNewTab: full.openInNewTab,
      })
      setLinkTarget(linkTargetFromRow(full, kind))
    } catch {
      setError('Kayıt yüklenemedi')
    }
  }

  const applyLinkTarget = (target: LinkTargetValue) => {
    setLinkTarget(target)
    const resolved = resolveLinkTargetHref(target)
    if (target.kind === 'home') {
      setUiKind('HOME')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: '/', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'blog-list') {
      setUiKind('BLOG_LIST')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: '/blog', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'service-list') {
      setUiKind('SERVICE_LIST')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: '/hizmetler', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'solution-list') {
      setUiKind('SOLUTION_LIST')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: '/cozumler', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'software-list') {
      setUiKind('SOFTWARE_LIST')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: '/yazilimlar', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'service') {
      setUiKind('SERVICE')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: resolved.href ?? '/hizmetler', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'solution') {
      setUiKind('SOLUTION')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: resolved.href ?? '/cozumler', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'site-page') {
      setUiKind('SITE_PAGE')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: resolved.href ?? '/', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'blog-post') {
      setUiKind('BLOG_POST')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: resolved.href ?? '/blog', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'external-url') {
      setUiKind('EXTERNAL_URL')
      setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: resolved.href ?? '', productId: null, categoryId: null, pageId: null }))
      return
    }
    if (target.kind === 'product') {
      setUiKind('PRODUCT')
      setForm((f) => ({ ...f, type: 'PRODUCT', productId: target.productId ?? null, url: resolved.href }))
      return
    }
    if (target.kind === 'category') {
      setUiKind('CATEGORY')
      setForm((f) => ({ ...f, type: 'CATEGORY', categoryId: target.categoryId ?? null, url: resolved.href }))
      return
    }
    if (target.kind === 'cms-page') {
      setUiKind('PAGE')
      setForm((f) => ({ ...f, type: 'PAGE', pageId: target.cmsPageId ?? null, url: resolved.href }))
      return
    }
    setUiKind('CUSTOM_URL')
    setForm((f) => ({ ...f, type: 'CUSTOM_URL', url: resolved.href ?? '/', productId: null, categoryId: null, pageId: null }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validateForm(form, uiKind)
    if (v) {
      setError(v)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload(form, uiKind)
      if (editingId) await navigationMenuService.update(editingId, payload)
      else await navigationMenuService.create(payload)
      await load()
      resetForm()
      setQuickHint(null)
      setError(null)
      setSuccessMessage(editingId ? 'Menü öğesi güncellendi.' : 'Menü öğesi eklendi. Public header güncellenecek.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt başarısız'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (row: AdminNavigationMenuItem) => {
    if (!window.confirm(`“${row.label}” silinsin mi?`)) return
    try {
      await navigationMenuService.remove(row.id)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Silinemedi'))
    }
  }

  const toggleActive = async (row: AdminNavigationMenuItem) => {
    try {
      await navigationMenuService.update(row.id, { isActive: !row.isActive })
      await load()
      setSuccessMessage(row.isActive ? 'Menü pasif yapıldı.' : 'Menü aktif yapıldı.')
    } catch (err) {
      setError(getErrorMessage(err, 'Durum güncellenemedi'))
    }
  }

  const moveItem = async (row: AdminNavigationMenuItem, direction: -1 | 1) => {
    const siblings = treeItems
      .filter((i) => (i.parentId ?? null) === (row.parentId ?? null))
      .slice()
      .sort(sortMenuRows)
    const index = siblings.findIndex((i) => i.id === row.id)
    const swapIndex = index + direction
    if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) return
    const a = siblings[index]
    const b = siblings[swapIndex]
    try {
      await Promise.all([
        navigationMenuService.update(a.id, { sortOrder: b.sortOrder }),
        navigationMenuService.update(b.id, { sortOrder: a.sortOrder }),
      ])
      await load()
      setSuccessMessage('Menü sırası güncellendi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Sıra güncellenemedi'))
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Menü Yönetimi" description="Header ve mobil menüyü yönetin." />

      {!loading ? (
        <Card className={effectiveNav.source === 'default' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}>
          <CardBody className="space-y-3 text-sm">
            {effectiveNav.source === 'default' ? (
              <p className="text-amber-900">
                <strong>Public header şu anda varsayılan menüyü gösteriyor.</strong> Veritabanında yeterli aktif ana menü
                kaydı yok ({items.filter((i) => !i.parentId && i.isActive).length} ana öğe). Menüleri yönetmek için
                &quot;Varsayılan menüyü panele aktar&quot; butonunu kullanın.
              </p>
            ) : (
              <p className="text-emerald-900">
                Public header veritabanı menüsünü kullanıyor. Aşağıdaki önizleme ziyaretçilerin gördüğü menü ile
                eşleşmelidir.
              </p>
            )}
            <NavigationMenuPreview nav={effectiveNav.nav} source={effectiveNav.source} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" onClick={() => void importDefaultMenu()} disabled={seeding}>
                {seeding ? 'Aktarılıyor…' : 'Varsayılan menüyü panele aktar'}
              </Button>
              {!dbComplete ? (
                <span className="self-center text-xs text-slate-600">
                  Panel kayıtları eksik — varsayılan şablon aşağıda gösteriliyor.
                </span>
              ) : null}
              {!publicComplete && dbComplete ? (
                <span className="self-center text-xs text-amber-700">
                  Panel kayıtları var ama public menü hâlâ varsayılanı kullanıyor olabilir (pasif/eksik ana öğeler).
                </span>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

      {quickHint ? (
        <Card className="border-brand-200 bg-brand-50">
          <CardBody className="text-sm text-brand-900">{quickHint}</CardBody>
        </Card>
      ) : null}

      <Card id="menu-form">
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{editingId ? 'Menü öğesi düzenle' : 'Yeni menü öğesi'}</h2>
              {editingId ? (
                <Button type="button" variant="secondary" size="sm" onClick={resetForm}>
                  Vazgeç
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Başlık *" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
              <Input
                label="Sıralama"
                type="number"
                value={String(form.sortOrder ?? 0)}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </div>

            <LinkTargetSelector value={linkTarget} onChange={applyLinkTarget} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Üst menü (alt menü)</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  value={form.parentId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value || null }))}
                >
                  <option value="">Yok (ana menü)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Alt menü öğeleri header dropdown olarak gösterilir.</p>
              </div>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  Aktif (header + mobil)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.openInNewTab === true} onChange={(e) => setForm((f) => ({ ...f, openInNewTab: e.target.checked }))} />
                  Yeni sekmede aç (dış bağlantılar için)
                </label>
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? 'Kaydediliyor…' : editingId ? 'Güncelle' : 'Ekle'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading ? <LoadingState label="Menü yükleniyor…" /> : null}

      {!loading && !dbComplete ? (
        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Varsayılan header menüsü (public önizleme)</h2>
            <p className="text-sm text-slate-600">
              Ziyaretçiler şu an bu menüyü görüyor. Aktarmadan önce referans olarak inceleyebilirsiniz.
            </p>
            <Table>
              <THead>
                <TR>
                  <TH>Başlık</TH>
                  <TH>URL</TH>
                  <TH>Seviye</TH>
                  <TH>Durum</TH>
                </TR>
              </THead>
              <TBody>
                {DEFAULT_NAV_TEMPLATE_ROWS.filter((r) => !r.groupHeader).map((row) => (
                  <TR key={row.key}>
                    <TD className="font-medium">
                      {row.parentKey ? <span className="text-slate-400">↳ </span> : null}
                      {row.label}
                    </TD>
                    <TD className="text-sm text-slate-600">{row.href}</TD>
                    <TD className="text-sm text-slate-500">{row.uiHint}</TD>
                    <TD>
                      <Badge tone="default">Varsayılan</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}

      {!loading && items.length === 0 && dbComplete ? null : null}

      {!loading && treeItems.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Veritabanı menü kayıtları</h2>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Başlık</TH>
                  <TH>Tür</TH>
                  <TH>URL</TH>
                  <TH>Üst menü</TH>
                  <TH>Sıra</TH>
                  <TH>Durum</TH>
                  <TH className="text-right">İşlemler</TH>
                </TR>
              </THead>
              <TBody>
                {treeItems.map((row) => {
                  const kind = uiKindFromRow(row)
                  const siblings = treeItems.filter((i) => (i.parentId ?? null) === (row.parentId ?? null))
                  const siblingIndex = siblings.findIndex((i) => i.id === row.id)
                  return (
                    <TR key={row.id}>
                      <TD className="font-medium">
                        {row.parentId ? <span className="inline-block w-5 text-slate-400">↳</span> : null}
                        {row.label}
                      </TD>
                      <TD>{UI_MENU_KIND_LABELS[kind]}</TD>
                      <TD className="max-w-[200px] truncate text-sm text-slate-600">{row.resolvedUrl || row.url || '—'}</TD>
                      <TD className="text-sm text-slate-600">{row.parentId ? parentLabelById.get(row.parentId) ?? '—' : '—'}</TD>
                      <TD>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{row.sortOrder}</span>
                          <Button type="button" variant="secondary" size="sm" disabled={siblingIndex === 0} onClick={() => void moveItem(row, -1)}>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="secondary" size="sm" disabled={siblingIndex === siblings.length - 1} onClick={() => void moveItem(row, 1)}>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TD>
                      <TD>
                        <button type="button" onClick={() => void toggleActive(row)}>
                          <Badge tone={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Aktif' : 'Pasif'}</Badge>
                        </button>
                        {row.openInNewTab ? <span className="ml-1 text-xs text-slate-400">↗</span> : null}
                      </TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => void startEdit(row)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => void remove(row)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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
    </div>
  )
}
