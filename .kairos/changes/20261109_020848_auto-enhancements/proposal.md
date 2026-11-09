# Delta Spec Proposal: Auto-Melhoria Contínua & Funcionalidades Avançadas
## Projeto: Feira dos Amigos (Peruíbe)

### 1. Problema e Motivação
A plataforma base está funcional e no ar na Vercel. Para transformá-la na melhor experiência comunitária de anúncios possível para servidores e moradores de Peruíbe, identificamos quatro oportunidades críticas:
1. **Governança de Armazenamento:** Risco de acúmulo de fotos de anúncios expirados ocupando a cota gratuita de 1 GB do Vercel Blob.
2. **Engajamento do Comprador:** Falta de um sistema de "Favoritos" para salvar ofertas de interesse e comparar preços.
3. **Métricas para o Vendedor:** O vendedor não sabe quantas pessoas visualizaram sua oferta ou clicaram no WhatsApp.
4. **Viralidade e Integração Física com a Feira:** Falta de QR Code para feirantes exibirem na barraca física em Peruíbe e compartilhamento social otimizado.

### 2. Escopo da Auto-Melhoria
- **Adicionado:**
  - Sistema de purga automática de fotos de anúncios expirados (`purgeExpiredAds`).
  - Endpoint de estatísticas da comunidade (`GET /api/stats`).
  - Sistema de favoritos local-first (`localStorage`) com filtro "❤️ Favoritos".
  - Contadores de visualizações e cliques de WhatsApp (`/api/ads/[id]/view`, `/api/ads/[id]/whatsapp-click`).
  - Modal de QR Code para impressão e exibição em barracas físicas.
  - Chips de faixas de preço pré-definidas e tag visual "NOVO" para itens das últimas 24h.
- **Invariantes e Não-Objetivos:**
  - Zero dependência de banco de dados tradicional mantida.
  - Rate limiting mantido em 30 req/h por IP com honeypot.
  - Zero quebra ou regressão dos 27 testes unitários existentes.
