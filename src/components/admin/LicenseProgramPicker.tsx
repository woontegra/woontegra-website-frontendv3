import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  adminLicenseProgramsService,
  getErrorMessage,
  type LicenseProgram,
  type LicenseProgramCreateInput,
} from '@/services/api/adminLicensePrograms'
import { cn } from '@/utils/cn'

const APP_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/

type Props = {
  value: string | null
  onChange: (appCode: string) => void
  onProgramSelected?: (program: LicenseProgram | null) => void
  disabled?: boolean
  className?: string
}

function emptyCreateForm(): LicenseProgramCreateInput {
  return {
    appCode: '',
    name: '',
    defaultLicenseDays: 365,
    defaultMaxDevices: 1,
    isActive: true,
  }
}

export function LicenseProgramPicker({
  value,
  onChange,
  onProgramSelected,
  disabled,
  className,
}: Props) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<LicenseProgramCreateInput>(emptyCreateForm)
  const [createError, setCreateError] = useState<string | null>(null)

  const programsQuery = useQuery({
    queryKey: ['admin', 'license-programs'],
    queryFn: () => adminLicenseProgramsService.list(false),
    staleTime: 60_000,
  })

  const programs = programsQuery.data ?? []
  const selectedProgram = programs.find((p) => p.appCode === value) ?? null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return programs
    return programs.filter(
      (p) => p.appCode.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    )
  }, [programs, search])

  const createMutation = useMutation({
    mutationFn: (payload: LicenseProgramCreateInput) => adminLicenseProgramsService.create(payload),
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'license-programs'] })
      onChange(program.appCode)
      onProgramSelected?.(program)
      setModalOpen(false)
      setCreateForm(emptyCreateForm())
      setCreateError(null)
    },
    onError: (err) => setCreateError(getErrorMessage(err)),
  })

  const handleSelect = (appCode: string) => {
    onChange(appCode)
    const program = programs.find((p) => p.appCode === appCode) ?? null
    onProgramSelected?.(program)
  }

  const submitCreate = () => {
    const appCode = createForm.appCode.trim().toUpperCase()
    const name = createForm.name.trim()
    if (!name) {
      setCreateError('Program adı zorunludur.')
      return
    }
    if (!appCode || !APP_CODE_PATTERN.test(appCode)) {
      setCreateError('AppCode büyük harf, rakam ve alt çizgi içermeli (ör. WOONTEGRA_ISLETME_KASASI).')
      return
    }
    createMutation.mutate({ ...createForm, appCode, name })
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Lisans programı</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Program ara…"
              disabled={disabled}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || programsQuery.isFetching}
          onClick={() => programsQuery.refetch()}
        >
          <RefreshCw className={cn('mr-1.5 h-4 w-4', programsQuery.isFetching && 'animate-spin')} />
          Yenile
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => setModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Yeni program
        </Button>
      </div>

      {programsQuery.isError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Lisans programları yüklenemedi: {getErrorMessage(programsQuery.error)}. Lisans sunucusu bağlantısını kontrol
          edin.
        </p>
      ) : null}

      <select
        value={value ?? ''}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled || programsQuery.isLoading}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">{programsQuery.isLoading ? 'Programlar yükleniyor…' : 'Program seçin'}</option>
        {filtered.map((p) => (
          <option key={p.appCode} value={p.appCode}>
            {p.name} ({p.appCode}){p.isActive ? '' : ' — pasif'}
          </option>
        ))}
      </select>

      {selectedProgram ? (
        <p className="text-xs text-slate-500">
          {selectedProgram.isActive ? (
            <span className="text-emerald-700">Aktif program</span>
          ) : (
            <span className="text-amber-700">Pasif program — satışa açılamaz</span>
          )}
          {' · '}
          Varsayılan: {selectedProgram.defaultLicenseDays} gün, {selectedProgram.defaultMaxDevices} cihaz
        </p>
      ) : value ? (
        <p className="text-xs text-amber-700">
          Seçili appCode ({value}) lisans sunucusu listesinde görünmüyor. Programı oluşturun veya listeyi yenileyin.
        </p>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Yeni lisans programı</h3>
            <p className="mt-1 text-xs text-slate-500">
              Program merkezi lisans sunucusuna kaydedilir; deploy gerekmez.
            </p>
            <div className="mt-4 space-y-3">
              <Input
                label="Program adı"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="AppCode"
                value={createForm.appCode}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, appCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))
                }
                placeholder="WOONTEGRA_ISLETME_KASASI"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Varsayılan süre (gün)"
                  type="number"
                  min={1}
                  max={3650}
                  value={createForm.defaultLicenseDays ?? 365}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      defaultLicenseDays: Number.parseInt(e.target.value, 10) || 365,
                    }))
                  }
                />
                <Input
                  label="Cihaz limiti"
                  type="number"
                  min={1}
                  max={50}
                  value={createForm.defaultMaxDevices ?? 1}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      defaultMaxDevices: Number.parseInt(e.target.value, 10) || 1,
                    }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={createForm.isActive !== false}
                  onChange={(e) => setCreateForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                Aktif
              </label>
              {createError ? <p className="text-xs text-red-600">{createError}</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                İptal
              </Button>
              <Button type="button" disabled={createMutation.isPending} onClick={submitCreate}>
                {createMutation.isPending ? 'Kaydediliyor…' : 'Oluştur'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function licenseProgramReadinessLabel(
  licenseRequired: boolean,
  licenseAppCode: string | null | undefined,
  program: LicenseProgram | null | undefined,
): { label: string; tone: 'success' | 'warning' | 'danger' | 'default' } {
  if (!licenseRequired) return { label: 'Merkezi lisans yok', tone: 'default' }
  if (!licenseAppCode?.trim()) return { label: 'AppCode eksik', tone: 'danger' }
  if (!program) return { label: 'AppCode lisans server’da yok', tone: 'danger' }
  if (!program.isActive) return { label: 'Lisans programı pasif', tone: 'warning' }
  return { label: 'Lisans programı aktif', tone: 'success' }
}
