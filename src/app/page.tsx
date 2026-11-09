'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  PackageCheck,
  PlusCircle,
  Tag,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { AdSummary, AdCategory, AdFilters, AD_CATEGORIES } from '@/types/ad';
import { filterAndSearchAds } from '@/lib/search';
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

  useEffect(() => {
    fetchAds();
  }, []);

  // Filter and search computation
  const filteredAds = useMemo(() => {
    return filterAndSearchAds(ads, searchQuery, filters);
  }, [ads, searchQuery, filters]);

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
      filters.includeSold
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
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full space-y-6">
        {/* Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cosmic-purple/40 via-surface to-surface-card border border-purple-800/50 p-5 sm:p-7 shadow-xl shadow-purple-950/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-lime/20 border border-neon-lime/40 text-[11px] font-black text-neon-green tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMUNIDADE DE PERUÍBE — 100% GRÁTIS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Venda, Troque e Ache Oportunidades em Peruíbe
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                Classificados livres para servidores e munícipes. Publique sem cadastro, negocie direto no
                WhatsApp e apoie os amigos da cidade!
              </p>
            </div>

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-neon-lime shadow-2xl shadow-neon-green/30 shrink-0">
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
          <div className="flex items-center justify-between text-xs font-bold text-purple-300">
            <span className="uppercase tracking-wider">Categorias Rápidas</span>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="text-neon-green hover:underline flex items-center gap-1"
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
                  ? 'bg-neon-lime text-gray-950 border-neon-lime shadow-md shadow-neon-lime/30'
                  : 'bg-surface border-purple-800/40 text-gray-300 hover:border-purple-600'
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
                    ? 'bg-neon-lime text-gray-950 border-neon-lime shadow-md shadow-neon-lime/30'
                    : 'bg-surface border-purple-800/40 text-gray-300 hover:border-purple-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Status / Active Count Bar */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-200">
              {filteredAds.length} {filteredAds.length === 1 ? 'anúncio' : 'anúncios'}
            </span>
            {searchQuery && (
              <span className="text-purple-300">
                para &quot;<span className="text-neon-green font-semibold">{searchQuery}</span>&quot;
              </span>
            )}
            {filters.includeSold && (
              <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-[10px] font-bold">
                incluindo vendidos
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ includeSold: false, sortBy: 'recent' })}
              className="text-xs text-purple-300 hover:text-white underline"
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
