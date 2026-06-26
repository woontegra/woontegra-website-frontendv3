import { Input } from '@/components/ui/Input'
import type { ProductDownloadFilesConfig, ProductDownloadFileEntry } from '@/lib/productDownloadFiles'
import { ensureDownloadFileSlots } from '@/lib/productDownloadFiles'

function HelpBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-950">
      {children}
    </p>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  )
}

function FileBlock({
  title,
  file,
  onChange,
}: {
  title: string
  file: ProductDownloadFileEntry
  onChange: (next: ProductDownloadFileEntry) => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <Input
        label="R2 URL"
        value={file.url}
        onChange={(e) => onChange({ ...file, url: e.target.value })}
        placeholder="https://…r2.dev/…exe"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Sürüm"
          value={file.version ?? ''}
          onChange={(e) => onChange({ ...file, version: e.target.value })}
          placeholder="1.0.0"
        />
        <Input
          label="Dosya boyutu"
          value={file.size ?? ''}
          onChange={(e) => onChange({ ...file, size: e.target.value })}
          placeholder="171 MB"
        />
      </div>
      <Input
        label="İndirme butonu başlığı"
        value={file.buttonLabel ?? ''}
        onChange={(e) => onChange({ ...file, buttonLabel: e.target.value })}
        placeholder={file.label}
      />
      <Input
        label="SHA256 (opsiyonel)"
        value={file.sha256 ?? ''}
        onChange={(e) => onChange({ ...file, sha256: e.target.value })}
        placeholder="Dosya özeti"
      />
    </div>
  )
}

type Props = {
  value: ProductDownloadFilesConfig
  onChange: (next: ProductDownloadFilesConfig) => void
  showFreeFlags?: boolean
}

export function ProductR2DownloadFilesSection({ value, onChange, showFreeFlags = true }: Props) {
  const slots = ensureDownloadFileSlots(value.files)
  const setup = slots[0]
  const portable = slots[1]

  const updateFile = (type: 'setup' | 'portable', next: ProductDownloadFileEntry) => {
    const typedNext = { ...next, type }
    const files = slots.map((f) => (f.type === type ? typedNext : f))
    onChange({ ...value, files: ensureDownloadFileSlots(files) })
  }

  return (
    <div className="space-y-4 rounded-lg border border-violet-200 bg-violet-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">R2 İndirme Dosyaları</p>
        <p className="mt-1 text-xs text-slate-600">
          woontegra-downloads bucket üzerindeki public R2 URL’lerini girin. Ücretsiz araçlarda public sayfada doğrudan
          indirme butonu olarak gösterilir.
        </p>
      </div>

      <HelpBox>
        Kurulum ve portable sürümler için tam https:// R2 adresi kullanın. Ücretli ürünlerde URL’ler yalnızca ödeme
        sonrası e-posta / hesabım üzerinden paylaşılır.
      </HelpBox>

      <Input
        label="Genel sürüm"
        value={value.version ?? ''}
        onChange={(e) => onChange({ ...value, version: e.target.value })}
        placeholder="1.0.0"
      />

      {setup ? (
        <FileBlock title="Kurulum sürümü" file={setup} onChange={(f) => updateFile('setup', f)} />
      ) : null}
      {portable ? (
        <FileBlock title="Portable sürüm" file={portable} onChange={(f) => updateFile('portable', f)} />
      ) : null}

      {showFreeFlags ? (
        <div className="space-y-2">
          <CheckboxField
            label="Ücretsiz indirilebilir"
            checked={value.publicFreeDownload !== false}
            onChange={(v) => onChange({ ...value, publicFreeDownload: v })}
            description="Açıkken ücretsiz ürün detay sayfasında R2 indirme butonları gösterilir."
          />
          <CheckboxField
            label="Ödeme sonrası gösterilsin"
            checked={value.showAfterPaymentOnly !== false}
            onChange={(v) => onChange({ ...value, showAfterPaymentOnly: v })}
            description="Ücretli ürünlerde R2 dosyaları yalnızca ödeme onayı sonrası iletilir (publicte gizli kalır)."
          />
        </div>
      ) : null}
    </div>
  )
}
