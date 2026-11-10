import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAdById } from '@/lib/storage';
import { formatPrice } from '@/components/AdCard';
import { ClientAdDetails } from './ClientAdDetails';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ad = await getAdById(id);
  if (!ad) {
    return {
      title: 'Anúncio não encontrado | Feira dos Amigos Peruíbe',
      description: 'Este anúncio pode ter sido vendido ou removido da feira.',
    };
  }

  const priceText = formatPrice(ad.price, ad.priceType);
  const title = `${ad.title} — ${priceText} | Feira dos Amigos Peruíbe`;
  const description = `${priceText} • Bairro ${ad.bairro} (Peruíbe) • Vendedor: ${ad.sellerName}. ${ad.description}`.slice(0, 190);
  const siteUrl = 'https://feiradosamigos.vercel.app';
  const shareUrl = `${siteUrl}/anuncio/${ad.id}`;
  const imageUrl = `${siteUrl}/api/ads/${ad.id}/image`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'Feira dos Amigos - Peruíbe',
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: ad.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
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
