'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SlidersHorizontal, Plus, PackageCheck } from 'lucide-react';

interface BottomNavProps {
  onOpenCreate: () => void;
  onOpenFilter: () => void;
  hasActiveFilters?: boolean;
}

export function BottomNav({ onOpenCreate, onOpenFilter, hasActiveFilters = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-purple-800/50 pb-safe">
      <div className="flex items-center justify-around py-2 px-3 relative">
        {/* Início */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
            pathname === '/' ? 'text-neon-green' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </Link>

        {/* Filtros */}
        <button
          onClick={onOpenFilter}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold relative transition-colors ${
            hasActiveFilters ? 'text-neon-green font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="absolute top-1 right-3 w-2 h-2 bg-neon-green rounded-full shadow-sm shadow-neon-green" />
          )}
        </button>

        {/* Botão Central Destacado "Anunciar" */}
        <button
          onClick={onOpenCreate}
          className="flex flex-col items-center -mt-6 group focus:outline-none"
        >
          <div className="w-13 h-13 rounded-full bg-neon-lime group-hover:bg-neon-green text-gray-950 flex items-center justify-center shadow-lg shadow-neon-lime/40 border-4 border-surface transform active:scale-90 transition-transform">
            <Plus className="w-7 h-7 stroke-[3]" />
          </div>
          <span className="text-[11px] font-black text-neon-green mt-0.5 tracking-tight">Anunciar</span>
        </button>

        {/* Meus Anúncios */}
        <Link
          href="/meus-anuncios"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
            pathname === '/meus-anuncios' ? 'text-neon-green' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <PackageCheck className="w-5 h-5" />
          <span>Meus Itens</span>
        </Link>
      </div>
    </nav>
  );
}
