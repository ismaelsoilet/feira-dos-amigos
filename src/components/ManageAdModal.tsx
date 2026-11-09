'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle,
  Trash2,
  RotateCcw,
  AlertCircle,
  Pencil,
  Settings,
  Save,
  Loader2,
} from 'lucide-react';
import { Ad, AdStatus, AdPriceType, AdCategory, AD_CATEGORIES, PERUIBE_BAIRROS } from '@/types/ad';
import { formatPhoneInput } from '@/lib/compress-image';

interface ManageAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
  currentStatus: AdStatus;
  initialPin?: string;
  initialAd?: Partial<Ad>;
  onStatusChanged: (newStatus: AdStatus) => void;
  onAdUpdated?: (updatedAd: Ad) => void;
  onDeleted?: () => void;
}

export function ManageAdModal({
  isOpen,
  onClose,
  adId,
  adTitle,
  currentStatus,
  initialPin = '',
  initialAd,
  onStatusChanged,
  onAdUpdated,
  onDeleted,
}: ManageAdModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'status'>('edit');
  const [pin, setPin] = useState(initialPin);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit form state
  const [title, setTitle] = useState(initialAd?.title || adTitle);
  const [description, setDescription] = useState(initialAd?.description || '');
  const [price, setPrice] = useState<number | string>(initialAd?.price ?? '');
  const [priceType, setPriceType] = useState<AdPriceType>(initialAd?.priceType || 'fixed');
  const [category, setCategory] = useState<AdCategory>(initialAd?.category || 'outros');
  const [bairro, setBairro] = useState(initialAd?.bairro || 'Centro');
  const [sellerName, setSellerName] = useState(initialAd?.sellerName || '');
  const [whatsapp, setWhatsapp] = useState(initialAd?.whatsapp || '');

  // Load existing ad data if opened without full initialAd
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setSuccessMessage('');

    // Try auto-loading PIN from localStorage if initialPin is empty
    let resolvedPin = initialPin;
    if (!resolvedPin) {
      try {
        const saved = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
        const match = saved.find((item: { id: string; pin?: string }) => item.id === adId);
        if (match?.pin) {
          resolvedPin = match.pin;
          setPin(match.pin);
        }
      } catch (err) {
        console.warn('localStorage reading error:', err);
      }
    } else {
      setPin(initialPin);
    }

    // Fetch full ad details to ensure form is completely populated
    fetch(`/api/ads/${adId}`)
      .then(res => res.json())
      .then(data => {
        if (data.ad) {
          const a = data.ad;
          setTitle(a.title || '');
          setDescription(a.description || '');
          setPrice(a.price ?? '');
          setPriceType(a.priceType || 'fixed');
          setCategory(a.category || 'outros');
          setBairro(a.bairro || 'Centro');
          setSellerName(a.sellerName || '');
          setWhatsapp(a.whatsapp || '');
        }
      })
      .catch(err => console.warn('Error loading ad details for edit modal:', err));
  }, [isOpen, adId, initialPin]);

  if (!isOpen) return null;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.trim().length < 4) {
      setErrorMessage('Digite o PIN de 4 dígitos cadastrado na criação do anúncio.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('O título do anúncio não pode ficar vazio.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('A descrição do anúncio não pode ficar vazia.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/ads/${adId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin.trim(),
          title: title.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          priceType,
          category,
          bairro: bairro.trim(),
          sellerName: sellerName.trim(),
          whatsapp: whatsapp.replace(/\D/g, ''),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'PIN incorreto ou erro ao atualizar anúncio.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Anúncio atualizado com sucesso!');
      if (onAdUpdated && data.ad) {
        onAdUpdated(data.ad);
      }
      if (data.ad?.status) {
        onStatusChanged(data.ad.status);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Network error while editing ad:', err);
      setErrorMessage('Erro de conexão ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (targetStatus: 'active' | 'sold') => {
    if (!pin || pin.trim().length < 4) {
      setErrorMessage('Digite o PIN de 4 dígitos cadastrado na criação do anúncio.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/ads/${adId}/manage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim(), status: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'PIN incorreto ou erro ao alterar status.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      onStatusChanged(targetStatus);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Network error while updating status:', err);
      setErrorMessage('Erro de conexão ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pin || pin.trim().length < 4) {
      setErrorMessage('Digite o PIN para confirmar a exclusão.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este anúncio definitivamente?')) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/ads/${adId}/manage`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'PIN incorreto ou erro ao excluir.');
        setIsLoading(false);
        return;
      }

      // Remove from localStorage if present
      try {
        const saved = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
        const updated = saved.filter((item: { id: string }) => item.id !== adId);
        localStorage.setItem('feira_meus_anuncios', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage error during delete cleanup:', e);
      }

      setSuccessMessage('Anúncio excluído com sucesso.');
      if (onDeleted) onDeleted();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.warn('Network error while deleting ad:', err);
      setErrorMessage('Erro ao tentar excluir anúncio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-purple-200 rounded-3xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-700" />
            <h3 className="font-black text-lg text-purple-950">Gerenciar Anúncio com PIN</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-purple-900 hover:bg-purple-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 bg-purple-50 rounded-2xl my-3 border border-purple-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'edit'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-purple-900 hover:bg-white/60'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar Informações</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'status'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-purple-900 hover:bg-white/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Status & Exclusão</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {activeTab === 'edit' ? (
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Preço e Tipo de Preço */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={priceType === 'free' || priceType === 'trade'}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600 disabled:bg-slate-100 disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Modalidade
                  </label>
                  <select
                    value={priceType}
                    onChange={e => setPriceType(e.target.value as AdPriceType)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="fixed">Venda (Preço Fixo)</option>
                    <option value="negotiable">A Combinar</option>
                    <option value="trade">Apenas Troca</option>
                    <option value="free">Doação / Grátis</option>
                  </select>
                </div>
              </div>

              {/* Categoria e Bairro */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as AdCategory)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    {AD_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Bairro de Peruíbe
                  </label>
                  <select
                    value={bairro}
                    onChange={e => setBairro(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    {PERUIBE_BAIRROS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nome do Vendedor e WhatsApp */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    WhatsApp (DDD 13)
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={e => setWhatsapp(formatPhoneInput(e.target.value))}
                    placeholder="(13) 99999-9999"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                  Descrição dos Detalhes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* PIN Confirmation */}
              <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200">
                <label className="block text-xs font-black text-purple-950 uppercase tracking-wider mb-1">
                  PIN de Segurança Cadastrado (4 dígitos) *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="PIN de 4 dígitos"
                  className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-center text-lg font-black tracking-widest text-purple-950 focus:outline-none focus:border-purple-600"
                />
                <span className="text-[11px] text-purple-700/80 mt-1 block">
                  Necessário para autenticar que você é o proprietário do anúncio.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white transition-all shadow-md shadow-purple-700/25 flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando Alterações...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações com PIN</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Ad Title info */}
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100">
                <span className="text-[11px] text-purple-700 font-semibold block">Anúncio selecionado:</span>
                <span className="font-bold text-sm text-purple-950 line-clamp-1">{adTitle}</span>
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Status atual:</span>
                  {currentStatus === 'sold' ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-black uppercase">
                      Vendido
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase">
                      Ativo na Feira
                    </span>
                  )}
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
                  Código de Gestão (PIN de 4 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Digite o PIN do anúncio"
                  className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2.5 text-sm text-purple-950 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 tracking-widest text-center text-lg font-bold shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {currentStatus === 'active' ? (
                  <button
                    onClick={() => handleToggleStatus('sold')}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Marcar como Vendido</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus('active')}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-md shadow-purple-700/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reativar Anúncio</span>
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Anúncio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
