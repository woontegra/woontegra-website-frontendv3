import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { MenuSourcePanel } from '@/components/admin/menu/MenuSourcePanel'
import { MenuStructurePanel } from '@/components/admin/menu/MenuStructurePanel'
import { NavigationMenuPreview } from '@/components/admin/NavigationMenuPreview'
import type { LinkTargetValue } from '@/components/admin/LinkTargetSelector'
import {
  applyLinkTarget,
  buildMenuTree,
  buildPayload,
  sortMenuRows,
  validateForm,
  type UiMenuKind,
} from '@/lib/adminNavigationMenuForm'
import {
  getEffectiveHeaderNavigation,
  isAdminNavigationComplete,
  isPublicNavigationComplete,
} from '@/lib/navigationMenuState'
import { DEFAULT_NAV_TEMPLATE_ROWS, seedDefaultNavigationMenu } from '@/lib/seedDefaultNavigationMenu'
import { getErrorMessage } from '@/services/api/client'
import { navigationMenuService } from '@/services/api/navigationMenu'
import { productCategoriesService, type ProductCategory } from '@/services/api/productCategories'
import type { AdminNavigationMenuInput, AdminNavigationMenuItem, PublicNavigationMenuItem } from '@/types/navigationMenu'

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

export function AdminNavigationMenuPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const quickHandled = useRef(false)
  const [items, setItems] = useState<AdminNavigationMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [menuSaving, setMenuSaving] = useState(false)
  const [publicItems, setPublicItems] = useState<PublicNavigationMenuItem[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [seeding, setSeeding] = useState(false)
  const [reordering, setReordering] = useState(false)

  const tree = useMemo(() => buildMenuTree(items), [items])
  const dbComplete = useMemo(() => isAdminNavigationComplete(items), [items])
  const publicComplete = useMemo(() => isPublicNavigationComplete(publicItems), [publicItems])
  const effectiveNav = useMemo(() => getEffectiveHeaderNavigation(publicItems), [publicItems])

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

  useEffect(() => {
    void load()
  }, [])

  const nextSortOrder = (parentId: string | null) => {
    const siblings = items.filter((i) => (i.parentId ?? null) === parentId)
    if (siblings.length === 0) return 0
    return Math.max(...siblings.map((s) => s.sortOrder)) + 1
  }

  const createFromTarget = async (
    label: string,
    target: LinkTargetValue,
    parentId: string | null = null,
    options?: { openInNewTab?: boolean; sortOrder?: number },
  ) => {
    const { uiKind: kind, patch } = applyLinkTarget(target)
    const draft: AdminNavigationMenuInput = {
      ...empty,
      label: label.trim(),
      parentId,
      sortOrder: options?.sortOrder ?? nextSortOrder(parentId),
      isActive: true,
      openInNewTab: options?.openInNewTab ?? target.kind === 'external-url',
      ...patch,
    }
    const v = validateForm(draft, kind)
    if (v) throw new Error(v)
    const payload = buildPayload(draft, kind)
    await navigationMenuService.create(payload)
  }

  const addFromTarget = async (
    label: string,
    target: LinkTargetValue,
    parentId: string | null = null,
    options?: { openInNewTab?: boolean },
  ) => {
    await createFromTarget(label, target, parentId, options)
    await load()
    void queryClient.invalidateQueries({ queryKey: ['public', 'navigation-menu'] })
  }

  useEffect(() => {
    if (quickHandled.current || loading) return
    if (searchParams.get('quick') !== 'menu') return

    quickHandled.current = true
    const label = searchParams.get('label') ?? ''
    const path = searchParams.get('path') ?? '/'
    const sitePageKey = searchParams.get('sitePageKey')
    const cmsPageId = searchParams.get('cmsPageId')
    const categoryId = searchParams.get('categoryId')
    const productId = searchParams.get('productId')

    void (async () => {
      try {
        setAdding(true)
        let target: LinkTargetValue
        let menuLabel = label

        if (categoryId) {
          target = { kind: 'category', categoryId, url: path }
          menuLabel = label || categories.find((c) => c.id === categoryId)?.name || 'Kategori'
        } else if (productId) {
          target = { kind: 'product', productId, url: path }
          menuLabel = label || 'Ürün'
        } else if (cmsPageId) {
          target = { kind: 'cms-page', cmsPageId, url: path }
        } else if (sitePageKey) {
          target = { kind: 'site-page', sitePageKey, url: path }
        } else {
          target = { kind: 'custom-url', url: path }
        }

        await addFromTarget(menuLabel || 'Menü öğesi', target)
        setSuccessMessage(`“${menuLabel}” menüye eklendi.`)
      } catch (err) {
        setError(getErrorMessage(err, 'Hızlı ekleme başarısız'))
      } finally {
        setAdding(false)
        setSearchParams({}, { replace: true })
      }
    })()
  }, [loading, searchParams, setSearchParams, categories])

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

  const addBatch = async (entries: { label: string; target: LinkTargetValue; openInNewTab?: boolean }[]) => {
    if (entries.length === 0) return
    setAdding(true)
    setError(null)
    try {
      let order = nextSortOrder(null)
      for (const entry of entries) {
        await createFromTarget(entry.label, entry.target, null, {
          openInNewTab: entry.openInNewTab,
          sortOrder: order++,
        })
      }
      await load()
      void queryClient.invalidateQueries({ queryKey: ['public', 'navigation-menu'] })
      setSuccessMessage(
        entries.length === 1 ? `“${entries[0].label}” menüye eklendi.` : `${entries.length} öğe menüye eklendi.`,
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Eklenemedi'))
    } finally {
      setAdding(false)
    }
  }

  const saveItem = async (id: string, form: AdminNavigationMenuInput, uiKind: UiMenuKind) => {
    const v = validateForm(form, uiKind)
    if (v) throw new Error(v)
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload(form, uiKind)
      await navigationMenuService.update(id, payload)
      await load()
      void queryClient.invalidateQueries({ queryKey: ['public', 'navigation-menu'] })
      setSuccessMessage('Menü öğesi güncellendi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt başarısız'))
      throw err
    } finally {
      setSaving(false)
    }
  }

  const saveMenu = async () => {
    setMenuSaving(true)
    setError(null)
    try {
      await load()
      void queryClient.invalidateQueries({ queryKey: ['public', 'navigation-menu'] })
      setSuccessMessage('Menü kaydedildi. Public header güncellendi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Menü kaydedilemedi'))
    } finally {
      setMenuSaving(false)
    }
  }

  const remove = async (row: AdminNavigationMenuItem) => {
    if (!window.confirm(`“${row.label}” menüden kaldırılsın mı?`)) return
    try {
      await navigationMenuService.remove(row.id)
      await load()
      void queryClient.invalidateQueries({ queryKey: ['public', 'navigation-menu'] })
      setSuccessMessage('Menü öğesi kaldırıldı.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kaldırılamadı'))
    }
  }

  const reorderSiblings = async (parentId: string | null, orderedIds: string[]) => {
    const siblings = items.filter((i) => (i.parentId ?? null) === parentId)
    if (orderedIds.length !== siblings.length) return

    setReordering(true)
    const sortOrderById = new Map(orderedIds.map((id, idx) => [id, idx]))
    const nextItems = items.map((item) => {
      const next = sortOrderById.get(item.id)
      return next !== undefined ? { ...item, sortOrder: next } : item
    })
    setItems(nextItems)

    try {
      await Promise.all(
        orderedIds.map((id, idx) => {
          const prev = siblings.find((s) => s.id === id)
          if (!prev || prev.sortOrder === idx) return Promise.resolve()
          return navigationMenuService.update(id, { sortOrder: idx })
        }),
      )
      void queryClient.invalidateQueries({ queryKey: ['public', 'navigation-menu'] })
      setSuccessMessage('Menü sırası güncellendi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Sıra güncellenemedi'))
      await load()
    } finally {
      setReordering(false)
    }
  }

  const moveItem = async (row: AdminNavigationMenuItem, direction: -1 | 1) => {
    const parentId = row.parentId ?? null
    const siblings = items
      .filter((i) => (i.parentId ?? null) === parentId)
      .slice()
      .sort(sortMenuRows)
    const index = siblings.findIndex((i) => i.id === row.id)
    const swapIndex = index + direction
    if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) return

    const reordered = siblings.slice()
    const [removed] = reordered.splice(index, 1)
    reordered.splice(swapIndex, 0, removed)
    await reorderSiblings(parentId, reordered.map((s) => s.id))
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Menü Yönetimi"
        description="WordPress menü yönetimi: soldan öğe ekleyin, sağda yapıyı düzenleyin ve kaydedin."
      />

      {!loading ? (
        <Card className={effectiveNav.source === 'default' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}>
          <CardBody className="space-y-3 text-sm">
            {effectiveNav.source === 'default' ? (
              <p className="text-amber-900">
                <strong>Public header şu anda varsayılan menüyü gösteriyor.</strong> Soldan öğe ekleyin veya varsayılan
                menüyü aktarın.
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
              {!dbComplete ? <span className="self-center text-xs text-slate-600">Panel kayıtları eksik.</span> : null}
              {!publicComplete && dbComplete ? (
                <span className="self-center text-xs text-amber-700">Pasif öğeler public menüde görünmez.</span>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

      {loading ? <LoadingState label="Menü yükleniyor…" /> : null}

      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <MenuSourcePanel adding={adding} onAddBatch={addBatch} />
          <MenuStructurePanel
            tree={tree}
            flatItems={items}
            saving={saving}
            onSaveItem={saveItem}
            onRemove={(row) => void remove(row)}
            onMove={(row, dir) => void moveItem(row, dir)}
            onReorderSiblings={(parentId, orderedIds) => void reorderSiblings(parentId, orderedIds)}
            reordering={reordering}
            onSaveMenu={saveMenu}
            menuSaving={menuSaving}
          />
        </div>
      ) : null}

      {!loading && !dbComplete ? (
        <Card>
          <CardBody className="space-y-2 text-sm text-slate-600">
            <h2 className="font-semibold text-slate-900">Varsayılan menü referansı</h2>
            <ul className="grid gap-1 sm:grid-cols-2">
              {DEFAULT_NAV_TEMPLATE_ROWS.filter((r) => !r.groupHeader).map((row) => (
                <li key={row.key} className="text-xs">
                  {row.parentKey ? '↳ ' : ''}
                  {row.label} — <span className="text-slate-500">{row.href}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
