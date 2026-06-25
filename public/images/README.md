# Woontegra statik görseller

Bu klasördeki dosyalar Git'e commit edilir ve Vercel deploy ile `https://woontegra.com/images/...` altında servis edilir.

## Kullanım

- Panelde görsel yolu: `/images/dosya-adi.png` (veya `.jpg`, `.jpeg`)
- Yeni görsel eklemek: dosyayı bu klasöre koyun → Git commit → deploy

## Önemli

- **Canlı panelden `/uploads/...` yüklemeleri deploy sonrası silinir** (Railway geçici disk).
- Kalıcı görseller yalnızca bu klasör + Git üzerinden yönetilir.
- Cloudinary/S3 kullanılmıyor.
