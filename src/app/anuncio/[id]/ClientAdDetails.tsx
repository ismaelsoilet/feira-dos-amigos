'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MapPin,
  MessageCircle,
  Share2,
  Calendar,
  User,
  Shield,
  Heart,
  QrCode,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Ad } from '@/types/ad';
import { formatPrice, buildWhatsAppLink } from '@/components/AdCard';
import { ManageAdModal } from '@/components/ManageAdModal';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { QRCodeModal } from '@/components/QRCodeModal';

interface ClientAdDetailsProps {
  initialAd: Omit<Ad, 'pinHash'>;
}

export function ClientAdDetails({ initialAd }: ClientAdDetailsProps) {
  const [ad, setAd] = useState(initialAd);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [savedPin, setSavedPin] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [favorite, setFavorite] = useState(false);

  // Record ad view once on mount
  useEffect(() => {
    fetch(`/api/ads/${ad.id}/view`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.views) {
          setAd(prev => ({ ...prev, views: data.views }));
        }
      })
      .catch(err => console.warn('Ad view metric error:', err));
  }, [ad.id]);

  // Sync favorite state
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

  const handleToggleFavorite = () => {
    const isNowFav = toggleFavorite(ad.id);
    setFavorite(isNowFav);
  };

  const handleWhatsAppClick = () => {
    fetch(`/api/ads/${ad.id}/whatsapp-click`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.whatsappClicks) {
          setAd(prev => ({ ...prev, whatsappClicks: data.whatsappClicks }));
        }
      })
      .catch(err => console.warn('Ad whatsapp metric error:', err));
  };

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
      } catch (err) {
        console.warn('Navigator share error, falling back to clipboard:', err);
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
        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-purple-50 border border-purple-100 shadow-md">
          <Image
            src={ad.photos[selectedPhotoIndex] || '/logo.jpg'}
            alt={ad.title}
            fill
            className="object-cover"
            priority
          />

          {/* Tarja VENDIDO Carimbo */}
          {isSold && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="stamp-sold text-3xl font-black tracking-widest text-rose-600 border-4 border-rose-600 bg-white/95 px-6 py-2 rounded-xl shadow-2xl">
                VENDIDO
              </span>
            </div>
          )}

          {/* Top Floating Actions: Favorite & QR */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-full backdrop-blur-md shadow-md transition-all ${
                favorite
                  ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                  : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
              }`}
              title={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-3 rounded-full bg-white/90 backdrop-blur-md text-purple-900 hover:bg-white shadow-md transition-all"
              title="Ver QR Code da Barraca"
            >
              <QrCode className="w-5 h-5 text-purple-700" />
            </button>
          </div>

          {/* Price Pill */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="px-4 py-1.5 rounded-full text-base font-black bg-white/95 backdrop-blur-md text-purple-950 border border-purple-200 shadow-lg">
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
                    ? 'border-purple-600 shadow-md shadow-purple-600/20 scale-95'
                    : 'border-purple-100 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={photo} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Column */}
      <div className="lg:col-span-5 space-y-5 flex flex-col justify-between bg-white border border-purple-100 p-6 rounded-3xl shadow-sm">
        <div className="space-y-4">
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs text-purple-700">
            <span className="capitalize px-3 py-1 rounded-full bg-purple-50 border border-purple-100 font-bold">
              {ad.category.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{ad.title}</h1>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 text-xs text-slate-500 py-1 border-b border-purple-50">
            <span className="flex items-center gap-1.5" title="Visualizações">
              <Eye className="w-4 h-4 text-purple-600" />
              <strong>{ad.views || 0}</strong> visualizações
            </span>
            <span className="flex items-center gap-1.5" title="Cliques no WhatsApp">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <strong>{ad.whatsappClicks || 0}</strong> contatos
            </span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
            <MapPin className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <span className="text-[11px] text-purple-700 font-semibold block">Localização em Peruíbe</span>
              <span className="text-sm font-bold text-slate-900">{ad.bairro}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
              Detalhes do Anúncio
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-purple-50/30 p-4 rounded-2xl border border-purple-100/70">
              {ad.description}
            </p>
          </div>

          {/* Vendedor Info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Anunciante</span>
              <span className="text-sm font-bold text-slate-900">{ad.sellerName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-4 border-t border-purple-100">
          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className={`w-full py-4 px-4 rounded-2xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-md ${
              isSold
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-[0.98]'
            }`}
          >
            <MessageCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Chamar no WhatsApp</span>
          </a>

          {/* Share, QR & Manage Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-600" />
              <span>{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="py-2.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-700" />
              <span>QR Code</span>
            </button>

            <button
              onClick={() => setIsManageModalOpen(true)}
              className="py-2.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span>Gerenciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Stands & Stalls */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={ad.title}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Manage & Edit Modal */}
      <ManageAdModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        adId={ad.id}
        adTitle={ad.title}
        currentStatus={ad.status}
        initialPin={savedPin}
        initialAd={ad}
        onStatusChanged={newStatus => {
          setAd(prev => ({ ...prev, status: newStatus }));
        }}
        onAdUpdated={updatedAd => {
          setAd(updatedAd);
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
