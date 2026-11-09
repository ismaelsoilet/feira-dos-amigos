# Behavioral Specifications: Auto-Enhancements

## Added Behaviors

### SPEC-01: Auto-Purge de Anúncios Expirados & Stats
- `purgeExpiredAds()`: varre o catálogo e identifica itens com `expiresAt < now`.
  - Se configurado Vercel Blob, exclui as fotos antigas correspondentes para economizar cota.
  - Atualiza status para `expired`.
- `GET /api/stats`: retorna métricas agregadas:
  - `totalActive`: número de anúncios ativos.
  - `totalSold`: número de anúncios vendidos.
  - `totalExpired`: número de anúncios expirados.
  - `bairrosCount`: número de bairros com ofertas ativas.

### SPEC-02: Sistema de Favoritos (❤️) Local-First
- O usuário pode favoritar/desfavoritar qualquer anúncio clicando no botão ❤️ no card ou página de detalhes.
- O array de IDs favoritos é salvo no `localStorage` em `feira_favoritos`.
- Quando o filtro `onlyFavorites: true` estiver ativo, a listagem exibe apenas os anúncios favoritos do usuário.

### SPEC-03: Métricas de Engajamento (Views & WhatsApp Clicks)
- Cada anúncio passa a rastrear opcionalmente:
  - `views`: total de visualizações da página do anúncio.
  - `whatsappClicks`: total de cliques no botão "Chamar no WhatsApp".
- Endpoints dedicados com debouncing:
  - `POST /api/ads/[id]/view`
  - `POST /api/ads/[id]/whatsapp-click`

### SPEC-04: Compartilhamento com QR Code
- No card e na página de detalhes, o modal de compartilhamento gera um QR Code em SVG/Canvas do link do anúncio para exibição rápida em smartphones e barracas de feira.

### SPEC-05: Tag "NOVO" e Chips de Preço Rápido
- Se `createdAt` for inferior a 24 horas a partir de `Date.now()`, o card exibe badge "NOVO".
- Chips de filtros de preço rápido: "Até R$ 50", "Até R$ 150", "Acima de R$ 300", "Trocas", "Doações".
