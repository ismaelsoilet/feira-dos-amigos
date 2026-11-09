# Tasks Breakdown: Auto-Enhancements

- [x] **Task 1: Auto-Purge de Anúncios Expirados & Stats API**
  - [x] Escrever teste falhando para `purgeExpiredAds` e `GET /api/stats` em `tests/stats-purge.test.ts`
  - [x] Implementar `purgeExpiredAds` e `getCommunityStats` em `src/lib/storage.ts`
  - [x] Criar endpoint `src/app/api/stats/route.ts`
  - [x] Rodar testes e verificar GREEN

- [x] **Task 2: Métricas de Engajamento (Views e WhatsApp Clicks)**
  - [x] Escrever teste falhando para incremento de visualizações e cliques em `tests/engagement.test.ts`
  - [x] Implementar `incrementAdMetric(id, 'views' | 'whatsappClicks')` em `src/lib/storage.ts`
  - [x] Criar rotas `/api/ads/[id]/view/route.ts` e `/api/ads/[id]/whatsapp-click/route.ts`
  - [x] Rodar testes e verificar GREEN

- [x] **Task 3: Sistema de Favoritos (❤️) e Filtro Rápido**
  - [x] Adicionar suporte a `onlyFavorites` e `favoritesIds` em `src/lib/search.ts`
  - [x] Atualizar teste em `tests/search.test.ts`
  - [x] Atualizar `AdCard.tsx` com botão interativo de favorito com ícone de coração
  - [x] Integrar filtro de favoritos na Home e Navbar

- [x] **Task 4: QR Code Modal & Tag "NOVO" (<24h)**
  - [x] Implementar `QRCodeModal.tsx` com gerador nativo SVG de QR Code (sem dependências pesadas)
  - [x] Adicionar badge visual "NOVO" no `AdCard.tsx` quando publicado há menos de 24 horas
  - [x] Adicionar chips de preço rápido ("Até R$ 50", "Até R$ 150", "Acima de R$ 300", "Doações")

- [x] **Task 5: Verificação Global, KAIROS Audit & Deploy**
  - [x] Rodar suíte completa de testes (meta: 35+ testes unitários passando)
  - [x] Compilar produção com `npm run build`
  - [x] Rodar `kairos audit` (Zero-Trust verification)
  - [x] Enviar para o GitHub `origin/main`
