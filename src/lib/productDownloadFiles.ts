export type ProductDownloadFileType = 'setup' | 'portable' | 'other'

export type ProductDownloadFileEntry = {
  label: string
  url: string
  version?: string
  size?: string
  type?: ProductDownloadFileType
  sha256?: string
  buttonLabel?: string
}

export type ProductDownloadFilesConfig = {
  version?: string
  publicFreeDownload?: boolean
  showAfterPaymentOnly?: boolean
  files: ProductDownloadFileEntry[]
}

export type PublicProductDownloadFile = Pick<
  ProductDownloadFileEntry,
  'label' | 'url' | 'version' | 'size' | 'type' | 'buttonLabel'
>

export const DEFAULT_SETUP_FILE: ProductDownloadFileEntry = {
  label: 'Kurulum Sürümü',
  url: '',
  version: '',
  size: '',
  type: 'setup',
  sha256: '',
  buttonLabel: 'Kurulum Sürümünü İndir',
}

export const DEFAULT_PORTABLE_FILE: ProductDownloadFileEntry = {
  label: 'Portable Sürüm',
  url: '',
  version: '',
  size: '',
  type: 'portable',
  sha256: '',
  buttonLabel: 'Portable Sürümü İndir',
}

export function emptyDownloadFilesConfig(): ProductDownloadFilesConfig {
  return {
    version: '',
    publicFreeDownload: true,
    showAfterPaymentOnly: true,
    files: [
      { ...DEFAULT_SETUP_FILE },
      { ...DEFAULT_PORTABLE_FILE },
    ],
  }
}

function labelForType(type: ProductDownloadFileType | undefined, rawLabel: string): string {
  if (rawLabel.trim()) return rawLabel.trim()
  if (type === 'setup') return DEFAULT_SETUP_FILE.label
  if (type === 'portable') return DEFAULT_PORTABLE_FILE.label
  return ''
}

function parseFile(raw: unknown): ProductDownloadFileEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const typeRaw = row.type
  const type =
    typeRaw === 'setup' || typeRaw === 'portable' || typeRaw === 'other' ? typeRaw : undefined
  const label = labelForType(type, typeof row.label === 'string' ? row.label : '')
  if (!label) return null
  const url = typeof row.url === 'string' ? row.url : ''
  return {
    label,
    url,
    version: typeof row.version === 'string' ? row.version : '',
    size: typeof row.size === 'string' ? row.size : '',
    type,
    sha256: typeof row.sha256 === 'string' ? row.sha256 : '',
    buttonLabel: typeof row.buttonLabel === 'string' ? row.buttonLabel : '',
  }
}

/** Setup ve portable slotlarını her zaman korur; API yanıtı eksik olsa bile form alanları kaybolmaz. */
export function ensureDownloadFileSlots(files: ProductDownloadFileEntry[]): ProductDownloadFileEntry[] {
  const setup = files.find((f) => f.type === 'setup')
  const portable = files.find((f) => f.type === 'portable')
  const other = files.find((f) => f.type !== 'setup' && f.type !== 'portable')

  const setupSlot: ProductDownloadFileEntry = {
    ...DEFAULT_SETUP_FILE,
    ...(setup ?? (files[0]?.type !== 'portable' ? files[0] : undefined)),
    type: 'setup',
    label: labelForType('setup', setup?.label ?? files[0]?.label ?? ''),
    buttonLabel:
      (setup?.buttonLabel ?? files[0]?.buttonLabel ?? DEFAULT_SETUP_FILE.buttonLabel) || DEFAULT_SETUP_FILE.buttonLabel,
  }

  const portableSlot: ProductDownloadFileEntry = {
    ...DEFAULT_PORTABLE_FILE,
    ...(portable ?? (files[1]?.type === 'portable' ? files[1] : other)),
    type: 'portable',
    label: labelForType('portable', portable?.label ?? files[1]?.label ?? ''),
    buttonLabel:
      (portable?.buttonLabel ?? files[1]?.buttonLabel ?? DEFAULT_PORTABLE_FILE.buttonLabel) ||
      DEFAULT_PORTABLE_FILE.buttonLabel,
  }

  return [setupSlot, portableSlot]
}

