'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, PackageOpen } from 'lucide-react';
import { AdSummary } from '@/types/ad';
import { AdCard } from './AdCard';

interface AdGridProps {
  ads: AdSummary[];
  isLoading?: boolean;
  searchQuery?: string;
  onManageClick?: (ad: AdSummary) => void;
  onClearFilters?: () => void;
}

export function AdGrid({
  ads,
  isLoading = false,
  searchQuery = '',
  onManageClick,
  onClearFilters,
}: AdGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="bg-surface border border-purple-900/40 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-surface-card" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-purple-950 rounded w-2/3" />
              <div className="h-3 bg-purple-950 rounded w-full" />
              <div className="h-8 bg-purple-950 rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto">
        <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-2 border-neon-lime/40 shadow-xl shadow-purple-900/40">
          <Image src="/logo.jpg" alt="Mascote Feira dos Amigos" fill className="object-cover" />
        </div>
        <h3 className="font-black text-xl text-white mb-2">Nenhum anúncio encontrado!</h3>
        <p className="text-sm text-gray-400 mb-6">
          Não achamos nenhum item com os filtros ou termo digitado. Tente buscar por outros termos ou
          limpar os filtros.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide bg-purple-900 hover:bg-purple-800 text-neon-green border border-neon-lime/30 transition-all shadow-md"
          >
            <PackageOpen className="w-4 h-4" />
            <span>Limpar Filtros e Ver Todos</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {ads.map(ad => (
        <AdCard
          key={ad.id}
          ad={ad}
          searchQuery={searchQuery}
          onManageClick={onManageClick}
        />
      ))}
    </div>
  );
}
