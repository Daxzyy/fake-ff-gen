# FF Lobby Card Generator

Fan-made Free Fire lobby card generator. Tidak berafiliasi dengan Garena.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Taruh file font di `public/fonts/`:
   - `GFF-Latin-Bold.ttf`
   - `GFF-Latin-Medium.ttf`
   - `GFF-Latin-Regular.ttf`
   - `GFF-Latin-Thin.ttf`

3. Run dev:
```bash
npm run dev
```

4. Build & deploy:
```bash
npm run build
npm start
```

## Deploy ke Vercel
```bash
npx vercel --prod
```

## Struktur
```
app/
  layout.tsx       # Root layout
  globals.css      # Font faces + CSS tokens
  page.tsx         # Single-page UI (client component)
  api/card/
    route.ts       # POST handler — generate kartu via fake-ff
public/
  fonts/           # Taruh font TTF di sini
```
