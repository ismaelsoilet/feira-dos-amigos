'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Search, SlidersHorizontal, PackageCheck } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilter: () => void;
  onOpenCreate: () => void;
  hasActiveFilters?: boolean;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onOpenFilter,
  onOpenCreate,
  hasActiveFilters = false,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-purple-800/40 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-neon-lime shadow-md shadow-neon-green/30">
            <Image
              src="/logo.jpg"
              alt="Feira dos Amigos Peruíbe"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-lg text-white leading-tight flex items-center gap-1.5">
              FEIRA DOS AMIGOS
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neon-lime/20 text-neon-green border border-neon-lime/40">
                Peruíbe
              </span>
            </h1>
            <p className="text-[11px] font-semibold text-purple-300">Vendas, Trocas & Doações</p>
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
              className="w-full bg-surface-card/90 border border-purple-700/50 rounded-full pl-9 pr-10 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-neon-lime focus:ring-1 focus:ring-neon-lime transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Filter Drawer Toggle */}
          <button
            onClick={onOpenFilter}
            className={`relative p-2 rounded-full border transition-all ${
              hasActiveFilters
                ? 'bg-purple-900 border-neon-lime text-neon-green shadow-md'
                : 'bg-surface-card border-purple-700/50 text-gray-300 hover:text-white hover:border-purple-500'
            }`}
            title="Filtros avançados"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-neon-green rounded-full shadow-sm shadow-neon-green animate-pulse" />
            )}
          </button>

          {/* Desktop "Meus Anúncios" button */}
          <Link
            href="/meus-anuncios"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-card border border-purple-700/50 text-xs font-bold text-gray-200 hover:text-white hover:border-purple-500 transition-colors"
          >
            <PackageCheck className="w-4 h-4 text-purple-400" />
            <span>Meus Anúncios</span>
          </Link>

          {/* "Publicar Anúncio" CTA */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wide bg-neon-lime hover:bg-neon-green text-gray-950 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-neon-lime/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anunciar Grátis</span>
          </button>
        </div>
      </div>
    </header>
  );
}
