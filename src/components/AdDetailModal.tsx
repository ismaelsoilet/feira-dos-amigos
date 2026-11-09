'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  MessageCircle,
  MapPin,
  Tag,
  Clock,
  Eye,
  Heart,
  QrCode,
  ShieldCheck,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { AdSummary, Ad } from '@/types/ad';
import { formatPrice, buildWhatsAppLink } from './AdCard';
import { HighlightText } from './HighlightText';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { QRCodeModal } from './QRCodeModal';
import { getNextPhotoIndex, getPrevPhotoIndex, getSwipeDirection } from '@/lib/carousel';

interface AdDetailModalProps {
  isOpen: boolean;
  ad: AdSummary | null;
  searchQuery?: string;
  onClose: () => void;
  onManageClick?: (ad: AdSummary) => void;
}

export function AdDetailModal({
  isOpen,
  ad,
  searchQuery = '',
  onClose,
  onManageClick,
}: AdDetailModalProps) {
  const [fullAd, setFullAd] = useState<Ad | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Sync favorite and fetch full ad details when modal opens
  useEffect(() => {
    if (!ad || !isOpen) {
      setFullAd(null);
      setActivePhotoIdx(0);
      return;
    }

    setIsFav(isFavorite(ad.id));
    setActivePhotoIdx(0);

    // Record view asynchronously
    fetch(`/api/ads/${ad.id}/view`, { method: 'POST' }).catch(err => {
      console.warn('Failed to record ad view:', err);
    });

    // Fetch full ad to get all photos array & latest stats
    fetch(`/api/ads/${ad.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.ad) {
          setFullAd(data.ad);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch full ad details:', err);
      });
  }, [ad, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ad) {
    return null;
  }

  const photos: string[] =
    fullAd?.photos && fullAd.photos.length > 0
      ? fullAd.photos
      : ad.thumbnail
      ? [ad.thumbnail]
      : ['/logo.jpg'];

  const isSold = (fullAd?.status || ad.status) === 'sold';
  const whatsappUrl = buildWhatsAppLink(ad);
  const currentPhoto = photos[activePhotoIdx] || '/logo.jpg';

  const isNew = (() => {
    try {
      const createdTime = new Date(ad.createdAt).getTime();
      return Date.now() - createdTime < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  })();

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx(prev => getNextPhotoIndex(prev, photos.length));
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx(prev => getPrevPhotoIndex(prev, photos.length));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const direction = getSwipeDirection(touchStartXRef.current, touchEndX, 40);
    if (direction === 'left') {
      handleNextPhoto();
    } else if (direction === 'right') {
      handlePrevPhoto();
    }
    touchStartXRef.current = null;
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavorite(ad.id);
    setIsFav(updated);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/anuncio/${ad.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ad.title} - Feira dos Amigos`,
          text: `Confira este anúncio na Feira dos Amigos de Peruíbe: ${ad.title}`,
          url,
        });
        return;
      } catch {
        // Ignored if cancelled by user
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const handleWhatsAppClick = () => {
    try {
      fetch(`/api/ads/${ad.id}/whatsapp-click`, { method: 'POST' }).catch(err => {
        console.warn('Metric recording error:', err);
      });
    } catch (err) {
      console.warn('Metric error:', err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop click dismiss */}
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        {/* Modal Window: Bottom Sheet on Mobile, Centered Card on Desktop */}
        <div
          className="relative z-10 w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-100 flex flex-col md:flex-row overflow-hidden max-h-[94vh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator Bar */}
          <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-purple-950 shadow-md border border-slate-200 transition-all active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Responsive Photo Gallery with Ambient Blur */}
          <div className="md:w-1/2 bg-slate-900 shrink-0 flex flex-col justify-between relative select-none">
            {/* Main Photo Container */}
            <div
              className="relative aspect-4/3 sm:aspect-square md:aspect-auto md:flex-1 md:min-h-[380px] w-full overflow-hidden bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Ambient Blurred Background (renders non-square photos seamlessly) */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={currentPhoto}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-cover blur-xl scale-125 opacity-40"
                />
              </div>

              {/* Crisp Foreground Image (object-contain ensures zero product clipping) */}
              <Image
                src={currentPhoto}
                alt={ad.title}
                fill
                className="object-contain p-2 relative z-10 transition-all duration-300"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />

              {/* Tarja VENDIDO Carimbo */}
              {isSold && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <span className="stamp-sold text-2xl font-black tracking-widest text-rose-600 border-4 border-rose-600 bg-white/95 px-5 py-2 rounded-xl shadow-2xl">
                    VENDIDO
                  </span>
                </div>
              )}

              {/* Top Tags: NOVO & Photo Counter */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                {isNew && !isSold && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    NOVO
                  </span>
                )}
                {photos.length > 1 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {activePhotoIdx + 1} / {photos.length}
                  </span>
                )}
              </div>

              {/* Carousel Arrows (only if multiple photos) */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip (if multiple photos) */}
            {photos.length > 1 && (
              <div className="p-2.5 bg-slate-950/90 border-t border-white/10 flex gap-2 overflow-x-auto scrollbar-none z-10 shrink-0">
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activePhotoIdx === idx
                        ? 'border-purple-400 scale-95 shadow-md shadow-purple-500/50'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Miniatura ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Full Details & Fully Responsive Actions */}
          <div className="md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Location Badges (with padding right for close button) */}
              <div className="flex flex-wrap items-center gap-2 pr-10">
                <span className="capitalize px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  {ad.category.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 font-semibold text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  {ad.bairro} (Peruíbe)
                </span>
              </div>

              {/* Title with Strong Search Highlight */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                <HighlightText text={ad.title} query={searchQuery} />
              </h2>

              {/* Price & PriceType */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-900">
                  {formatPrice(ad.price, ad.priceType)}
                </span>
                {ad.priceType === 'negotiable' && (
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Negociável
                  </span>
                )}
              </div>

              {/* Seller and Stats Line */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <p className="font-bold text-purple-950">Vendedor: {ad.sellerName}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Publicado em {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {(fullAd?.views || ad.views || 0) > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-purple-700">
                      <Eye className="w-3.5 h-3.5 text-purple-500" />
                      {fullAd?.views || ad.views} views
                    </span>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div>
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
                  Descrição do Item
                </h3>
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <HighlightText
                    text={fullAd?.description || ad.description}
                    query={searchQuery}
                  />
                </div>
              </div>

              {/* Security Reminder */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Dica de Segurança:</strong> Encontre o vendedor em locais públicos de Peruíbe
                  (praças, orla ou feiras). Nunca pague adiantado sem ver o produto.
                </span>
              </div>
            </div>

            {/* Bottom Actions Area: Completely Responsive, Never Cut Off */}
            <div className="mt-6 pt-4 border-t border-purple-100 space-y-2.5 pb-2 sm:pb-0">
              {/* WhatsApp Main CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] ${
                  isSold
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span className="truncate">Conversar no WhatsApp com {ad.sellerName}</span>
              </a>

              {/* Secondary Actions Grid: 4 Equal-Sized Clean Responsive Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Favorite Button */}
                <button
                  onClick={handleToggleFav}
                  className={`py-2 px-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${
                    isFav
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-purple-50/60 border-purple-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                >
                  <Heart className={`w-4 h-4 shrink-0 ${isFav ? 'fill-current text-rose-500' : ''}`} />
                  <span className="truncate">{isFav ? 'Salvo' : 'Favoritar'}</span>
                </button>

                {/* 2. Share Button */}
                <button
                  onClick={handleShare}
                  className="py-2 px-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                  title="Compartilhar anúncio"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-bold truncate">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate">Compartilhar</span>
                    </>
                  )}
                </button>

                {/* 3. Stand QR Code */}
                <button
                  onClick={() => setShowQrModal(true)}
                  className="py-2 px-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                  title="Gerar QR Code da Barraca"
                >
                  <QrCode className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">QR Barraca</span>
                </button>

                {/* 4. Manage / Edit with PIN */}
                {onManageClick && (
                  <button
                    onClick={() => {
                      onClose();
                      onManageClick(ad);
                    }}
                    className="py-2 px-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
                    title="Gerenciar / Editar este anúncio com PIN"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="truncate">Editar</span>
                  </button>
                )}
              </div>

              {/* 5. Full Page Link */}
              <div className="pt-1 text-center">
                <Link
                  href={`/anuncio/${ad.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-950 hover:underline transition-colors py-1 px-3"
                  title="Abrir em página dedicada com link permanente"
                >
                  <span>Abrir página cheia do anúncio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stand QR Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={ad.title}
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/anuncio/${ad.id}`}
      />
    </>
  );
}
