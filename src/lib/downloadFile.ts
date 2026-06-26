import { getApiRootUrl } from '@/utils/env'

/** Ücretsiz indirme endpoint’inin tam URL’si (dev proxy / prod Vercel rewrite uyumlu). */
export function resolveFreeDownloadHref(downloadPath: string): string {
  const path = downloadPath.startsWith('/') ? downloadPath : `/${downloadPath}`
  if (typeof window === 'undefined') return path

  const apiRoot = getApiRootUrl()
  if (apiRoot.startsWith('http://') || apiRoot.startsWith('https://')) {
    return `${apiRoot}${path}`
  }
  return `${window.location.origin}${path}`
}

let downloadIframe: HTMLIFrameElement | null = null

function getDownloadIframe(): HTMLIFrameElement {
  if (downloadIframe && document.body.contains(downloadIframe)) {
    return downloadIframe
  }
  downloadIframe = document.createElement('iframe')
  downloadIframe.id = 'woontegra-download-iframe'
  downloadIframe.name = 'woontegra-download-iframe'
  downloadIframe.style.cssText =
    'position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none'
  downloadIframe.setAttribute('aria-hidden', 'true')
  downloadIframe.setAttribute('tabindex', '-1')
  document.body.appendChild(downloadIframe)
  return downloadIframe
}

/**
 * Ücretsiz ürün indirmesi — sayfa navigasyonu, fetch/blob veya R2 URL yok.
 * Attachment stream hidden iframe üzerinden başlatılır.
 */
export async function triggerFreeProductDownload(downloadPath: string): Promise<void> {
  const href = resolveFreeDownloadHref(downloadPath)

  const check = await fetch(href, { method: 'HEAD', credentials: 'same-origin' })
  if (!check.ok) {
    throw new Error('Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.')
  }

  const iframe = getDownloadIframe()
  iframe.src = 'about:blank'
  window.setTimeout(() => {
    iframe.src = href
  }, 0)
}
