import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
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
      <body className="bg-background text-gray-100 antialiased selection:bg-neon-lime/30 selection:text-neon-green min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
