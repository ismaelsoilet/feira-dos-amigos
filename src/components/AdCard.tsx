'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, MapPin, Tag, ShieldCheck, Clock } from 'lucide-react';
import { AdSummary, AdPriceType } from '@/types/ad';
import { HighlightText } from './HighlightText';

export function formatPrice(price: number, type: AdPriceType): string {
  if (type === 'free') return 'Doação / Grátis';
  if (type === 'trade') return 'Troca';
  if (type === 'negotiable') return 'A combinar';
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
  return formatted.replace(/\u00a0/g, ' ');
}

export function buildWhatsAppLink(ad: AdSummary): string {
  const cleanPhone = ad.whatsapp.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const text = `Olá, ${ad.sellerName}! Vi seu anúncio "${ad.title}" na Feira dos Amigos (Peruíbe) e gostaria de mais informações!`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}

interface AdCardProps {
  ad: AdSummary;
  searchQuery?: string;
  onManageClick?: (ad: AdSummary) => void;
}

export function AdCard({ ad, searchQuery = '', onManageClick }: AdCardProps) {
  const isSold = ad.status === 'sold';
  const whatsappUrl = buildWhatsAppLink(ad);

  return (
    <div
      className={`group relative bg-surface border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl flex flex-col justify-between ${
        isSold
          ? 'border-rose-900/40 bg-surface/60 opacity-80'
          : 'border-purple-800/40 hover:border-neon-lime/60 hover:shadow-purple-900/20'
      }`}
    >
      {/* Top Banner / Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-card">
        <Image
          src={ad.thumbnail || '/logo.jpg'}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Tarja VENDIDO Carimbo */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="stamp-sold text-xl font-black tracking-widest text-rose-500 border-2 border-rose-500 bg-black/80 px-4 py-1.5 rounded-lg shadow-2xl">
              VENDIDO
            </span>
          </div>
        )}

        {/* Price Tag Pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-surface/90 backdrop-blur-md text-neon-green border border-neon-lime/30 shadow-md">
            {formatPrice(ad.price, ad.priceType)}
          </span>
        </div>

        {/* Bairro Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-surface/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] text-gray-200 border border-purple-700/40 shadow-sm">
          <MapPin className="w-3 h-3 text-neon-lime" />
          <span>{ad.bairro}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Status */}
          <div className="flex items-center gap-2 mb-2 text-xs text-purple-300">
            <span className="capitalize px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/30">
              {ad.category.replace('_', ' ')}
            </span>
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Title */}
          <Link href={`/anuncio/${ad.id}`} className="block">
            <h3 className="font-bold text-gray-100 text-base line-clamp-1 group-hover:text-neon-green transition-colors">
              <HighlightText text={ad.title} query={searchQuery} />
            </h3>
          </Link>

          {/* Description */}
          <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">
            <HighlightText text={ad.description} query={searchQuery} />
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center gap-2">
          {/* Direct WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all duration-150 ${
              isSold
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed pointer-events-none'
                : 'bg-neon-lime hover:bg-neon-green text-gray-950 shadow-md hover:shadow-neon-lime/30 active:scale-[0.98]'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chamar no Whats</span>
          </a>

          {/* Manage Button if authorized */}
          {onManageClick && (
            <button
              onClick={() => onManageClick(ad)}
              className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 hover:text-white transition-colors"
              title="Gerenciar Anúncio"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
