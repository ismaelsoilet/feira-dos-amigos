import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAdById } from '@/lib/storage';
import { ClientAdDetails } from './ClientAdDetails';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ad = await getAdById(id);
  if (!ad) {
    return { title: 'Anúncio não encontrado | Feira dos Amigos' };
  }
  return {
    title: `${ad.title} | Feira dos Amigos Peruíbe`,
    description: ad.description.slice(0, 160),
    openGraph: {
      title: `${ad.title} - R$ ${ad.price} em Peruíbe`,
      description: ad.description,
      images: [ad.photos[0] || '/logo.jpg'],
    },
  };
}

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ad = await getAdById(id);

  if (!ad) {
    notFound();
  }

  const { pinHash, ...safeAd } = ad;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 transition-colors py-1.5 px-3 rounded-xl bg-purple-50 border border-purple-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Feira</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-purple-950">FEIRA DOS AMIGOS</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ClientAdDetails initialAd={safeAd} />
      </main>
    </div>
  );
}
