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
      const compressedList = await Promise.all(
        files.map(file => compressImage(file, 960, 0.72))
      );
      const valid = compressedList.filter(Boolean);
      setPhotos(prev => [...prev, ...valid].slice(0, 5));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-purple-200 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-100 flex items-center justify-between bg-purple-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-lg text-purple-950">Criar Novo Anúncio</h2>
              <p className="text-xs text-purple-600">Feira dos Amigos Peruíbe — Vendas & Trocas</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full hover:bg-purple-100 text-slate-400 hover:text-purple-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {createdAd ? (
            /* Success View */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-purple-950">Anúncio Publicado!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Seu item já está visível para toda a comunidade de Peruíbe.
                </p>
              </div>

              {/* PIN reminder box */}
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl max-w-sm mx-auto text-left shadow-sm">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-1">
                  <Shield className="w-4 h-4 text-purple-700" />
                  <span>Código de Gestão (PIN)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Seu PIN para marcar como vendido ou excluir é:
                </p>
                <div className="text-2xl font-black tracking-widest text-purple-950 mt-1 text-center bg-white py-2 rounded-xl border border-purple-300 shadow-sm">
                  {createdAd.pin}
                </div>
                <p className="text-[11px] text-purple-600 mt-2 text-center font-medium">
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
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar no WhatsApp</span>
                </a>

                <button
                  onClick={resetAndClose}
                  className="px-5 py-3 rounded-2xl font-bold text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200"
                >
                  Voltar para a Feira
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Honeypot field */}
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
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                  Fotos do Produto (até 5 fotos)
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-200 bg-purple-50 group shadow-sm"
                    >
                      <Image src={p} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <Trash2 className="w-5 h-5 text-rose-400" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/50 flex flex-col items-center justify-center text-purple-700 hover:text-purple-900 cursor-pointer transition-colors shadow-sm">
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
                  <p className="text-[11px] text-purple-700 mt-1 animate-pulse font-medium">
                    Otimizando fotos no aparelho...
                  </p>
                )}
              </div>

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
                  placeholder="Ex: Bicicleta Caloi Aro 29 em ótimo estado"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Categoria e Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as AdCategory)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
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
                    Bairro de Peruíbe *
                  </label>
                  <select
                    value={bairro}
                    onChange={e => setBairro(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
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
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
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
                          ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                          : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50 hover:border-purple-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {priceType === 'fixed' && (
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-500">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-white border border-purple-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                )}
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
                  placeholder="Conte o estado de conservação, motivo da venda/troca e pontos de referência para entrega."
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Seu Nome ou Apelido
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    placeholder="Ex: João da Prefeitura"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    WhatsApp para Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={e => setWhatsapp(formatPhoneInput(e.target.value))}
                    placeholder="(13) 9XXXX-XXXX"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Validade e PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-100">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Validade do Anúncio
                  </label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value={7}>7 dias</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias (padrão)</option>
                    <option value={60}>60 dias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Crie um PIN (6 caracteres) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-sm font-mono font-bold tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 uppercase"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Exatamente 6 caracteres (letras e números permitidos).
                  </span>
                </div>
              </div>

              {/* Botão de Enviar */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-lg shadow-purple-700/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
