import { useEffect, useMemo, useRef, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminLegalPageEditor, type AdminLegalPageEditorHandle } from '@/components/admin/AdminLegalPageEditor'

import { Save } from 'lucide-react'

import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

import { Card, CardBody } from '@/components/ui/Card'

import { Input } from '@/components/ui/Input'

import { LoadingState } from '@/components/ui/LoadingState'

import { PageHeader } from '@/components/ui/PageHeader'

import { getErrorMessage } from '@/services/api/client'

import { pageContentService } from '@/services/api/pageContent'

import { AdminAboutEditor } from '@/components/admin/AdminAboutEditor'

import type { AboutPageContent, ContactPageContent } from '@/types/pageContent'
import { defaultAboutPageContent, defaultContactContent } from '@/types/pageContent'

import { LEGAL_PAGE_DEFINITIONS } from '@/types/legalPageContent'

import { cn } from '@/utils/cn'



type TabId = 'about' | 'contact' | `cms-${string}`



const CMS_TABS = LEGAL_PAGE_DEFINITIONS.map((d) => ({

  id: `cms-${d.key}` as TabId,

  label: d.label,

  definition: d,

}))



function TextArea({

  label,

  value,

  onChange,

  rows = 3,

}: {

  label: string

  value: string

  onChange: (value: string) => void

  rows?: number

}) {

  return (

    <div className="space-y-1.5">

      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <textarea

        value={value}

        onChange={(e) => onChange(e.target.value)}

        rows={rows}

        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"

      />

    </div>

  )

}



export function AdminPageContentsPage() {

  const queryClient = useQueryClient()

  const [tab, setTab] = useState<TabId>('about')

  const [about, setAbout] = useState<AboutPageContent>(defaultAboutPageContent)

  const [contact, setContact] = useState<ContactPageContent>(defaultContactContent)

  const [message, setMessage] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const [legalCmsMessage, setLegalCmsMessage] = useState<string | null>(null)

  const legalEditorRef = useRef<AdminLegalPageEditorHandle>(null)



  const activeCmsDef = useMemo(() => CMS_TABS.find((t) => t.id === tab)?.definition, [tab])



  const aboutQuery = useQuery({

    queryKey: ['page-content', 'about'],

    queryFn: () => pageContentService.getAbout(),

  })



  const contactQuery = useQuery({

    queryKey: ['page-content', 'contact'],

    queryFn: () => pageContentService.getContact(),

  })



  useEffect(() => {

    if (aboutQuery.data) setAbout(aboutQuery.data)

  }, [aboutQuery.data])



  useEffect(() => {

    if (contactQuery.data) setContact({ ...defaultContactContent, ...contactQuery.data })

  }, [contactQuery.data])



  const saveMutation = useMutation({

    mutationFn: async () => {

      if (tab === 'about') return pageContentService.updateAbout(about)

      if (tab === 'contact') return pageContentService.updateContact(contact)

      if (activeCmsDef) {

        const ok = await legalEditorRef.current?.save()

        if (!ok) throw new Error('Yasal sayfa kaydedilemedi')

        return

      }

    },

    onSuccess: () => {

      setMessage('Kaydedildi')

      setError(null)

      void queryClient.invalidateQueries({ queryKey: ['page-content'] })

      window.setTimeout(() => setMessage(null), 2500)

    },

    onError: (err) => {

      setError(getErrorMessage(err))

      setMessage(null)

    },

  })



  const loading = aboutQuery.isLoading || contactQuery.isLoading



  const tabGroups: { title: string; items: { id: TabId; label: string; path?: string }[] }[] = [

    {

      title: 'Sayfalar',

      items: [

        { id: 'about', label: 'Hakkımızda', path: '/hakkimizda' },

        { id: 'contact', label: 'İletişim', path: '/iletisim' },

      ],

    },

    {

      title: 'Yasal sayfalar (CMS)',

      items: CMS_TABS.map((t) => ({ id: t.id, label: t.label, path: t.definition.path })),

    },

  ]



  return (

    <div className="w-full min-w-0 space-y-6">

      <PageHeader

        title="İçerikler"

        description="Sayfa metinleri ve CMS yasal sayfaları — PUT /api/page-content/:key"

      />



      <Card className="border-brand-200 bg-brand-50/50">

        <CardBody className="text-sm text-slate-700">

          Ön bilgilendirme, mesafeli satış, elektronik ileti, pazarlama açık rıza ve checkout yasal belgeleri{' '}

          <Link to="/admin/yasal-metinler" className="font-semibold text-brand-700 hover:underline">

            Yasal Metinler

          </Link>{' '}

          sayfasından yönetilir (<code className="rounded bg-white px-1">/api/admin/legal-documents</code>).

        </CardBody>

      </Card>



      <div className="space-y-4">

        {tabGroups.map((group) => (

          <div key={group.title}>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>

            <div className="flex flex-wrap gap-2">

              {group.items.map((item) => (

                <button

                  key={item.id}

                  type="button"

                  onClick={() => {

                    setTab(item.id)

                    setLegalCmsMessage(null)

                  }}

                  className={cn(

                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition',

                    tab === item.id

                      ? 'border-brand-600 bg-brand-50 text-brand-700'

                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',

                  )}

                >

                  {item.label}

                </button>

              ))}

            </div>

          </div>

        ))}

      </div>



      {loading ? <LoadingState label="İçerikler yükleniyor…" /> : null}



      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}



      {!loading && tab === 'about' ? <AdminAboutEditor value={about} onChange={setAbout} /> : null}



      {!loading && tab === 'contact' ? (

        <Card>

          <CardBody className="space-y-4">

            <Input label="Hero başlık" value={contact.heroTitle ?? ''} onChange={(e) => setContact((p) => ({ ...p, heroTitle: e.target.value }))} />

            <TextArea label="Hero alt başlık" value={contact.heroSubtitle ?? ''} onChange={(v) => setContact((p) => ({ ...p, heroSubtitle: v }))} />

            <Input label="E-posta" value={contact.email ?? ''} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} />

            <Input label="Telefon" value={contact.phone ?? ''} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} />

            <TextArea label="Adres" value={contact.address ?? ''} onChange={(v) => setContact((p) => ({ ...p, address: v }))} />

            <Input label="Form başlığı" value={contact.formTitle ?? ''} onChange={(e) => setContact((p) => ({ ...p, formTitle: e.target.value }))} />

          </CardBody>

        </Card>

      ) : null}



      {!loading && activeCmsDef ? (

        <>

          {legalCmsMessage ? <p className="text-sm text-emerald-600">{legalCmsMessage}</p> : null}

          <AdminLegalPageEditor

            key={activeCmsDef.key}

            ref={legalEditorRef}

            definition={activeCmsDef}

            onMessage={(msg) => {

              if (msg?.type === 'success') setLegalCmsMessage(msg.text)

              if (msg?.type === 'error') setError(msg.text)

            }}

          />

        </>

      ) : null}



      <div className="flex justify-end">

        <Button onClick={() => void saveMutation.mutateAsync()} disabled={saveMutation.isPending || loading}>

          <Save className="h-4 w-4" />

          {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}

        </Button>

      </div>

    </div>

  )

}

