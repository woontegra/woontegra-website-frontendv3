import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ChevronDown, ChevronRight, ChevronUp, GripVertical, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardBody } from '@/components/ui/Card'

import { Input } from '@/components/ui/Input'

import { LinkTargetSelector, type LinkTargetValue } from '@/components/admin/LinkTargetSelector'

import {

  UI_MENU_KIND_LABELS,

  applyLinkTarget,

  linkTargetFromRow,

  type MenuTreeNode,

  uiKindFromRow,

  type UiMenuKind,

} from '@/lib/adminNavigationMenuForm'

import type { AdminNavigationMenuInput, AdminNavigationMenuItem } from '@/types/navigationMenu'

import { cn } from '@/utils/cn'



type ParentOption = { id: string; label: string; depth: number }



type Props = {

  tree: MenuTreeNode[]

  flatItems: AdminNavigationMenuItem[]

  saving: boolean

  reordering?: boolean

  onSaveItem: (id: string, form: AdminNavigationMenuInput, uiKind: UiMenuKind) => Promise<void>

  onRemove: (row: AdminNavigationMenuItem) => void

  onMove: (row: AdminNavigationMenuItem, direction: -1 | 1) => void

  onReorderSiblings: (parentId: string | null, orderedIds: string[]) => void

  onSaveMenu: () => Promise<void>

  menuSaving: boolean

}



type ActiveDrag = {

  sourceId: string

  parentId: string | null

  siblingIds: string[]

}



type MenuDragContextValue = {

  draggingId: string | null

  overId: string | null

  startDrag: (sourceId: string, parentId: string | null, siblingIds: string[]) => void

}



const MenuDragContext = createContext<MenuDragContextValue | null>(null)



function useMenuDrag() {

  const ctx = useContext(MenuDragContext)

  if (!ctx) throw new Error('MenuDragContext missing')

  return ctx

}



function MenuDragProvider({

  disabled,

  onReorderSiblings,

  children,

}: {

  disabled: boolean

  onReorderSiblings: (parentId: string | null, orderedIds: string[]) => void

  children: ReactNode

}) {

  const [drag, setDrag] = useState<ActiveDrag | null>(null)

  const [overId, setOverId] = useState<string | null>(null)



  const startDrag = useCallback(

    (sourceId: string, parentId: string | null, siblingIds: string[]) => {

      if (disabled) return

      setDrag({ sourceId, parentId, siblingIds })

      setOverId(sourceId)

    },

    [disabled],

  )



  const finishDrag = useCallback(() => {

    if (!drag) {

      setOverId(null)

      return

    }



    const targetId = overId

    if (targetId && targetId !== drag.sourceId) {

      const ids = drag.siblingIds.slice()

      const from = ids.indexOf(drag.sourceId)

      const to = ids.indexOf(targetId)

      if (from >= 0 && to >= 0) {

        const next = ids.slice()

        next.splice(from, 1)

        next.splice(to, 0, drag.sourceId)

        onReorderSiblings(drag.parentId, next)

      }

    }



    setDrag(null)

    setOverId(null)

  }, [drag, overId, onReorderSiblings])



  useEffect(() => {

    if (!drag) return



    const onPointerMove = (e: PointerEvent) => {

      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-menu-drag-id]')

      const id = el?.getAttribute('data-menu-drag-id')

      if (id && drag.siblingIds.includes(id)) {

        setOverId(id)

      }

    }



    const onPointerUp = () => finishDrag()

    const onKeyDown = (e: KeyboardEvent) => {

      if (e.key === 'Escape') {

        setDrag(null)

        setOverId(null)

      }

    }



    window.addEventListener('pointermove', onPointerMove)

    window.addEventListener('pointerup', onPointerUp)

    window.addEventListener('keydown', onKeyDown)

    document.body.style.cursor = 'grabbing'

    document.body.style.userSelect = 'none'



    return () => {

      window.removeEventListener('pointermove', onPointerMove)

      window.removeEventListener('pointerup', onPointerUp)

      window.removeEventListener('keydown', onKeyDown)

      document.body.style.cursor = ''

      document.body.style.userSelect = ''

    }

  }, [drag, finishDrag])



  const value = useMemo<MenuDragContextValue>(

    () => ({

      draggingId: drag?.sourceId ?? null,

      overId,

      startDrag,

    }),

    [drag?.sourceId, overId, startDrag],

  )



  return <MenuDragContext.Provider value={value}>{children}</MenuDragContext.Provider>

}



function collectDescendantIds(node: MenuTreeNode): Set<string> {

  const ids = new Set<string>()

  const walk = (n: MenuTreeNode) => {

    for (const c of n.children) {

      ids.add(c.id)

      walk(c)

    }

  }

  walk(node)

  return ids

}



function buildParentOptions(tree: MenuTreeNode[], excludeId: string): ParentOption[] {

  const excludeNode = findNode(tree, excludeId)

  const blocked = excludeNode ? collectDescendantIds(excludeNode) : new Set<string>()

  blocked.add(excludeId)



  const result: ParentOption[] = []

  const walk = (nodes: MenuTreeNode[], depth: number) => {

    for (const n of nodes) {

      if (!blocked.has(n.id)) {

        result.push({ id: n.id, label: n.label, depth })

        walk(n.children, depth + 1)

      }

    }

  }

  walk(tree, 0)

  return result

}



