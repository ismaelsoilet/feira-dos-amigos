'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Search, SlidersHorizontal, PackageCheck, Heart } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilter: () => void;
  onOpenCreate: () => void;
  hasActiveFilters?: boolean;
  favoritesCount?: number;
  onlyFavoritesActive?: boolean;
  onToggleFavorites?: () => void;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onOpenFilter,
  onOpenCreate,
  hasActiveFilters = false,
  favoritesCount = 0,
  onlyFavoritesActive = false,
  onToggleFavorites,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm shadow-purple-950/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-600 shadow-md shadow-purple-600/20">
            <Image
              src="/logo.jpg"
              alt="Feira dos Amigos Peruíbe"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-lg text-purple-950 leading-tight flex items-center gap-1.5">
              FEIRA DOS AMIGOS
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                Peruíbe
              </span>
            </h1>
            <p className="text-[11px] font-semibold text-purple-600">Vendas, Trocas & Doações</p>
          </div>
        </Link>

        {/* Search Input */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-purple-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar por produto, bairro ou vendedor..."
              className="w-full bg-purple-50/70 border border-purple-200 rounded-full pl-9 pr-10 py-2 text-sm text-purple-950 placeholder-purple-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-xs text-purple-400 hover:text-purple-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Favorites Filter Shortcut */}
          {onToggleFavorites && (
            <button
              onClick={onToggleFavorites}
              className={`relative p-2 rounded-full border transition-all ${
                onlyFavoritesActive
                  ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/20'
                  : 'bg-white border-purple-200 text-purple-700 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200'
              }`}
              title={onlyFavoritesActive ? 'Ver todos os anúncios' : 'Ver apenas favoritos'}
            >
              <Heart className={`w-5 h-5 ${onlyFavoritesActive ? 'fill-current' : ''}`} />
              {(favoritesCount ?? 0) > 0 && !onlyFavoritesActive && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Filter Drawer Toggle */}
          <button
            onClick={onOpenFilter}
            className={`relative p-2 rounded-full border transition-all ${
              hasActiveFilters
                ? 'bg-purple-100 border-purple-600 text-purple-900 shadow-sm'
                : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
            }`}
            title="Filtros avançados"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-purple-600 rounded-full shadow-sm shadow-purple-600 animate-pulse" />
            )}
          </button>

          {/* Desktop "Meus Anúncios" button */}
          <Link
            href="/meus-anuncios"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 hover:text-purple-950 transition-colors"
          >
            <PackageCheck className="w-4 h-4 text-purple-600" />
            <span>Meus Anúncios</span>
          </Link>

          {/* "Publicar Anúncio" CTA */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-purple-700/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anunciar Grátis</span>
          </button>
        </div>
      </div>
    </header>
  );
}
