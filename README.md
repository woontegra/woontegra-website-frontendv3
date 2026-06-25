# Woontegra Frontend V3

Yeni Woontegra storefront + admin + müşteri paneli iskeleti.

## Kurulum

```bash
cd frontendV3
cp .env.example .env
npm install
npm run dev
```

Backend yerelde `http://127.0.0.1:4000` üzerinde çalışmalıdır.

## Yapı

- `src/app` — router, providers, guards
- `src/layouts` — Admin / Storefront / Customer / Auth
- `src/pages` — sayfa iskeletleri
- `src/services/api` — axios client
- `src/components/ui` — ortak UI
