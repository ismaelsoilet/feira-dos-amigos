'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Camera, Trash2, CheckCircle2, Share2, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { AdCategory, AdPriceType, PERUIBE_BAIRROS, AD_CATEGORIES, Ad } from '@/types/ad';
import { compressImage, formatPhoneInput, validateAdForm } from '@/lib/compress-image';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAd: Ad) => void;
}

export function CreateAdModal({ isOpen, onClose, onSuccess }: CreateAdModalProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdAd, setCreatedAd] = useState<{ ad: Ad; pin: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AdCategory>('outros');
  const [bairro, setBairro] = useState('Centro');
  const [priceType, setPriceType] = useState<AdPriceType>('fixed');
  const [price, setPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [pin, setPin] = useState('');
  const [honeypot, setHoneypot] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      alert('Você pode enviar no máximo 5 fotos por anúncio.');
      return;
    }

    setIsCompressing(true);
    try {
      const compressedList: string[] = [];
      for (const file of files) {
        const compressed = await compressImage(file, 1200, 0.75);
        if (compressed) compressedList.push(compressed);
      }
      setPhotos(prev => [...prev, ...compressedList]);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar as fotos. Tente novamente.');
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validation = validateAdForm({
      title,
      description,
      whatsapp,
      category,
      bairro,
      pin,
    });

    if (!validation.isValid) {
      setErrorMessage(Object.values(validation.errors)[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          bairro,
          priceType,
          price: priceType === 'fixed' ? Number(price) : 0,
          sellerName: sellerName || 'Servidor / Morador de Peruíbe',
          whatsapp: whatsapp.replace(/\D/g, ''),
          photos: photos.length > 0 ? photos : ['/logo.jpg'],
          durationDays,
          pin,
          website_hp: honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao publicar anúncio.');
        setIsSubmitting(false);
        return;
      }

      // Save to localStorage
      try {
        const localSaved = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
        localSaved.unshift({
          id: data.ad.id,
          title: data.ad.title,
          pin,
          createdAt: data.ad.createdAt,
        });
        localStorage.setItem('feira_meus_anuncios', JSON.stringify(localSaved));
      } catch (e) {
        console.warn('localStorage error:', e);
      }

      setCreatedAd({ ad: data.ad, pin });
      onSuccess(data.ad);
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro de conexão ao enviar o anúncio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCreatedAd(null);
    setPhotos([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setWhatsapp('');
    setPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-surface border border-purple-800/60 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-800/40 flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neon-lime/20 border border-neon-lime/50 flex items-center justify-center text-neon-green">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white">Criar Novo Anúncio</h2>
              <p className="text-xs text-purple-300">Feira dos Amigos Peruíbe — Vendas & Trocas</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full hover:bg-purple-900/60 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {createdAd ? (
            /* Success View */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-neon-lime/20 border-2 border-neon-lime flex items-center justify-center mx-auto text-neon-green shadow-xl shadow-neon-green/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white">Anúncio Publicado!</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Seu item já está visível para toda a comunidade de Peruíbe.
                </p>
              </div>

              {/* PIN reminder box */}
              <div className="bg-purple-950/70 border border-purple-700/60 p-4 rounded-2xl max-w-sm mx-auto text-left">
                <div className="flex items-center gap-2 text-neon-green font-bold text-sm mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Código de Gestão (PIN)</span>
                </div>
                <p className="text-xs text-gray-300">
                  Seu PIN para marcar como vendido ou excluir é:
                </p>
                <div className="text-2xl font-black tracking-widest text-white mt-1 text-center bg-black/40 py-2 rounded-xl border border-purple-800">
                  {createdAd.pin}
                </div>
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  Salvamos este anúncio no seu aparelho na aba &quot;Meus Anúncios&quot;.
                </p>
              </div>

              {/* WhatsApp Share Button */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Acabei de publicar "${createdAd.ad.title}" na Feira dos Amigos de Peruíbe! Confira: ${typeof window !== 'undefined' ? window.location.origin : ''}/anuncio/${createdAd.ad.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wide bg-neon-lime hover:bg-neon-green text-gray-950 transition-all shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar no WhatsApp</span>
                </a>

                <button
                  onClick={resetAndClose}
                  className="px-5 py-3 rounded-2xl font-bold text-xs bg-purple-900/60 hover:bg-purple-800 text-gray-200 border border-purple-700/50"
                >
                  Voltar para a Feira
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Honeypot field (hidden from real users, traps spam bots) */}
              <input
                type="text"
                name="website_hp"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                  Fotos do Produto (até 5 fotos)
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-700/60 bg-surface-card group"
                    >
                      <Image src={p} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-purple-700 hover:border-neon-lime bg-surface-card/60 flex flex-col items-center justify-center text-purple-300 hover:text-neon-green cursor-pointer transition-colors">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">Adicionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {isCompressing && (
                  <p className="text-[11px] text-neon-green mt-1 animate-pulse">
                    Otimizando fotos no aparelho...
                  </p>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Bicicleta Caloi Aro 29 em ótimo estado"
                  className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime"
                />
              </div>

              {/* Categoria e Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as AdCategory)}
                    className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
                  >
                    {AD_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Bairro de Peruíbe *
                  </label>
                  <select
                    value={bairro}
                    onChange={e => setBairro(e.target.value)}
                    className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
                  >
                    {PERUIBE_BAIRROS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipo de Preço e Valor */}
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                  Negociação & Preço
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {[
                    { id: 'fixed', label: 'Venda (R$)' },
                    { id: 'trade', label: 'Troca' },
                    { id: 'free', label: 'Doação' },
                    { id: 'negotiable', label: 'A combinar' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPriceType(m.id as AdPriceType)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        priceType === m.id
                          ? 'bg-neon-lime/20 border-neon-lime text-neon-green'
                          : 'bg-surface-card border-purple-800/40 text-gray-300 hover:border-purple-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {priceType === 'fixed' && (
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-surface-card border border-purple-700/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime"
                    />
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Descrição dos Detalhes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Conte o estado de conservação, motivo da venda/troca e pontos de referência para entrega."
                  className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime resize-none"
                />
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Seu Nome ou Apelido
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    placeholder="Ex: João da Prefeitura"
                    className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    WhatsApp para Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={e => setWhatsapp(formatPhoneInput(e.target.value))}
                    placeholder="(13) 9XXXX-XXXX"
                    className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime"
                  />
                </div>
              </div>

              {/* Validade e PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-900/40">
                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Validade do Anúncio
                  </label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-neon-lime"
                  >
                    <option value={7}>7 dias</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias (padrão)</option>
                    <option value={60}>60 dias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Crie um PIN (4 dígitos) *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full bg-surface-card border border-purple-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-lime"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Usado para marcar como vendido ou excluir.
                  </span>
                </div>
              </div>

              {/* Botão de Enviar */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-neon-lime hover:bg-neon-green text-gray-950 transition-all shadow-lg shadow-neon-lime/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Publicando na Feira...</span>
                  ) : (
                    <span>Publicar Anúncio Agora</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
