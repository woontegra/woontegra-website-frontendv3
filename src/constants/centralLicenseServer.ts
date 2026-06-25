/** Woontegra-Lisans-Server — frontend bilgi referansı (sunucu/backend değiştirilmez). */

export const CENTRAL_LICENSE_PUBLIC_MESSAGE =
  'Lisanslar website içinde üretilmez. Merkezi Woontegra Lisans Server üzerinden yönetilir; ödeme onayı sonrası lisans bilgileri e-posta ile iletilir.'

export const CENTRAL_LICENSE_EMAIL_MESSAGE =
  'Ödeme onaylandıktan sonra lisans bilgileriniz merkezi Woontegra Lisans Server üzerinden hazırlanıp e-posta adresinize iletilecektir.'

export const CENTRAL_LICENSE_PENDING_ADMIN =
  'Merkezi lisans server tarafından hazırlanması veya senkron bekleniyor. Website bu ekranda lisans oluşturmaz.'

/** Lisans server API özeti (Woontegra-Lisans-Server/backend) */
export const LICENSE_SERVER_API = {
  health: 'GET /health',
  websiteProvision: 'POST /api/integrations/website/order-license (x-integration-secret)',
  publicActivate: 'POST /api/public/license/activate',
  publicValidate: 'POST /api/public/license/validate',
  adminPrograms: 'GET /api/admin/programs (appCode)',
  adminLicenses: 'GET /api/admin/licenses',
} as const

/** Website backend → lisans server (sunucu tarafı, env) */
export const WEBSITE_BACKEND_LICENSE_INTEGRATION = {
  envUrl: 'LICENSE_SERVER_URL',
  envSecret: 'LICENSE_SERVER_INTEGRATION_SECRET',
  clientEndpoint: 'POST {LICENSE_SERVER_URL}/api/integrations/website/order-license',
  note: 'Website backend ödeme sonrası ensureExternalLicenseServerOrders ile merkezi sunucuya bildirir.',
} as const
