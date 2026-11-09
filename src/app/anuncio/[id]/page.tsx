import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Clock,
  Shield,
  Share2,
  Calendar,
  AlertTriangle,
  User,
} from 'lucide-react';
import { getAdById } from '@/lib/storage';
import { formatPrice, buildWhatsAppLink } from '@/components/AdCard';
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
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-purple-800/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-surface-card border border-purple-700/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Feira</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-neon-green">FEIRA DOS AMIGOS</span>
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
