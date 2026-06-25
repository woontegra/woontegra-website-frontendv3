import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react'
import { AdminTechnicalDetails } from '@/components/admin/AdminTechnicalDetails'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  LinkTargetSelector,
  hrefToLinkTarget,
  resolveLinkTargetHref,
  type LinkTargetValue,
} from '@/components/admin/LinkTargetSelector'
import {
  defaultFooterGroupsBundle,
  type FooterGroupConfig,
  type FooterGroupsBundle,
  type FooterLinkConfig,
} from '@/data/footerGroupsContent'
import { getErrorMessage } from '@/services/api/client'
import { footerGroupsService } from '@/services/api/footerGroups'

function newLink(order: number): FooterLinkConfig {
  return { id: crypto.randomUUID(), label: 'Yeni link', href: '/', order, enabled: true, openInNewTab: false }
}

function newGroup(order: number): FooterGroupConfig {
  return { id: crypto.randomUUID(), title: 'Yeni Grup', order, enabled: true, links: [] }
}

export function AdminFooterManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const quickHandled = useRef(false)
  const [bundle, setBundle] = useState<FooterGroupsBundle>(defaultFooterGroupsBundle)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ groupIndex: number; linkIndex: number } | null>(null)
  const [linkTarget, setLinkTarget] = useState<LinkTargetValue>({ kind: 'custom-url', url: '/' })
  const [quickHint, setQuickHint] = useState<string | null>(null)

  useEffect(() => {
    void footerGroupsService.get().then((data) => {
      setBundle(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (quickHandled.current || loading) return
    if (searchParams.get('quick') !== 'footer') return

    const label = searchParams.get('label') ?? 'Yeni link'
    const path = searchParams.get('path') ?? '/'
    const groupId = searchParams.get('groupId') ?? 'yasal'
    const sitePageKey = searchParams.get('sitePageKey')

    const gi = bundle.groups.findIndex((g) => g.id === groupId)
    const targetIndex = gi >= 0 ? gi : bundle.groups.findIndex((g) => g.id === 'yasal')
    if (targetIndex < 0) return

    quickHandled.current = true
    const groups = [...bundle.groups]
    const group = groups[targetIndex]
    const newLinkItem = newLink(group.links.length)
    newLinkItem.label = label
    newLinkItem.href = path
    groups[targetIndex] = { ...group, links: [...group.links, newLinkItem] }
    setBundle({ groups: groups.map((g, i) => ({ ...g, order: i })) })
    setEditingLink({ groupIndex: targetIndex, linkIndex: group.links.length })
    setLinkTarget(
      sitePageKey
        ? { kind: 'site-page', sitePageKey, url: path }
        : { kind: 'custom-url', url: path },
    )
    setSearchParams({}, { replace: true })
    const groupTitle = groups[targetIndex]?.title ?? 'Footer grubu'
    setQuickHint(
      `“${label}” linki ${groupTitle} grubuna eklendi. Hedefi kontrol edip üstteki Kaydet butonuna basarak yayınlayın.`,
    )
    document.getElementById('footer-groups')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [bundle.groups, loading, searchParams, setSearchParams])

  const updateGroups = (groups: FooterGroupConfig[]) =>
    setBundle({ groups: groups.map((group, i) => ({ ...group, order: i })) })

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const saved = await footerGroupsService.save(bundle)
      setBundle(saved)
      setMessage('Kaydedildi')
      setQuickHint(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const applyLinkTargetToLink = (groupIndex: number, linkIndex: number, target: LinkTargetValue) => {
    const groups = [...bundle.groups]
    const group = groups[groupIndex]
    const links = [...group.links]
    const link = links[linkIndex]
    const resolved = resolveLinkTargetHref(target)
    links[linkIndex] = {
      ...link,
      href: resolved.action ? undefined : resolved.href,
      action: resolved.action,
      openInNewTab: target.kind === 'external-url' ? true : link.openInNewTab,
    }
    groups[groupIndex] = { ...group, links }
    updateGroups(groups)
    setLinkTarget(target)
  }

  if (loading) return <LoadingState label="Footer yükleniyor…" />

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Footer Yönetimi"
        description="Footer grupları ve bağlantıları. Yasal grup sırası korunur; Çerez Tercihleri aksiyon olarak kalır."
        actions={
          <Button disabled={saving} onClick={() => void handleSave()}>
            <Save className="h-4 w-4" />
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        }
      />

      <AdminTechnicalDetails items={[{ label: 'API', value: 'PUT /api/page-content/footerGroups' }]} />

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {quickHint ? (
        <Card className="border-brand-200 bg-brand-50">
          <CardBody className="text-sm text-brand-900">{quickHint}</CardBody>
        </Card>
      ) : null}

      <Button variant="secondary" onClick={() => updateGroups([...bundle.groups, newGroup(bundle.groups.length)])}>
        + Grup ekle
      </Button>

      <div id="footer-groups" className="space-y-4">
        {bundle.groups.map((group, gi) => (
          <Card key={group.id}>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={gi === 0}
                    onClick={() => {
                      const groups = [...bundle.groups]
                      ;[groups[gi - 1], groups[gi]] = [groups[gi], groups[gi - 1]]
                      updateGroups(groups)
                    }}
                    className="text-slate-400 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={gi === bundle.groups.length - 1}
                    onClick={() => {
                      const groups = [...bundle.groups]
                      ;[groups[gi], groups[gi + 1]] = [groups[gi + 1], groups[gi]]
                      updateGroups(groups)
                    }}
                    className="text-slate-400 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <input
                  className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                  value={group.title}
                  onChange={(e) => {
                    const groups = [...bundle.groups]
                    groups[gi] = { ...group, title: e.target.value }
                    updateGroups(groups)
                  }}
                  placeholder="Grup başlığı"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={group.enabled}
                    onChange={(e) => {
                      const groups = [...bundle.groups]
                      groups[gi] = { ...group, enabled: e.target.checked }
                      updateGroups(groups)
                    }}
                  />
                  Aktif
                </label>
                <button type="button" onClick={() => updateGroups(bundle.groups.filter((_, i) => i !== gi))} className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 border-l-2 border-slate-200 pl-4">
                {group.links.map((link, li) => (
                  <div key={link.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                        value={link.label}
                        onChange={(e) => {
                          const groups = [...bundle.groups]
                          const links = [...group.links]
                          links[li] = { ...link, label: e.target.value }
                          groups[gi] = { ...group, links }
                          updateGroups(groups)
                        }}
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(e) => {
                            const groups = [...bundle.groups]
                            const links = [...group.links]
                            links[li] = { ...link, enabled: e.target.checked }
                            groups[gi] = { ...group, links }
                            updateGroups(groups)
                          }}
                        />
                        Aktif
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={link.openInNewTab === true}
                          onChange={(e) => {
                            const groups = [...bundle.groups]
                            const links = [...group.links]
                            links[li] = { ...link, openInNewTab: e.target.checked }
                            groups[gi] = { ...group, links }
                            updateGroups(groups)
                          }}
                        />
                        Yeni sekme
                      </label>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingLink({ groupIndex: gi, linkIndex: li })
                          setLinkTarget(hrefToLinkTarget(link.href, link.action))
                        }}
                      >
                        Hedef
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          const groups = [...bundle.groups]
                          groups[gi] = { ...group, links: group.links.filter((_, i) => i !== li) }
                          updateGroups(groups)
                        }}
                        className="text-xs text-red-600"
                      >
                        Sil
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {link.action === 'cookie-preferences' ? 'Çerez Tercihleri (modal aksiyon)' : link.href ?? '/'}
                    </p>
                    {editingLink?.groupIndex === gi && editingLink.linkIndex === li ? (
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <LinkTargetSelector
                          value={linkTarget}
                          allowCookiePreferences
                          onChange={(target) => applyLinkTargetToLink(gi, li, target)}
                        />
                        <Button type="button" size="sm" className="mt-2" variant="secondary" onClick={() => setEditingLink(null)}>
                          Tamam
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const groups = [...bundle.groups]
                    groups[gi] = { ...group, links: [...group.links, newLink(group.links.length)] }
                    updateGroups(groups)
                  }}
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  + Link ekle
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
