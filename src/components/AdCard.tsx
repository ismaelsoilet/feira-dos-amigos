'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, MapPin, Tag, ShieldCheck, Clock, Heart, QrCode, Eye, Sparkles, Maximize2 } from 'lucide-react';
import { AdSummary, AdPriceType } from '@/types/ad';
import { HighlightText } from './HighlightText';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { QRCodeModal } from './QRCodeModal';

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
  onAdClick?: (ad: AdSummary) => void;
  onManageClick?: (ad: AdSummary) => void;
}

export function AdCard({ ad, searchQuery = '', onAdClick, onManageClick }: AdCardProps) {
  const isSold = ad.status === 'sold';
  const whatsappUrl = buildWhatsAppLink(ad);
  const [favorite, setFavorite] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(ad.id));

    const handleFavUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setFavorite(customEvent.detail.includes(ad.id));
      }
    };

    window.addEventListener('feira_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('feira_favorites_updated', handleFavUpdate);
  }, [ad.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite(ad.id);
    setFavorite(isNowFav);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Record engagement metric asynchronously without blocking the user
    try {
      fetch(`/api/ads/${ad.id}/whatsapp-click`, { method: 'POST' }).catch(err => {
        console.warn('Metric recording error:', err);
      });
    } catch (err) {
      console.warn('Metric error:', err);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onAdClick) {
      e.preventDefault();
      onAdClick(ad);
    }
  };

  // Check if ad was posted within the last 24 hours
  const isNew = (() => {
    try {
      const createdTime = new Date(ad.createdAt).getTime();
      return Date.now() - createdTime < 24 * 60 * 60 * 1000;
    } catch (err) {
      console.warn('Date parse error:', err);
      return false;
    }
  })();

  const adShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/anuncio/${ad.id}`
    : `https://feiradosamigos.vercel.app/anuncio/${ad.id}`;

  const imageSrc = ad.thumbnail || '/logo.jpg';

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl flex flex-col justify-between cursor-pointer ${
          isSold
            ? 'border-rose-200 bg-slate-50/80 opacity-80'
            : 'border-purple-100 hover:border-purple-300 hover:shadow-purple-950/10'
        }`}
      >
        {/* Top Banner: Aspect-Square with Ambient Blur for Non-Square Photos */}
        <div className="relative aspect-square w-full overflow-hidden bg-purple-950/5">
          {/* Ambient blurred backdrop that gracefully frames horizontal & vertical photos */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={imageSrc}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover blur-md scale-110 opacity-30"
            />
          </div>

          {/* Centered crisp product image - object-contain prevents ANY cropping on portrait/landscape photos */}
          <Image
            src={imageSrc}
            alt={ad.title}
            fill
            className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300 relative z-1"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Quick Details Peek Icon on Hover */}
          <div className="absolute inset-0 bg-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-white/95 text-purple-950 text-xs font-black shadow-lg flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-purple-700" />
              Ver Detalhes
            </span>
          </div>

          {/* Tarja VENDIDO Carimbo */}
          {isSold && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="stamp-sold text-xl font-black tracking-widest text-rose-600 border-2 border-rose-600 bg-white/95 px-4 py-1.5 rounded-lg shadow-xl">
                VENDIDO
              </span>
            </div>
          )}

          {/* Top Left Badges: Favorite & New Tag */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-150 ${
                favorite
                  ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                  : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white'
              }`}
              title={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
            </button>

            {isNew && !isSold && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-sm flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                NOVO
              </span>
            )}
          </div>

          {/* Price Tag Pill */}
          <div className="absolute bottom-2.5 left-2.5 z-20">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-white/95 backdrop-blur-md text-purple-900 border border-purple-200 shadow-md">
              {formatPrice(ad.price, ad.priceType)}
            </span>
          </div>

          {/* Bairro Badge */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-purple-900 border border-purple-200 shadow-sm">
            <MapPin className="w-3 h-3 text-purple-600" />
            <span>{ad.bairro}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Category & Status & Metrics */}
            <div className="flex items-center justify-between mb-2 text-xs text-purple-700">
              <div className="flex items-center gap-2">
                <span className="capitalize px-2 py-0.5 rounded-md bg-purple-50 border border-purple-100 font-semibold text-[11px]">
                  {ad.category.replace('_', ' ')}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Engagement Counters */}
              {(ad.views || 0) > 0 && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1" title={`${ad.views} visualizações`}>
                  <Eye className="w-3 h-3 text-purple-400" />
                  {ad.views}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-purple-700 transition-colors">
              <HighlightText text={ad.title} query={searchQuery} />
            </h3>

            {/* Description */}
            <p className="text-slate-600 text-xs mt-1.5 line-clamp-2">
              <HighlightText text={ad.description} query={searchQuery} />
            </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center gap-2">
            {/* Direct WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-150 ${
                isSold
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-600/30 active:scale-[0.98]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no Whats</span>
            </a>

            {/* QR Code trigger for feirantes */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQrModal(true);
              }}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 hover:text-purple-950 transition-colors"
              title="Gerar QR Code para Barraca"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Manage Button if authorized */}
            {onManageClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageClick(ad);
                }}
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 hover:text-purple-950 transition-colors"
                title="Gerenciar Anúncio"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={ad.title}
        url={adShareUrl}
      />
    </>
  );
}
