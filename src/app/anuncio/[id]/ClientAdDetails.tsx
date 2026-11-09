'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MapPin,
  MessageCircle,
  Clock,
  Shield,
  Share2,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle,
} from 'lucide-react';
import { Ad, AdStatus } from '@/types/ad';
import { formatPrice, buildWhatsAppLink } from '@/components/AdCard';
import { ManageAdModal } from '@/components/ManageAdModal';

interface ClientAdDetailsProps {
  initialAd: Omit<Ad, 'pinHash'>;
}

export function ClientAdDetails({ initialAd }: ClientAdDetailsProps) {
  const [ad, setAd] = useState(initialAd);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [savedPin, setSavedPin] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if current device has saved PIN in localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
      const match = saved.find((item: any) => item.id === ad.id);
      if (match?.pin) {
        setSavedPin(match.pin);
      }
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  }, [ad.id]);

  const isSold = ad.status === 'sold';
  const whatsappUrl = buildWhatsAppLink({
    ...ad,
    thumbnail: ad.photos[0] || '/logo.jpg',
    photosCount: ad.photos.length,
  });

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Confira este anúncio na Feira dos Amigos (Peruíbe): ${ad.title}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Photos Column */}
      <div className="lg:col-span-7 space-y-3">
        {/* Main Photo */}
        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-surface-card border border-purple-800/40 shadow-xl">
          <Image
            src={ad.photos[selectedPhotoIndex] || '/logo.jpg'}
            alt={ad.title}
            fill
            className="object-cover"
            priority
          />

          {/* Tarja VENDIDO Carimbo */}
          {isSold && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="stamp-sold text-3xl font-black tracking-widest text-rose-500 border-4 border-rose-500 bg-black/85 px-6 py-2 rounded-xl shadow-2xl">
                VENDIDO
              </span>
            </div>
          )}

          {/* Price Pill */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="px-4 py-1.5 rounded-full text-base font-black bg-surface/95 backdrop-blur-md text-neon-green border border-neon-lime/40 shadow-xl">
              {formatPrice(ad.price, ad.priceType)}
            </span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {ad.photos.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {ad.photos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative w-18 h-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedPhotoIndex === idx
                    ? 'border-neon-lime shadow-md shadow-neon-green/30 scale-95'
                    : 'border-purple-800/50 opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={photo} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Column */}
      <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span className="capitalize px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/50 font-bold">
              {ad.category.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-white leading-tight">{ad.title}</h1>

          {/* Location Badge */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-purple-800/40">
            <MapPin className="w-5 h-5 text-neon-green shrink-0" />
            <div>
              <span className="text-[11px] text-gray-400 block">Localização em Peruíbe</span>
              <span className="text-sm font-bold text-gray-100">{ad.bairro}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Detalhes do Anúncio
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line bg-surface/50 p-4 rounded-2xl border border-purple-900/30">
              {ad.description}
            </p>
          </div>

          {/* Vendedor Info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-800/30">
            <div className="w-10 h-10 rounded-full bg-neon-lime/20 border border-neon-lime/40 flex items-center justify-center text-neon-green">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 block">Anunciante</span>
              <span className="text-sm font-bold text-gray-100">{ad.sellerName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-4 border-t border-purple-900/40">
          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              isSold
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none'
                : 'bg-neon-lime hover:bg-neon-green text-gray-950 shadow-neon-lime/30 active:scale-[0.98]'
            }`}
          >
            <MessageCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Chamar no WhatsApp</span>
          </a>

          {/* Share & Manage Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-surface-card hover:bg-purple-900/60 border border-purple-700/50 text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={() => setIsManageModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-xs font-bold text-purple-200 hover:text-white transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-neon-green" />
              <span>Gerenciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manage Modal */}
      <ManageAdModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        adId={ad.id}
        adTitle={ad.title}
        currentStatus={ad.status}
        initialPin={savedPin}
        onStatusChanged={newStatus => {
          setAd(prev => ({ ...prev, status: newStatus }));
        }}
        onDeleted={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }}
      />
    </div>
  );
}