function findNode(tree: MenuTreeNode[], id: string): MenuTreeNode | null {

  for (const n of tree) {

    if (n.id === id) return n

    const child = findNode(n.children, id)

    if (child) return child

  }

  return null

}



function MenuItemBox({

  node,

  depth,

  siblings,

  tree,

  saving,

  reordering,

  onSaveItem,

  onRemove,

  onMove,

}: {

  node: MenuTreeNode

  depth: number

  siblings: MenuTreeNode[]

  tree: MenuTreeNode[]

} & Pick<Props, 'saving' | 'reordering' | 'onSaveItem' | 'onRemove' | 'onMove'>) {

  const { draggingId, overId, startDrag } = useMenuDrag()

  const [expanded, setExpanded] = useState(false)

  const [form, setForm] = useState<AdminNavigationMenuInput | null>(null)

  const [linkTarget, setLinkTarget] = useState<LinkTargetValue | null>(null)

  const [uiKind, setUiKind] = useState<string>('CUSTOM_URL')



  const kind = uiKindFromRow(node)

  const siblingIndex = siblings.findIndex((s) => s.id === node.id)

  const parentId = node.parentId ?? null

  const parentOptions = useMemo(() => buildParentOptions(tree, node.id), [tree, node.id])

  const siblingIds = useMemo(() => siblings.map((s) => s.id), [siblings])



  const isDragging = draggingId === node.id

  const isDropTarget = overId === node.id && draggingId !== null && draggingId !== node.id



  const openEditor = () => {

    const kind = uiKindFromRow(node)

    setForm({

      label: node.label,

      type: node.type,

      url: node.url ?? '',

      productId: node.productId,

      categoryId: node.categoryId,

      pageId: node.pageId,

      parentId: node.parentId,

      sortOrder: node.sortOrder,

      isActive: node.isActive,

      openInNewTab: node.openInNewTab,

    })

    setUiKind(kind)

    setLinkTarget(linkTargetFromRow(node, kind))

    setExpanded(true)

  }



  const handleExpand = () => {

    if (draggingId) return

    if (!expanded) openEditor()

    else setExpanded(false)

  }



  const handleSave = async () => {

    if (!form) return

    try {

      await onSaveItem(node.id, form, uiKind as UiMenuKind)

      setExpanded(false)

    } catch {

      /* parent shows error */

    }

  }



  return (

    <li className={cn(depth > 0 && 'ml-6 border-l-2 border-slate-200 pl-3')}>

      <div

        data-menu-drag-id={node.id}

        className={cn(

          'overflow-hidden rounded-md border bg-white transition-shadow',

          node.isActive ? 'border-slate-300' : 'border-slate-200 bg-slate-50 opacity-90',

          expanded && 'border-brand-400 ring-1 ring-brand-100',

          isDragging && 'opacity-50 shadow-md ring-2 ring-brand-200',

          isDropTarget && 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-300',

        )}

      >

        <div className="flex items-stretch">

          <button

            type="button"

            disabled={reordering}

            onPointerDown={(e) => {

              if (reordering) return

              e.preventDefault()

              e.stopPropagation()

              startDrag(node.id, parentId, siblingIds)

            }}

            className="flex touch-none cursor-grab items-center border-r border-slate-200 px-2.5 text-slate-400 hover:bg-slate-100 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"

            title="Sürükleyerek sırala"

            aria-label="Sürükleyerek sırala"

          >

            <GripVertical className="h-4 w-4" />

          </button>

          <button

            type="button"

            className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50"

            onClick={handleExpand}

          >

            {expanded ? (

              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />

            ) : (

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />

            )}

            <span className="min-w-0 flex-1">

              <span className="block truncate text-sm font-medium text-slate-900">

                {node.label}

                <span className="ml-2 font-normal text-slate-500">— {UI_MENU_KIND_LABELS[kind]}</span>

              </span>

              {!expanded ? (

                <span className="block truncate text-xs text-slate-400">{node.resolvedUrl || node.url || '—'}</span>

              ) : null}

            </span>

            {!node.isActive ? <span className="shrink-0 text-xs text-amber-600">Pasif</span> : null}

          </button>



          <div className="flex items-center border-l border-slate-200">

            <button

              type="button"

              className="px-2 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"

              disabled={reordering || siblingIndex === 0}

              onClick={(e) => {

                e.stopPropagation()

                onMove(node, -1)

              }}

              title="Yukarı"

            >

              <ChevronUp className="h-4 w-4" />

            </button>

            <button

              type="button"

              className="px-2 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"

              disabled={reordering || siblingIndex === siblings.length - 1}

              onClick={(e) => {

                e.stopPropagation()

                onMove(node, 1)

              }}

              title="Aşağı"

            >

              <ChevronDown className="h-4 w-4" />

            </button>

          </div>

        </div>



        {expanded && form && linkTarget ? (

          <div className="space-y-3 border-t border-slate-200 bg-slate-50/80 p-4">

            <Input label="Başlık" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />

            <div className="space-y-1">

              <span className="block text-xs font-medium text-slate-500">URL</span>

              <p className="rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">

                {node.resolvedUrl || node.url || '—'}

              </p>

            </div>

            <div className="space-y-1">

              <span className="block text-xs font-medium text-slate-500">Tür</span>

              <p className="text-sm text-slate-700">{UI_MENU_KIND_LABELS[kind as keyof typeof UI_MENU_KIND_LABELS]}</p>

            </div>

            <LinkTargetSelector

              value={linkTarget}

              onChange={(target) => {

                setLinkTarget(target)

                const { uiKind: k, patch } = applyLinkTarget(target)

                setUiKind(k)

                setForm((f) => (f ? { ...f, ...patch } : f))

              }}

            />

            <div className="space-y-1.5">

              <label className="block text-sm font-medium text-slate-700">Üst menü öğesi</label>

              <select

                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"

                value={form.parentId ?? ''}

                onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}

              >

                <option value="">Ana menü seviyesi</option>

                {parentOptions.map((p) => (

                  <option key={p.id} value={p.id}>

                    {'— '.repeat(p.depth)}

                    {p.label}

                  </option>

                ))}

              </select>

            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">

              <input

                type="checkbox"

                checked={form.openInNewTab === true}

                onChange={(e) => setForm({ ...form, openInNewTab: e.target.checked })}

              />

              Yeni sekmede aç

            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">

              <input

                type="checkbox"

                checked={form.isActive !== false}

                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}

              />

              Aktif (sitede göster)

            </label>

            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">

              <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>

                Öğeyi kaydet

              </Button>

              <Button type="button" size="sm" variant="secondary" onClick={() => setExpanded(false)}>

                Kapat

              </Button>

              <Button

                type="button"

                size="sm"

                variant="ghost"

                className="text-red-600 hover:text-red-700"

                onClick={() => onRemove(node)}

              >

                <Trash2 className="mr-1 h-3.5 w-3.5" />

                Kaldır

              </Button>

            </div>

          </div>

        ) : null}

      </div>



      {node.children.length > 0 ? (

        <ul className="mt-2 space-y-2">

          {node.children.map((child) => (

            <MenuItemBox

              key={child.id}

              node={child}

              depth={depth + 1}

              siblings={node.children}

              tree={tree}

              saving={saving}

              reordering={reordering}

              onSaveItem={onSaveItem}

              onRemove={onRemove}

              onMove={onMove}

            />

          ))}

        </ul>

      ) : null}

    </li>

  )

}



