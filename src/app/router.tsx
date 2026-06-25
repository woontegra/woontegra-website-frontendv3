import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SiteLayout } from '@/layouts/SiteLayout'
import { AdminGuard } from '@/app/guards'
import { LegacyAdminProductRedirect } from '@/app/adminLegacyRedirects'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage'
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage'
import { AdminLicensesPage } from '@/pages/admin/AdminLicensesPage'
import { AdminLicenseDetailPage } from '@/pages/admin/AdminLicenseDetailPage'
import { AdminLicenseSettingsPage } from '@/pages/admin/AdminLicenseSettingsPage'
import { AdminProductListPage } from '@/pages/admin/AdminProductListPage'
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage'
import { AdminProductCategoriesPage } from '@/pages/admin/AdminProductCategoriesPage'
import { AdminBrandsPage } from '@/pages/admin/AdminBrandsPage'
import { AdminBlogListPage } from '@/pages/admin/AdminBlogListPage'
import { AdminBlogFormPage } from '@/pages/admin/AdminBlogFormPage'
import { AdminLegalDocumentsPage } from '@/pages/admin/AdminLegalDocumentsPage'
import { AdminLegalDocumentFormPage } from '@/pages/admin/AdminLegalDocumentFormPage'
import { AdminPageContentsRedirectPage } from '@/pages/admin/AdminPageContentsRedirectPage'
import { AdminPagesListPage } from '@/pages/admin/AdminPagesListPage'
import { AdminPageEditPage } from '@/pages/admin/AdminPageEditPage'
import { AdminPagesNewPage } from '@/pages/admin/AdminPagesNewPage'
import { AdminCmsPageEditPage } from '@/pages/admin/AdminCmsPageEditPage'
import { AdminNavigationMenuPage } from '@/pages/admin/AdminNavigationMenuPage'
import { AdminHomePage } from '@/pages/admin/AdminHomePage'
import { AdminFooterManagementPage } from '@/pages/admin/AdminFooterManagementPage'
import { AdminContactMessagesPage } from '@/pages/admin/AdminContactMessagesPage'
import { AdminMediaLibraryPage } from '@/pages/admin/AdminMediaLibraryPage'
import { AdminSiteSettingsPage } from '@/pages/admin/AdminSiteSettingsPage'
import { AdminPaymentSettingsPage } from '@/pages/admin/AdminPaymentSettingsPage'
import { AdminEmailSettingsPage } from '@/pages/admin/AdminEmailSettingsPage'
import { AdminFeaturesPage } from '@/pages/admin/AdminFeaturesPage'
import { AdminCampaignsPage } from '@/pages/admin/AdminCampaignsPage'
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminActivityLogPage } from '@/pages/admin/AdminActivityLogPage'
import { AdminSeoPage } from '@/pages/admin/AdminSeoPage'
import { AdminAppearanceSettingsPage } from '@/pages/admin/AdminAppearanceSettingsPage'
import { AdminUserSettingsPage } from '@/pages/admin/AdminUserSettingsPage'
import { HomePage } from '@/pages/site/HomePage'
import { SoftwareListPage } from '@/pages/site/SoftwareListPage'
import { SoftwareDetailPage } from '@/pages/site/SoftwareDetailPage'
import { AboutPage } from '@/pages/site/AboutPage'
import { ContactPage } from '@/pages/site/ContactPage'
import { BlogListPage } from '@/pages/site/BlogListPage'
import { BlogDetailPage } from '@/pages/site/BlogDetailPage'
import { LegacyProductRedirect } from '@/app/legacyRedirects'
import {
  LegacyCheckoutSlugRedirect,
  LegacyOrderFailRedirect,
  LegacyOrderSuccessRedirect,
} from '@/app/checkoutLegacyRedirects'
import { ProductCheckoutPage } from '@/pages/site/ProductCheckoutPage'
import { PaymentSuccessPage } from '@/pages/site/PaymentSuccessPage'
import { PaymentFailPage } from '@/pages/site/PaymentFailPage'
import {
  CookiePolicyPage,
  DistanceSalesPage,
  KvkkPage,
  PreInformationPage,
  PrivacyPage,
  RefundPolicyPage,
  AcikRizaMetniPage,
  KullanimSartlariPage,
  LegalCheckoutDocumentBySlugPage,
} from '@/pages/site/legal/LegalPublicPages'
import { DynamicCmsPage } from '@/pages/site/DynamicCmsPage'
import { LegalTypeDocumentPage } from '@/pages/site/legal/LegalTypeDocumentPage'
import { ServicesPage } from '@/pages/site/ServicesPage'
import { SolutionsPage } from '@/pages/site/SolutionsPage'
import { FaqPage } from '@/pages/site/FaqPage'
import { QuotePage } from '@/pages/site/QuotePage'
import { UcretsizAraclarPage } from '@/pages/site/UcretsizAraclarPage'
import { ServiceDetailPage } from '@/pages/site/ServiceDetailPage'
import { CategoryPage } from '@/pages/site/CategoryPage'
import { SolutionDetailPage } from '@/pages/site/SolutionDetailPage'
import { SifreKasasiPage } from '@/pages/site/SifreKasasiPage'
import { AdminServicesListPage } from '@/pages/admin/AdminServicesListPage'
import { AdminServiceEditPage } from '@/pages/admin/AdminServiceEditPage'
import { AdminSolutionsListPage } from '@/pages/admin/AdminSolutionsListPage'
import { AdminSolutionEditPage } from '@/pages/admin/AdminSolutionEditPage'
import { CartPage } from '@/pages/site/CartPage'
import { CartCheckoutPage } from '@/pages/site/CartCheckoutPage'
import { CustomerLoginPage } from '@/pages/site/CustomerLoginPage'
import { HesabimPage } from '@/pages/site/HesabimPage'
import { HesabimOrdersPage } from '@/pages/site/HesabimOrdersPage'
import { HesabimOrderDetailPage } from '@/pages/site/HesabimOrderDetailPage'

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'yazilimlar', element: <SoftwareListPage /> },
      { path: 'yazilimlar/:slug', element: <SoftwareDetailPage /> },
      { path: 'satinal/:slug', element: <ProductCheckoutPage /> },
      { path: 'odeme/basarili', element: <PaymentSuccessPage /> },
      { path: 'odeme/basarili/:orderNo', element: <PaymentSuccessPage /> },
      { path: 'odeme/basarisiz', element: <PaymentFailPage /> },
      { path: 'odeme/basarisiz/:orderNo', element: <PaymentFailPage /> },
      { path: 'sepet', element: <CartPage /> },
      { path: 'musteri-giris', element: <CustomerLoginPage /> },
      { path: 'hesabim', element: <HesabimPage /> },
      { path: 'hesabim/siparisler', element: <HesabimOrdersPage /> },
      { path: 'hesabim/siparisler/:orderNo', element: <HesabimOrderDetailPage /> },
      { path: 'checkout', element: <CartCheckoutPage /> },
      { path: 'checkout/:slug', element: <LegacyCheckoutSlugRedirect /> },
      { path: 'siparis-basarili', element: <LegacyOrderSuccessRedirect /> },
      { path: 'siparis-basarili/:orderNo', element: <LegacyOrderSuccessRedirect /> },
      { path: 'siparis-basarisiz', element: <LegacyOrderFailRedirect /> },
      { path: 'siparis-basarisiz/:orderNo', element: <LegacyOrderFailRedirect /> },
      { path: 'hakkimizda', element: <AboutPage /> },
      { path: 'iletisim', element: <ContactPage /> },
      { path: 'hizmetler', element: <ServicesPage /> },
      { path: 'hizmetler/:slug', element: <ServiceDetailPage /> },
      { path: 'cozumler', element: <SolutionsPage /> },
      { path: 'cozumler/:slug', element: <SolutionDetailPage /> },
      { path: 'sss', element: <FaqPage /> },
      { path: 'teklif-al', element: <QuotePage /> },
      { path: 'ucretsiz-araclar', element: <UcretsizAraclarPage /> },
      { path: 'ucretsiz-araclar/sifre-kasasi', element: <SifreKasasiPage /> },
      { path: 'kategori/:slug', element: <CategoryPage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'on-bilgilendirme-formu', element: <PreInformationPage /> },
      { path: 'mesafeli-satis-sozlesmesi', element: <DistanceSalesPage /> },
      { path: 'gizlilik-politikasi', element: <PrivacyPage /> },
      { path: 'gizlilik', element: <Navigate to="/gizlilik-politikasi" replace /> },
      { path: 'kvkk', element: <Navigate to="/kvkk-aydinlatma-metni" replace /> },
      { path: 'kvkk-aydinlatma-metni', element: <KvkkPage /> },
      { path: 'iade-iptal-kosullari', element: <RefundPolicyPage /> },
      { path: 'cerez-politikasi', element: <CookiePolicyPage /> },
      { path: 'acik-riza-metni', element: <AcikRizaMetniPage /> },
      { path: 'kullanim-sartlari', element: <KullanimSartlariPage /> },
      { path: 'yasal/:slug', element: <LegalCheckoutDocumentBySlugPage /> },
      { path: 'yasal-belge/:type', element: <LegalTypeDocumentPage /> },
      { path: 'urunler', element: <Navigate to="/yazilimlar" replace /> },
      { path: 'urun/:slug', element: <LegacyProductRedirect /> },
      { path: ':slug', element: <DynamicCmsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: 'giris', element: <LoginPage /> }],
  },
  {
    element: <AdminGuard />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'siparisler', element: <AdminOrdersPage /> },
          { path: 'siparisler/:id', element: <AdminOrderDetailPage /> },
          { path: 'odemeler', element: <AdminPaymentsPage /> },
          { path: 'lisanslar', element: <AdminLicensesPage /> },
          { path: 'lisanslar/:id', element: <AdminLicenseDetailPage /> },
          { path: 'lisans-ayarlari', element: <AdminLicenseSettingsPage /> },
          { path: 'musteri-talepleri', element: <AdminContactMessagesPage /> },
          { path: 'urunler', element: <AdminProductListPage /> },
          { path: 'urunler/yeni', element: <AdminProductFormPage /> },
          { path: 'urunler/:id/duzenle', element: <AdminProductFormPage /> },
          { path: 'kategoriler', element: <AdminProductCategoriesPage /> },
          { path: 'markalar', element: <AdminBrandsPage /> },
          { path: 'ozellikler', element: <AdminFeaturesPage /> },
          { path: 'yazilimlar', element: <Navigate to="/admin/urunler" replace /> },
          { path: 'yazilimlar/yeni', element: <Navigate to="/admin/urunler/yeni" replace /> },
          { path: 'yazilimlar/:id/duzenle', element: <LegacyAdminProductRedirect /> },
          { path: 'blog', element: <AdminBlogListPage /> },
          { path: 'blog/yeni', element: <AdminBlogFormPage /> },
          { path: 'blog/:id/duzenle', element: <AdminBlogFormPage /> },
          { path: 'kampanyalar', element: <AdminCampaignsPage /> },
          { path: 'kuponlar', element: <AdminCouponsPage /> },
          { path: 'ana-sayfa', element: <AdminHomePage /> },
          { path: 'sayfalar', element: <AdminPagesListPage /> },
          { path: 'sayfalar/yeni', element: <AdminPagesNewPage /> },
          { path: 'sayfalar/ozel/:id/duzenle', element: <AdminCmsPageEditPage /> },
          { path: 'sayfalar/:key/duzenle', element: <AdminPageEditPage /> },
          { path: 'hizmetler', element: <AdminServicesListPage /> },
          { path: 'hizmetler/:slug/duzenle', element: <AdminServiceEditPage /> },
          { path: 'cozumler', element: <AdminSolutionsListPage /> },
          { path: 'cozumler/:slug/duzenle', element: <AdminSolutionEditPage /> },
          { path: 'menu-yonetimi', element: <AdminNavigationMenuPage /> },
          { path: 'footer-yonetimi', element: <AdminFooterManagementPage /> },
          { path: 'icerikler', element: <AdminPageContentsRedirectPage /> },
          { path: 'yasal-metinler', element: <AdminLegalDocumentsPage /> },
          { path: 'yasal-metinler/yeni', element: <AdminLegalDocumentFormPage /> },
          { path: 'yasal-metinler/:id/duzenle', element: <AdminLegalDocumentFormPage /> },
          { path: 'seo', element: <AdminSeoPage /> },
          { path: 'medya', element: <AdminMediaLibraryPage /> },
          { path: 'raporlar', element: <AdminReportsPage /> },
          { path: 'islem-gecmisi', element: <AdminActivityLogPage /> },
          { path: 'odeme-ayarlari', element: <AdminPaymentSettingsPage /> },
          { path: 'eposta-ayarlari', element: <AdminEmailSettingsPage /> },
          { path: 'entegrasyon/odeme', element: <Navigate to="/admin/odeme-ayarlari" replace /> },
          { path: 'entegrasyon/lisans', element: <Navigate to="/admin/lisans-ayarlari" replace /> },
          { path: 'entegrasyon/eposta', element: <Navigate to="/admin/eposta-ayarlari" replace /> },
          { path: 'ayarlar', element: <AdminSiteSettingsPage /> },
          { path: 'gorunum-ayarlari', element: <AdminAppearanceSettingsPage /> },
          { path: 'kullanici-ayarlari', element: <AdminUserSettingsPage /> },
          { path: 'ayarlar/gorunum', element: <Navigate to="/admin/gorunum-ayarlari" replace /> },
          { path: 'ayarlar/kullanicilar', element: <Navigate to="/admin/kullanici-ayarlari" replace /> },
          { path: 'site-ayarlari', element: <Navigate to="/admin/ayarlar" replace /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
