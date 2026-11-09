'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, PackageCheck, Plus, Shield, CheckCircle, ExternalLink, Trash2, RotateCcw } from 'lucide-react';
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

      // Fetch live statuses
      items.forEach(async (item: SavedAdItem) => {
        try {
          const res = await fetch(`/api/ads/${item.id}`);
          if (res.ok) {
            const data = await res.json();
            setAdStatuses(prev => ({ ...prev, [item.id]: data.ad.status }));
          }
        } catch {
          // ignore
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
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-purple-800/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-surface-card border border-purple-700/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Feira</span>
          </Link>
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-neon-green" />
            <span className="text-xs font-black text-white">MEUS ANÚNCIOS</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Meus Anúncios</h1>
            <p className="text-xs text-purple-300">
              Anúncios salvos neste aparelho. Gerencie ou marque como vendido em 1 clique.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wide bg-neon-lime hover:bg-neon-green text-gray-950 transition-all shadow-md shadow-neon-lime/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>

        {savedAds.length === 0 ? (
          <div className="text-center py-16 px-4 max-w-sm mx-auto bg-surface/40 border border-purple-900/30 rounded-3xl p-8">
            <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-700/60 flex items-center justify-center mx-auto text-purple-400 mb-4">
              <PackageCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Nenhum anúncio criado ainda</h3>
            <p className="text-xs text-gray-400 mb-6">
              Quando você publica um item na Feira dos Amigos, ele fica salvo automaticamente aqui no seu
              navegador para você marcar como vendido ou excluir com facilidade.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wide bg-neon-lime hover:bg-neon-green text-gray-950 transition-all shadow-lg shadow-neon-lime/30"
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
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSold
                      ? 'bg-surface/50 border-rose-900/40 opacity-75'
                      : 'bg-surface border-purple-800/40 hover:border-purple-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{item.title}</span>
                      {isSold ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800 text-[10px] font-black uppercase">
                          Vendido
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-neon-lime/20 text-neon-green border border-neon-lime/40 text-[10px] font-bold uppercase">
                          Ativo na Feira
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Publicado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span className="text-purple-300 font-mono">PIN: {item.pin}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/anuncio/${item.id}`}
                      className="p-2.5 rounded-xl bg-surface-card hover:bg-purple-900/60 border border-purple-700/50 text-gray-300 hover:text-white transition-colors"
                      title="Ver na Feira"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setSelectedAdForManage(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-700/60 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-neon-green" />
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
