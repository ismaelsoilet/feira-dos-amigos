# Feira dos Amigos | Peruíbe — Vendas e Trocas

<p align="center">
  <img src="public/logo.jpg" alt="Feira dos Amigos - Servidores de Peruíbe" width="220" style="border-radius: 50%; box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);" />
</p>

<p align="center">
  <b>Plataforma comunitária e mobile-first de classificados, vendas, trocas e doações em Peruíbe.</b><br/>
  <i>Publicação livre, contato direto no WhatsApp, busca inteligente com highlight de termos e persistência serverless sem banco de dados tradicional.</i>
</p>

---

## 🌟 Principais Recursos

- **Zero Banco de Dados Relacional:** Persistência serverless baseada em arquivos JSON e imagens WebP no **Vercel Blob** (com fallback automático em disco local para desenvolvimento offline).
- **Busca Inteligente com Highlight:** Digitação instantânea com normalização fonética e de acentuação (ex: busca por `peruibe` localiza `Peruíbe`), destacando visualmente as palavras encontradas com `<mark>` verde-limão.
- **Ciclo de Vida do Anúncio & Tarja "VENDIDO":**
  - O vendedor cria um PIN simples de 4 dígitos.
  - Pode marcar como vendido em 1 clique (o que aplica o carimbo visual rotacionado "VENDIDO").
  - Anúncios vendidos são automaticamente ocultados da busca padrão e só aparecem se o visitante ativar o filtro `[x] Mostrar itens já vendidos`.
- **Experiência Mobile-First:**
  - Barra de navegação inferior touch (*Bottom Bar*) com atalhos de Início, Filtros, Novo Anúncio e Meus Itens.
  - Compressão de imagens automática no navegador via Canvas API (fotos pesadas de celular de 10MB são otimizadas para WebP leve antes do upload).
- **Proteção Anti-Spam com Rate Limiting:**
  - Permite até **15 publicações por hora por IP** para não travar quem deseja cadastrar vários itens.
  - Proteção invisível por *Honeypot* contra bots automatizados de spam.
- **Painel "Meus Anúncios" Local:**
  - Guarda os anúncios criados pelo aparelho no `localStorage`, permitindo ao vendedor gerenciar e marcar como vendido em 1 toque sem precisar digitar senhas complicadas.

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/SEU-USUARIO/feira-dos-amigos.git
cd feira-dos-amigos
npm install
```

### 2. Rodar a Suíte de Testes
```bash
npm test
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador ou acesse pelo celular na mesma rede Wi-Fi.

> **Nota:** Em ambiente local, se a variável `BLOB_READ_WRITE_TOKEN` não for informada, o sistema salva os dados automaticamente na pasta `data/local-ads/` sem necessidade de nenhuma configuração adicional.

---

## ☁️ Como Publicar no GitHub e Hospedar na Vercel

### 1. Subir para o GitHub
```bash
git init
git add .
git commit -m "feat: Feira dos Amigos - Plataforma de Classificados"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/feira-dos-amigos.git
git push -u origin main
```

### 2. Publicar na Vercel com Vercel Blob
1. Acesse o painel da [Vercel](https://vercel.com) e clique em **Add New... -> Project**.
2. Selecione o repositório `feira-dos-amigos` do GitHub e clique em **Deploy**.
3. No painel do projeto na Vercel, acesse a aba **Storage**:
   - Clique em **Create Database** e escolha **Blob**.
   - Dê um nome (ex: `feira-dos-amigos-blob`) e clique em **Create & Connect to Project**.
4. A Vercel injetará automaticamente a variável `BLOB_READ_WRITE_TOKEN`.
5. Pronto! Seu site estará 100% no ar, persistindo anúncios e fotos na CDN global sem gerenciar servidores ou bancos SQL.

---

## 📄 Licença
Desenvolvido com carinho para os servidores e munícipes de Peruíbe. Distribuído sob licença MIT.
