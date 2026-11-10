'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PackageCheck, Plus, Shield, ExternalLink } from 'lucide-react';
import { ManageAdModal } from '@/components/ManageAdModal';
import { CreateAdModal } from '@/components/CreateAdModal';
import { AdStatus } from '@/types/ad';

interface SavedAdItem {
  id: string;
  title: string;
  pin: string;
  createdAt: string;
}

export default function MeusAnunciosPage() {
  const [savedAds, setSavedAds] = useState<SavedAdItem[]>([]);
  const [selectedAdForManage, setSelectedAdForManage] = useState<SavedAdItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adStatuses, setAdStatuses] = useState<Record<string, AdStatus>>({});

  const loadSavedAds = () => {
    try {
      const items = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
      setSavedAds(items);

      // Fetch live statuses and auto-clean deleted ads
      items.forEach(async (item: SavedAdItem) => {
        try {
          const res = await fetch(`/api/ads/${item.id}?_t=${Date.now()}`, {
            cache: 'no-store',
          });
          if (res.status === 404) {
            // Ad was deleted, remove from state and localStorage
            setSavedAds(prev => {
              const cleaned = prev.filter(a => a.id !== item.id);
              try {
                localStorage.setItem('feira_meus_anuncios', JSON.stringify(cleaned));
              } catch (_) {}
              return cleaned;
            });
          } else if (res.ok) {
            const data = await res.json();
            setAdStatuses(prev => ({ ...prev, [item.id]: data.ad.status }));
          }
        } catch (err) {
          console.warn('Failed to fetch status for ad:', item.id, err);
        }
      });
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  };

  useEffect(() => {
    loadSavedAds();
  }, []);

  const handleDeleted = (id: string) => {
    const updated = savedAds.filter(a => a.id !== id);
    setSavedAds(updated);
    try {
      localStorage.setItem('feira_meus_anuncios', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update localStorage:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 transition-colors py-1.5 px-3 rounded-xl bg-purple-50 border border-purple-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Feira</span>
          </Link>
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-black text-purple-950">MEUS ANÚNCIOS</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-purple-950">Meus Anúncios</h1>
            <p className="text-xs text-purple-700">
              Anúncios salvos neste aparelho. Gerencie ou marque como vendido em 1 clique.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-md shadow-purple-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>

        {savedAds.length === 0 ? (
          <div className="text-center py-16 px-4 max-w-sm mx-auto bg-white border border-purple-100 rounded-3xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-purple-600 mb-4">
              <PackageCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-purple-950 mb-2">Nenhum anúncio criado ainda</h3>
            <p className="text-xs text-slate-500 mb-6">
              Quando você publica um item na Feira dos Amigos, ele fica salvo automaticamente aqui no seu
              navegador para você marcar como vendido ou excluir com facilidade.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-md shadow-purple-700/25"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Meu Primeiro Anúncio</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedAds.map(item => {
              const status = adStatuses[item.id] || 'active';
              const isSold = status === 'sold';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                    isSold
                      ? 'bg-slate-50 border-rose-200 opacity-80'
                      : 'bg-white border-purple-100 hover:border-purple-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{item.title}</span>
                      {isSold ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black uppercase">
                          Vendido
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                          Ativo na Feira
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Publicado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span className="text-purple-700 font-mono font-bold">PIN: {item.pin}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/anuncio/${item.id}`}
                      className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-colors"
                      title="Ver na Feira"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setSelectedAdForManage(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-purple-700" />
                      <span>Gerenciar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedAdForManage && (
        <ManageAdModal
          isOpen={true}
          onClose={() => setSelectedAdForManage(null)}
          adId={selectedAdForManage.id}
          adTitle={selectedAdForManage.title}
          currentStatus={adStatuses[selectedAdForManage.id] || 'active'}
          initialPin={selectedAdForManage.pin}
          onStatusChanged={newStatus => {
            setAdStatuses(prev => ({ ...prev, [selectedAdForManage.id]: newStatus }));
          }}
          onAdUpdated={updatedAd => {
            setSavedAds(prev =>
              prev.map(item =>
                item.id === selectedAdForManage.id ? { ...item, title: updatedAd.title } : item
              )
            );
          }}
          onDeleted={() => handleDeleted(selectedAdForManage.id)}
        />
      )}

      <CreateAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadSavedAds()}
      />
    </div>
  );
}
