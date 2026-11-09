# Feira dos Amigos (Servidores de Peruíbe) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a plataforma web completa e mobile-first de anúncios e classificados "Feira dos Amigos - Servidores de Peruíbe (Vendas e Trocas)", com publicação livre, busca instantânea com highlight de termos, filtros avançados, tarja de "Vendido", rate limiting anti-spam de 15 anúncios/h e persistência serverless via Vercel Blob (sem banco de dados relacional).

**Architecture:** Next.js 15 (App Router) com TypeScript e Tailwind CSS. Os anúncios e fotos são armazenados como arquivos JSON e imagens WebP no Vercel Blob (com fallback automático para arquivos locais em desenvolvimento). Um índice agregado `catalog-index.json` garante buscas em <50ms com highlight de termos nos resultados. A gestão pelo autor (marcar como vendido, reativar, excluir) é feita via PIN de 4 dígitos e persistida na sessão do aparelho via `localStorage`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, `@vercel/blob`, Vitest, Canvas API para compressão WebP no cliente.

**Spec:** [design-feira-dos-amigos.md](file:///home/ismaelsoilet/.gemini/antigravity/brain/ddd15119-187a-4594-9520-971186d3c678/design-feira-dos-amigos.md)

## Global Constraints

- **Sem Banco de Dados Tradicional:** Não usar PostgreSQL, MySQL, SQLite ou MongoDB; persistência exclusivamente via arquivos JSON e fotos em Blob Storage / sistema de arquivos.
- **Identidade Temática:** Seguir estritamente as cores da logo (Roxo cósmico `#0f071b`, Neon Green `#22c55e`/`#39FF14`, Magenta/Violet `#9333ea`) e o mascote alienígena feirante.
- **Mobile-First:** Toda tela deve ter navegação touch fluida, bottom bar flutuante no celular e botões confortáveis para dedos.
- **Rate Limit:** 15 anúncios por hora por IP, com honeypot anti-spam.
- **Contatos Diretos:** Botão de WhatsApp que abre mensagem pronta com título do anúncio.
- **Ciclo de Vida "Vendido":** Anúncios marcados como vendidos recebem tarja destacada e ficam ocultos da busca padrão, a menos que o filtro `[x] Mostrar vendidos` seja ativado.

## Review Focus

1. **Acento e Normalização na Busca:** Buscas com ou sem acentos (ex: "Peruíbe" vs "peruibe", "fogão" vs "fogao") devem retornar os mesmos resultados e destacar os termos corretamente.
2. **Resiliência do Blob Storage (Dev vs Prod):** O sistema deve funcionar perfeitamente em modo de desenvolvimento local sem exigir que o desenvolvedor tenha uma conta Vercel Blob ativa de imediato (usando fallback em disco local).
3. **Imagens Pesadas no Celular:** Fotos de 10MB tiradas diretamente da câmera do smartphone devem ser redimensionadas e convertidas para WebP (<250KB) antes do envio para não estourar payload serverless (limite Vercel de 4.5MB).
4. **Segurança do PIN:** O PIN de 4 dígitos deve ser armazenado como hash (SHA-256) no JSON do anúncio, nunca em texto plano.
5. **Filtro de Vendidos & Expirados:** Anúncios expirados ou vendidos jamais devem poluir a busca padrão de quem está navegando para comprar.

---

### Task 1: Project Scaffolding, Theme & Asset Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`
- Assets: `public/logo.jpg`, `public/mascot.png`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Base do projeto Next.js 15 pronta para build com Tailwind e paleta oficial.

- [ ] **Step 1: Write setup test verifying environment and branding**
- [ ] **Step 2: Initialize Next.js 15 with TypeScript and Tailwind CSS in `/home/ismaelsoilet/feira-dos-amigos`**
- [ ] **Step 3: Copy logo asset from uploaded media to `public/logo.jpg`**
- [ ] **Step 4: Configure `tailwind.config.ts` and `globals.css` with cosmic purple and neon green colors**
- [ ] **Step 5: Run build verification (`npm run build` or `npm test`) and commit**

---

### Task 2: Core Domain Types, Storage Adapter & Rate Limiter

**Files:**
- Create: `src/types/ad.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/rate-limit.ts`
- Test: `tests/storage.test.ts`, `tests/rate-limit.test.ts`

**Interfaces:**
- Produces:
  - `Ad` interface, `AdSummary` interface, `CreateAdInput`
  - `saveAd(input: CreateAdInput): Promise<Ad>`
  - `getAds(filters: AdFilters): Promise<AdSummary[]>`
  - `getAdById(id: string): Promise<Ad | null>`
  - `updateAdStatus(id: string, pin: string, status: 'active' | 'sold'): Promise<boolean>`
  - `checkRateLimit(ip: string): { allowed: boolean; remaining: number }`

- [ ] **Step 1: Write failing unit test for storage adapter and rate limiter**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/types/ad.ts` defining all ad schemas, status enum and Peruíbe bairros**
- [ ] **Step 4: Implement `src/lib/rate-limit.ts` (15 req/h/ip sliding window with honeypot validation)**
- [ ] **Step 5: Implement `src/lib/storage.ts` with Vercel Blob integration and local filesystem fallback**
- [ ] **Step 6: Run tests to verify all pass and commit**

---

### Task 3: Serverless API Routes (`/api/ads`, `/api/ads/[id]`, `/api/ads/[id]/manage`)

**Files:**
- Create: `src/app/api/ads/route.ts`
- Create: `src/app/api/ads/[id]/route.ts`
- Create: `src/app/api/ads/[id]/manage/route.ts`
- Test: `tests/api-ads.test.ts`

**Interfaces:**
- Consumes: `storage.ts`, `rate-limit.ts`, `ad.ts`
- Produces:
  - `GET /api/ads` -> list of ads with query filters
  - `POST /api/ads` -> create ad with rate limit check
  - `GET /api/ads/[id]` -> single ad details
  - `PATCH /api/ads/[id]/manage` -> toggle sold or update with PIN
  - `DELETE /api/ads/[id]/manage` -> delete with PIN

- [ ] **Step 1: Write failing test for the API route handlers**
- [ ] **Step 2: Run test to confirm failure**
- [ ] **Step 3: Implement `GET` and `POST` in `src/app/api/ads/route.ts`**
- [ ] **Step 4: Implement `GET` in `src/app/api/ads/[id]/route.ts`**
- [ ] **Step 5: Implement `PATCH` and `DELETE` in `src/app/api/ads/[id]/manage/route.ts`**
- [ ] **Step 6: Run tests to verify all API endpoints pass and commit**

---

### Task 4: Smart Search Engine & Term Highlighter

**Files:**
- Create: `src/lib/search.ts`
- Create: `src/components/HighlightText.tsx`
- Test: `tests/search.test.ts`

**Interfaces:**
- Produces:
  - `filterAndSearchAds(ads: AdSummary[], query: string, filters: AdFilters): AdSummary[]`
  - `HighlightText({ text, query }: { text: string; query: string }): JSX.Element`

- [ ] **Step 1: Write failing test for accent-insensitive search and token highlighter**
- [ ] **Step 2: Run test to confirm failure**
- [ ] **Step 3: Implement `normalizeText` and fuzzy/token matching in `src/lib/search.ts`**
- [ ] **Step 4: Implement `HighlightText.tsx` wrapping matched tokens in `<mark>` with neon green style**
- [ ] **Step 5: Run tests and commit**

---

### Task 5: Mobile-First UI Navigation, Filters Drawer & Ad Cards

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/FilterDrawer.tsx`
- Create: `src/components/AdCard.tsx`
- Create: `src/components/AdGrid.tsx`
- Test: `tests/components.test.tsx`

**Interfaces:**
- Consumes: `HighlightText.tsx`, `ad.ts`
- Produces: Componentes visuais responsivos com suporte a toque e tarja "VENDIDO" rotacionada estilo carimbo

- [ ] **Step 1: Write test for AdCard rendering with sold badge and WhatsApp link**
- [ ] **Step 2: Run test to confirm failure**
- [ ] **Step 3: Implement `Navbar.tsx` and mobile `BottomNav.tsx`**
- [ ] **Step 4: Implement `FilterDrawer.tsx` with Peruíbe bairros, category chips, and "Mostrar Vendidos"**
- [ ] **Step 5: Implement `AdCard.tsx` with photo carousel, tags, "Vendido" badge and 1-tap WhatsApp**
- [ ] **Step 6: Implement `AdGrid.tsx` with loading skeleton and empty state**
- [ ] **Step 7: Run test to verify all pass and commit**

---

### Task 6: Ad Creation Form with Client-Side Image Compression

**Files:**
- Create: `src/lib/compress-image.ts`
- Create: `src/components/CreateAdModal.tsx`
- Test: `tests/compress.test.ts`

**Interfaces:**
- Produces:
  - `compressImage(file: File, maxDimension: number, quality: number): Promise<string>`
  - Form modal with instant multi-photo upload, preview, category, Peruíbe bairro selector, WhatsApp mask, PIN selection, and success screen with confetti.

- [ ] **Step 1: Write test for image compression logic**
- [ ] **Step 2: Run test to confirm failure**
- [ ] **Step 3: Implement `compressImage` using Canvas API to produce lightweight WebP Base64**
- [ ] **Step 4: Implement `CreateAdModal.tsx` with smooth step flow, form validation and honeypot**
- [ ] **Step 5: Save created ad to `localStorage` under `meus-anuncios` on success**
- [ ] **Step 6: Run test, verify pass and commit**

---

### Task 7: "Meus Anúncios" Local Management & Ad Details Page

**Files:**
- Create: `src/app/anuncio/[id]/page.tsx`
- Create: `src/components/ManageAdModal.tsx`
- Create: `src/app/meus-anuncios/page.tsx`
- Test: `tests/manage.test.ts`

**Interfaces:**
- Consumes: `storage.ts`, `AdCard.tsx`
- Produces:
  - Página detalhada do anúncio com galeria completa e botão flutuante de WhatsApp
  - Modal de gestão para alternar status para "Vendido" ou excluir usando o PIN de 4 dígitos
  - Painel "Meus Anúncios" que lê os anúncios salvos no aparelho para controle em 1 toque

- [ ] **Step 1: Write test for PIN authorization and status toggle**
- [ ] **Step 2: Run test to confirm failure**
- [ ] **Step 3: Implement `src/app/anuncio/[id]/page.tsx`**
- [ ] **Step 4: Implement `src/components/ManageAdModal.tsx`**
- [ ] **Step 5: Implement `src/app/meus-anuncios/page.tsx`**
- [ ] **Step 6: Run tests and commit**

---

### Task 8: Homepage Integration, Final Verification & Vercel/GitHub Prep

**Files:**
- Modify: `src/app/page.tsx`
- Create: `README.md`
- Create: `.env.example`
- Run: `npm run build`, `npm run test`

- [ ] **Step 1: Integrate search bar, category chips, filter drawer, ad grid and modals into `src/app/page.tsx`**
- [ ] **Step 2: Run full test suite and confirm 100% pass**
- [ ] **Step 3: Run production build `npm run build` and ensure zero errors or warnings**
- [ ] **Step 4: Write comprehensive `README.md` with deploy to Vercel and GitHub instructions**
- [ ] **Step 5: Execute KAIROS Audit (`kairos audit` / Zero-Trust check)**
