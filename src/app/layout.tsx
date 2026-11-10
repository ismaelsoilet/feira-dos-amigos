import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://feiradosamigos.vercel.app'),
  title: 'Feira dos Amigos | Peruíbe — Vendas e Trocas',
  description: 'Classificados e feira comunitária de servidores e moradores de Peruíbe. Publique grátis, compre, venda e troque com contato direto no WhatsApp.',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-slate-900 antialiased selection:bg-purple-200 selection:text-purple-950 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