export function MenuStructurePanel({

  tree,

  flatItems,

  saving,

  reordering = false,

  onSaveItem,

  onRemove,

  onMove,

  onReorderSiblings,

  onSaveMenu,

  menuSaving,

}: Props) {

  const [menuName, setMenuName] = useState('Üst menü (Header)')



  return (

    <Card className="h-full border-slate-300">

      <CardBody className="space-y-4">

        <div>

          <h2 className="text-base font-semibold text-slate-900">Menü yapısı</h2>

          <p className="mt-1 text-xs text-slate-500">

            Sol tutamacı basılı tutup aynı seviyedeki öğenin üzerine sürükleyin. Ok tuşlarıyla da sıralayabilirsiniz.

          </p>

        </div>



        <Input label="Menü adı" value={menuName} onChange={(e) => setMenuName(e.target.value)} />



        <div className="space-y-2">

          <h3 className="text-sm font-semibold text-slate-800">Menü öğeleri</h3>

          {tree.length === 0 ? (

            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">

              Henüz menü öğesi yok. Soldan öğe seçip &quot;Menüye ekle&quot; ile başlayın.

            </p>

          ) : (

            <MenuDragProvider disabled={reordering} onReorderSiblings={onReorderSiblings}>

              <ul className="space-y-2">

                {tree.map((node) => (

                  <MenuItemBox

                    key={node.id}

                    node={node}

                    depth={0}

                    siblings={tree}

                    tree={tree}

                    saving={saving}

                    reordering={reordering}

                    onSaveItem={onSaveItem}

                    onRemove={onRemove}

                    onMove={onMove}

                  />

                ))}

              </ul>

            </MenuDragProvider>

          )}

        </div>



        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">

          <h3 className="text-sm font-semibold text-slate-800">Menü ayarları</h3>

          <ul className="list-inside list-disc text-xs text-slate-600">

            <li>Pasif öğeler public header&apos;da görünmez.</li>

            <li>Alt menü öğeleri üst öğenin altında dropdown olarak gösterilir.</li>

            <li>{flatItems.length} kayıtlı menü öğesi</li>

          </ul>

        </div>



        <Button type="button" className="w-full sm:w-auto" disabled={menuSaving} onClick={() => void onSaveMenu()}>

          {menuSaving ? 'Kaydediliyor…' : 'Menüyü kaydet'}

        </Button>

      </CardBody>

    </Card>

  )

}


