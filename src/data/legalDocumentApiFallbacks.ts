import type { LegalDocType } from '@/types/legalDocuments'

const PRE = `<div class="legal-doc">
<h2>Ön bilgilendirme</h2>
<p>Bu metin, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında sipariş öncesi bilgilendirme amacıyla sunulur. Güncel ve kişiselleştirilmiş sürüm için bağlantıyı daha sonra yenilemeniz veya ödeme adımındaki özetinizi kontrol etmeniz önerilir.</p>
<h2>Ürün ve bedel</h2>
<p>Seçtiğiniz dijital ürünlerin adı, niteliği, vergiler dahil fiyatı ve varsa ek masraflar ödeme ekranındaki sipariş özetinde yer alır.</p>
<h2>Ödeme ve teslim</h2>
<p>Ödeme güvenli ödeme altyapısı üzerinden tahsil edilir. Dijital ürünlerde teslimat; ödeme onayından sonra e-posta veya hesabınızdaki sipariş ekranı üzerinden yapılır.</p>
<h2>Cayma hakkı</h2>
<p>Dijital içerik ve anında ifa edilen hizmetlerde mevzuatta öngörülen cayma hakkı istisnaları saklıdır. Ayrıntılar mesafeli satış sözleşmesinde düzenlenir.</p>
</div>`

const DIST = `<div class="legal-doc">
<h2>Mesafeli satış sözleşmesi</h2>
<p>İşbu sözleşme, satıcı ile alıcı arasında elektronik ortamda kurulur. Tarafların kimlik ve iletişim bilgileri ile sipariş konusu ürünler, ödeme adımında teyit edilir.</p>
<h2>Sözleşme konusu</h2>
<p>Alıcının seçtiği dijital ürünlerin satışı, bedelinin ödenmesi ve kullanım haklarının devri ile sınırlıdır.</p>
<h2>Yükümlülükler</h2>
<p>Satıcı, ürünün ifası ve destek süreçlerinden; alıcı, doğru bilgi vermekten ve ödeme yükümlülüğünden sorumludur.</p>
<h2>Uyuşmazlık</h2>
<p>Uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır; tüketici işlemlerinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>
</div>`

const COMM = `<div class="legal-doc">
<h2>Ticari elektronik ileti</h2>
<p>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve ilgili mevzuat uyarınca; kampanya, tanıtım ve duyuru amaçlı e-posta veya diğer elektronik iletiler yalnızca onay vermeniz hâlinde gönderilir.</p>
<h2>Geri çekme</h2>
<p>Onayınızı dilediğiniz zaman, iletide sunulan yönergeler veya müşteri hizmetleri kanalıyla ücretsiz olarak geri çekebilirsiniz.</p>
<h2>Kayıtlar</h2>
<p>Onay ve geri çekme işlemleri sistem kayıtları ile izlenebilir.</p>
</div>`

const EXP = `<div class="legal-doc">
<h2>Açık rıza</h2>
<p>Kimlik ve iletişim verilerinizin; pazarlama, profilleme veya kişiselleştirilmiş teklifler sunulması gibi amaçlarla işlenmesine ilişkin açık rıza, yalnızca ilgili kutuyu işaretlemeniz hâlinde oluşur.</p>
<h2>Rızanın geri çekilmesi</h2>
<p>Rızanızı dilediğiniz zaman geri çekebilirsiniz. Geri çekme, geri çekmeden önceki hukuki sonuçları etkilemez; sözleşmenin ifası veya kanundan doğan işlemler ayrıca sürdürülebilir.</p>
<h2>Bilgilendirme</h2>
<p>Veri sorumlusu ve başvuru yolları hakkında ayrıntılı bilgi için KVKK aydınlatma metnimizi inceleyebilirsiniz.</p>
</div>`

const BY_TYPE: Partial<Record<LegalDocType, string>> = {
  PRE_INFORMATION: PRE,
  DISTANCE_SALES: DIST,
  COMMERCIAL_ELECTRONIC_MESSAGE: COMM,
  EXPLICIT_CONSENT: EXP,
}

export function fallbackLegalDocumentHtml(type: LegalDocType): string {
  return (
    BY_TYPE[type] ??
    '<div class="legal-doc"><p>Bu belge şu anda görüntülenemedi. Lütfen daha sonra tekrar deneyin veya iletişim sayfamızdan bize ulaşın.</p></div>'
  )
}

export function resolveLegalDocumentHtml(type: LegalDocType, content: string | undefined | null): string {
  const body = content?.trim()
  return body && body.length > 20 ? body : fallbackLegalDocumentHtml(type)
}
