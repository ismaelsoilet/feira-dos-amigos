'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { AdStatus } from '@/types/ad';

interface ManageAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
  currentStatus: AdStatus;
  initialPin?: string;
  onStatusChanged: (newStatus: AdStatus) => void;
  onDeleted?: () => void;
}

export function ManageAdModal({
  isOpen,
  onClose,
  adId,
  adTitle,
  currentStatus,
  initialPin = '',
  onStatusChanged,
  onDeleted,
}: ManageAdModalProps) {
  const [pin, setPin] = useState(initialPin);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    setPin(initialPin);
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialPin, isOpen]);

  if (!isOpen) return null;

  const handleToggleStatus = async (targetStatus: 'active' | 'sold') => {
    if (!pin || pin.trim().length < 4) {
      setErrorMessage('Digite o PIN de 4 dígitos cadastrado na criação do anúncio.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
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
      console.error(err);
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
        const updated = saved.filter((item: any) => item.id !== adId);
        localStorage.setItem('feira_meus_anuncios', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage error:', e);
      }

      setSuccessMessage('Anúncio excluído com sucesso.');
      if (onDeleted) onDeleted();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao tentar excluir anúncio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-purple-800/60 rounded-3xl shadow-2xl p-5 overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neon-green" />
            <h3 className="font-black text-lg text-white">Gerenciar Anúncio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ad Title info */}
        <div className="bg-surface-card p-3 rounded-xl border border-purple-800/40">
          <span className="text-[11px] text-gray-400 block">Anúncio selecionado:</span>
          <span className="font-bold text-sm text-gray-100 line-clamp-1">{adTitle}</span>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-gray-400">Status atual:</span>
            {currentStatus === 'sold' ? (
              <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800 text-[11px] font-black uppercase">
                Vendido
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-neon-lime/20 text-neon-green border border-neon-lime/40 text-[11px] font-bold uppercase">
                Ativo
              </span>
            )}
          </div>
        </div>

        {/* PIN Input */}
        <div>
          <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
            Código de Gestão (PIN de 4 dígitos)
          </label>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Digite o PIN do anúncio"
            className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime tracking-widest text-center text-lg font-bold"
          />
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-neon-lime/20 border border-neon-lime/60 text-neon-green text-xs flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 shrink-0 text-neon-green" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {currentStatus === 'active' ? (
            <button
              onClick={() => handleToggleStatus('sold')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Marcar como Vendido</span>
            </button>
          ) : (
            <button
              onClick={() => handleToggleStatus('active')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide bg-neon-lime hover:bg-neon-green text-gray-950 transition-all shadow-lg shadow-neon-lime/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reativar Anúncio</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-surface-card hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-purple-800/40 hover:border-rose-900/60 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Anúncio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
