'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  SlidersHorizontal,
  Heart,
} from 'lucide-react';
import { AdSummary, AdCategory, AdFilters, AD_CATEGORIES, CommunityStats } from '@/types/ad';
import { filterAndSearchAds } from '@/lib/search';
import { getFavorites } from '@/lib/favorites';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { FilterDrawer } from '@/components/FilterDrawer';
import { AdGrid } from '@/components/AdGrid';
import { CreateAdModal } from '@/components/CreateAdModal';
import { ManageAdModal } from '@/components/ManageAdModal';

export default function HomePage() {
  const [ads, setAds] = useState<AdSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AdFilters>({ includeSold: false, sortBy: 'recent' });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAdForManage, setSelectedAdForManage] = useState<AdSummary | null>(null);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ads?includeSold=true`);
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (err) {
      console.error('Failed to load ads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to load community stats:', err);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchStats();
    setFavorites(getFavorites());

    const handleFavUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setFavorites(customEvent.detail);
      }
    };
    window.addEventListener('feira_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('feira_favorites_updated', handleFavUpdate);
  }, []);

  // Filter and search computation
  const filteredAds = useMemo(() => {
    const combinedFilters: AdFilters = {
      ...filters,
      favoriteIds: favorites,
    };
    return filterAndSearchAds(ads, searchQuery, combinedFilters);
  }, [ads, searchQuery, filters, favorites]);

  const activeCategory = filters.category || 'all';

  const handleCategorySelect = (catId: AdCategory | 'all') => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === catId ? 'all' : catId,
    }));
  };

  const hasActiveFilters = Boolean(
    (filters.category && filters.category !== 'all') ||
      (filters.bairro && filters.bairro !== 'all') ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      (filters.priceType && filters.priceType !== 'all') ||
      filters.includeSold ||
      filters.onlyFavorites
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between pb-24 md:pb-12">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenCreate={() => setIsCreateOpen(true)}
        hasActiveFilters={hasActiveFilters}
        favoritesCount={favorites.length}
        onlyFavoritesActive={!!filters.onlyFavorites}
        onToggleFavorites={() =>
          setFilters(prev => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
        }
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full space-y-6">
        {/* Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 border border-purple-200/40 p-5 sm:p-7 shadow-xl shadow-purple-900/10 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-black text-white tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>
                  {stats
                    ? `${stats.totalActive} ${stats.totalActive === 1 ? 'anúncio ativo' : 'anúncios ativos'} • ${stats.bairrosCount} ${stats.bairrosCount === 1 ? 'bairro' : 'bairros'} de Peruíbe`
                    : 'COMUNIDADE DE PERUÍBE — 100% GRÁTIS'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Venda, Troque e Ache Oportunidades em Peruíbe
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
                Classificados livres para servidores e munícipes. Publique sem cadastro, negocie direto no
                WhatsApp e apoie os amigos da cidade!
              </p>
            </div>

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white shadow-2xl shrink-0">
              <Image
                src="/logo.jpg"
                alt="Mascote da Feira dos Amigos"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Quick Category Chips Carousel */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
            <span className="uppercase tracking-wider">Categorias Rápidas</span>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="text-purple-700 hover:text-purple-950 hover:underline flex items-center gap-1 font-semibold"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Todos os Filtros</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`py-2 px-3.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                activeCategory === 'all'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                  : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50 hover:border-purple-200'
              }`}
            >
              🌟 Todos
            </button>
            {AD_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`py-2 px-3.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Price & Favorites Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {/* Meus Favoritos Pill */}
            <button
              onClick={() =>
                setFilters(prev => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap border transition-all ${
                filters.onlyFavorites
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20'
                  : 'bg-rose-50/60 border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-current' : ''}`} />
              <span>Favoritos {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
            </button>

            {/* Price shortcuts */}
            {[
              { label: 'Até R$ 50', max: 50 },
              { label: 'Até R$ 150', max: 150 },
              { label: 'Até R$ 300', max: 300 },
            ].map(pricePill => {
              const isSelected = filters.maxPrice === pricePill.max && filters.minPrice === undefined;
              return (
                <button
                  key={pricePill.label}
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      minPrice: undefined,
                      maxPrice: isSelected ? undefined : pricePill.max,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                      : 'bg-purple-50/50 border-purple-200 text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  {pricePill.label}
                </button>
              );
            })}

            {/* Trocas & Doações Pills */}
            <button
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  priceType: prev.priceType === 'trade' ? 'all' : 'trade',
                }))
              }
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap border transition-all ${
                filters.priceType === 'trade'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                  : 'bg-purple-50/50 border-purple-200 text-purple-900 hover:bg-purple-100'
              }`}
            >
              🔄 Trocas
            </button>

            <button
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  priceType: prev.priceType === 'free' ? 'all' : 'free',
                }))
              }
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap border transition-all ${
                filters.priceType === 'free'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                  : 'bg-purple-50/50 border-purple-200 text-purple-900 hover:bg-purple-100'
              }`}
            >
              🎁 Doações / Grátis
            </button>
          </div>
        </section>

        {/* Status / Active Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              {filteredAds.length} {filteredAds.length === 1 ? 'anúncio' : 'anúncios'}
            </span>
            {searchQuery && (
              <span className="text-purple-800">
                para &quot;<span className="text-purple-950 font-bold">{searchQuery}</span>&quot;
              </span>
            )}
            {filters.includeSold && (
              <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold">
                incluindo vendidos
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ includeSold: false, sortBy: 'recent' })}
              className="text-xs text-purple-700 hover:text-purple-950 font-semibold underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Ad Grid */}
        <AdGrid
          ads={filteredAds}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onManageClick={ad => setSelectedAdForManage(ad)}
          onClearFilters={() => {
            setSearchQuery('');
            setFilters({ includeSold: false, sortBy: 'recent' });
          }}
        />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={newFilters => setFilters(newFilters)}
        onResetFilters={() => setFilters({ includeSold: false, sortBy: 'recent' })}
      />

      {/* Create Ad Modal */}
      <CreateAdModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchAds();
        }}
      />

      {/* Manage Ad Modal */}
      {selectedAdForManage && (
        <ManageAdModal
          isOpen={true}
          onClose={() => setSelectedAdForManage(null)}
          adId={selectedAdForManage.id}
          adTitle={selectedAdForManage.title}
          currentStatus={selectedAdForManage.status}
          onStatusChanged={newStatus => {
            setAds(prev =>
              prev.map(a => (a.id === selectedAdForManage.id ? { ...a, status: newStatus } : a))
            );
          }}
          onDeleted={() => {
            setAds(prev => prev.filter(a => a.id !== selectedAdForManage.id));
          }}
        />
      )}
    </div>
  );
}
