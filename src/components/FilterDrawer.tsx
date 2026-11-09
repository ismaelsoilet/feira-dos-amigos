'use client';

import React from 'react';
import { X, RotateCcw, Check, Sparkles, Filter } from 'lucide-react';
import { AdCategory, AdPriceType, AdFilters, PERUIBE_BAIRROS, AD_CATEGORIES } from '@/types/ad';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdFilters;
  onApplyFilters: (filters: AdFilters) => void;
  onResetFilters: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<AdFilters>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border-l border-purple-800/60 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-800/40 flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-neon-green" />
            <h2 className="font-bold text-lg text-white">Filtros de Anúncios</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-900/60 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalFilters(prev => ({ ...prev, category: 'all' }))}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                  !localFilters.category || localFilters.category === 'all'
                    ? 'bg-neon-lime/20 border-neon-lime text-neon-green'
                    : 'bg-surface-card border-purple-800/40 text-gray-300 hover:border-purple-600'
                }`}
              >
                Todas as Categorias
              </button>
              {AD_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setLocalFilters(prev => ({ ...prev, category: cat.id }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                    localFilters.category === cat.id
                      ? 'bg-neon-lime/20 border-neon-lime text-neon-green'
                      : 'bg-surface-card border-purple-800/40 text-gray-300 hover:border-purple-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bairro de Peruíbe */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Bairro de Peruíbe
            </label>
            <select
              value={localFilters.bairro || 'all'}
              onChange={e => setLocalFilters(prev => ({ ...prev, bairro: e.target.value }))}
              className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
            >
              <option value="all">Todos os Bairros</option>
              {PERUIBE_BAIRROS.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidade / Tipo de Preço */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Tipo de Negociação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'Qualquer Tipo' },
                { id: 'fixed', label: 'Venda com Valor' },
                { id: 'trade', label: 'Apenas Trocas' },
                { id: 'free', label: 'Doação / Grátis' },
                { id: 'negotiable', label: 'A Combinar' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLocalFilters(prev => ({ ...prev, priceType: t.id as any }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                    (localFilters.priceType || 'all') === t.id
                      ? 'bg-neon-lime/20 border-neon-lime text-neon-green'
                      : 'bg-surface-card border-purple-800/40 text-gray-300 hover:border-purple-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Faixa de Preço */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Faixa de Preço (R$)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-gray-400">Mínimo</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0,00"
                  value={localFilters.minPrice ?? ''}
                  onChange={e =>
                    setLocalFilters(prev => ({
                      ...prev,
                      minPrice: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
                />
              </div>
              <div>
                <span className="text-[11px] text-gray-400">Máximo</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Sem limite"
                  value={localFilters.maxPrice ?? ''}
                  onChange={e =>
                    setLocalFilters(prev => ({
                      ...prev,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
                />
              </div>
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Ordenar Resultados
            </label>
            <select
              value={localFilters.sortBy || 'recent'}
              onChange={e => setLocalFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
            >
              <option value="recent">Mais Recentes Primeiro</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="expiring">Próximos de Expirar</option>
            </select>
          </div>

          {/* O filtro crucial: Mostrar itens já vendidos */}
          <div className="pt-2 border-t border-purple-900/40">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 cursor-pointer hover:border-purple-600 transition-colors">
              <input
                type="checkbox"
                checked={!!localFilters.includeSold}
                onChange={e => setLocalFilters(prev => ({ ...prev, includeSold: e.target.checked }))}
                className="w-4 h-4 accent-neon-green rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-gray-200 block">
                  Mostrar itens já vendidos
                </span>
                <span className="text-[11px] text-gray-400 block">
                  Por padrão, itens marcados como vendidos ficam ocultos da busca.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-purple-800/40 bg-surface-card flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              setLocalFilters({});
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-700 text-xs font-bold text-gray-300 hover:text-white hover:border-purple-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onApplyFilters(localFilters);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wide bg-neon-lime hover:bg-neon-green text-gray-950 transition-all shadow-md shadow-neon-lime/20"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
}