export type NormalizeDownloadFilesOptions = {
  fallbackDownloadUrl?: string
}

export function normalizeDownloadFilesConfig(
  raw: unknown,
  options?: NormalizeDownloadFilesOptions,
): ProductDownloadFilesConfig {
  const base = emptyDownloadFilesConfig()
  if (!raw || typeof raw !== 'object') {
    if (options?.fallbackDownloadUrl?.trim()) {
      base.files = ensureDownloadFileSlots([
        { ...DEFAULT_SETUP_FILE, url: options.fallbackDownloadUrl.trim() },
        { ...DEFAULT_PORTABLE_FILE },
      ])
    }
    return base
  }

  const row = raw as Record<string, unknown>
  const parsedFiles = Array.isArray(row.files)
    ? row.files.map(parseFile).filter((f): f is ProductDownloadFileEntry => f !== null)
    : []

  let files = ensureDownloadFileSlots(parsedFiles.length > 0 ? parsedFiles : base.files)

  if (!files.some((f) => f.url.trim()) && options?.fallbackDownloadUrl?.trim()) {
    files = ensureDownloadFileSlots([
      { ...files[0], url: options.fallbackDownloadUrl.trim() },
      files[1],
    ])
  }

  return {
    version: typeof row.version === 'string' ? row.version : base.version ?? '',
    publicFreeDownload: row.publicFreeDownload !== false,
    showAfterPaymentOnly: row.showAfterPaymentOnly !== false,
    files,
  }
}

export function buildAdminDownloadFilesFormState(
  downloadFiles: unknown,
  fallbackDownloadUrl?: string | null,
): ProductDownloadFilesConfig {
  return normalizeDownloadFilesConfig(downloadFiles, {
    fallbackDownloadUrl: fallbackDownloadUrl?.trim() || undefined,
  })
}

export function hasConfiguredDownloadFiles(config: ProductDownloadFilesConfig | null | undefined): boolean {
  if (!config?.files?.length) return false
  return config.files.some((f) => f.url.trim().length > 0)
}

export function hasSetupDownloadFile(config: ProductDownloadFilesConfig | null | undefined): boolean {
  if (!config?.files?.length) return false
  return config.files.some((f) => f.type === 'setup' && f.url.trim().length > 0)
}

export function hasPortableDownloadFile(config: ProductDownloadFilesConfig | null | undefined): boolean {
  if (!config?.files?.length) return false
  return config.files.some((f) => f.type === 'portable' && f.url.trim().length > 0)
}

export function downloadFilesForApi(config: ProductDownloadFilesConfig): ProductDownloadFilesConfig | null {
  const files = ensureDownloadFileSlots(config.files)
    .map((f) => ({
      label: f.label.trim(),
      url: f.url.trim(),
      version: f.version?.trim() || undefined,
      size: f.size?.trim() || undefined,
      type: f.type,
      sha256: f.sha256?.trim() || undefined,
      buttonLabel: f.buttonLabel?.trim() || undefined,
    }))
    .filter((f) => f.label && f.url)

  const version = config.version?.trim()
  if (files.length === 0 && !version) return null

  return {
    version: version || undefined,
    publicFreeDownload: config.publicFreeDownload !== false,
    showAfterPaymentOnly: config.showAfterPaymentOnly !== false,
    files,
  }
}

/** Boş form state ile mevcut DB kaydının üzerine yazmayı engeller. */
export function resolveDownloadFilesSavePayload(
  formConfig: ProductDownloadFilesConfig | null | undefined,
  existingDownloadFiles: unknown | null | undefined,
): ProductDownloadFilesConfig | undefined {
  const fromForm = downloadFilesForApi(formConfig ?? emptyDownloadFilesConfig())
  if (fromForm) return fromForm

  const existing = downloadFilesForApi(normalizeDownloadFilesConfig(existingDownloadFiles))
  if (existing) return undefined

  return undefined
}

export function defaultButtonLabel(file: ProductDownloadFileEntry): string {
  if (file.buttonLabel?.trim()) return file.buttonLabel.trim()
  if (file.type === 'setup') return 'Kurulum Sürümünü İndir'
  if (file.type === 'portable') return 'Portable Sürümü İndir'
  return file.label.trim() || 'İndir'
}
