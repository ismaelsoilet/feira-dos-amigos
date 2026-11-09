'use client';

import React from 'react';
import { X, RotateCcw, Check, Filter } from 'lucide-react';
import { AdCategory, AdFilters, PERUIBE_BAIRROS, AD_CATEGORIES } from '@/types/ad';

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
    <div className="fixed inset-0 z-50 flex justify-end bg-purple-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-l border-purple-100 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/70">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-700" />
            <h2 className="font-bold text-lg text-purple-950">Filtros de Anúncios</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-100 text-slate-500 hover:text-purple-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalFilters(prev => ({ ...prev, category: 'all' }))}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                  !localFilters.category || localFilters.category === 'all'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50 hover:border-purple-200'
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
                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                      : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bairro de Peruíbe */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
              Bairro de Peruíbe
            </label>
            <select
              value={localFilters.bairro || 'all'}
              onChange={e => setLocalFilters(prev => ({ ...prev, bairro: e.target.value }))}
              className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
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
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
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
                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                      : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Faixa de Preço */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                Faixa de Preço (R$)
              </label>
            </div>

            {/* Quick Price Shortcuts */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Até R$ 50', min: undefined, max: 50 },
                { label: 'Até R$ 150', min: undefined, max: 150 },
                { label: 'Até R$ 300', min: undefined, max: 300 },
                { label: 'Acima de R$ 300', min: 300, max: undefined },
              ].map(shortcut => {
                const isSelected =
                  localFilters.minPrice === shortcut.min && localFilters.maxPrice === shortcut.max;
                return (
                  <button
                    key={shortcut.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setLocalFilters(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined }));
                      } else {
                        setLocalFilters(prev => ({
                          ...prev,
                          minPrice: shortcut.min,
                          maxPrice: shortcut.max,
                        }));
                      }
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                        : 'bg-purple-50/60 border-purple-200 text-purple-800 hover:bg-purple-100'
                    }`}
                  >
                    {shortcut.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold">Mínimo</span>
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
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold">Máximo</span>
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
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
              Ordenar Resultados
            </label>
            <select
              value={localFilters.sortBy || 'recent'}
              onChange={e => setLocalFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
            >
              <option value="recent">Mais Recentes Primeiro</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="expiring">Próximos de Expirar</option>
            </select>
          </div>

          {/* Filtros de Status & Favoritos */}
          <div className="pt-2 border-t border-purple-100 space-y-2.5">
            {/* Favoritos */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 cursor-pointer hover:border-purple-300 transition-colors">
              <input
                type="checkbox"
                checked={!!localFilters.onlyFavorites}
                onChange={e =>
                  setLocalFilters(prev => ({ ...prev, onlyFavorites: e.target.checked }))
                }
                className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-purple-950 block">
                  ❤️ Apenas Meus Favoritos
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Exibe apenas os itens que você favoritou no aparelho.
                </span>
              </div>
            </label>

            {/* O filtro crucial: Mostrar itens já vendidos */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 cursor-pointer hover:border-purple-300 transition-colors">
              <input
                type="checkbox"
                checked={!!localFilters.includeSold}
                onChange={e => setLocalFilters(prev => ({ ...prev, includeSold: e.target.checked }))}
                className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-purple-950 block">
                  Mostrar itens já vendidos
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Por padrão, itens marcados como vendidos ficam ocultos da busca.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              setLocalFilters({});
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors"
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
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-md shadow-purple-700/25"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
}
