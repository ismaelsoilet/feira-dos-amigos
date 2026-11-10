'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  KeyRound,
  Lock,
  Unlock,
  Camera,
  Star,
  Plus,
} from 'lucide-react';
import { Ad, AdStatus, AdPriceType, AdCategory, AD_CATEGORIES, PERUIBE_BAIRROS } from '@/types/ad';
import { formatPhoneInput, validateAdForm, compressImage } from '@/lib/compress-image';

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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Edit form state
  const [title, setTitle] = useState(initialAd?.title || adTitle || '');
  const [description, setDescription] = useState(initialAd?.description || '');
  const [price, setPrice] = useState<number | string>(initialAd?.price ?? '');
  const [priceType, setPriceType] = useState<AdPriceType>(initialAd?.priceType || 'fixed');
  const [category, setCategory] = useState<AdCategory>(initialAd?.category || 'outros');
  const [bairro, setBairro] = useState(initialAd?.bairro || 'Centro');
  const [sellerName, setSellerName] = useState(initialAd?.sellerName || '');
  const [whatsapp, setWhatsapp] = useState(initialAd?.whatsapp || '');
  const [photos, setPhotos] = useState<string[]>(initialAd?.photos || []);
  const [isCompressing, setIsCompressing] = useState(false);

  // Reset & load on open
  useEffect(() => {
    if (!isOpen) {
      setIsUnlocked(false);
      setErrorMessage('');
      setSuccessMessage('');
      setFieldErrors({});
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (initialAd?.photos && initialAd.photos.length > 0) {
      setPhotos(initialAd.photos);
    }

    // Try finding saved PIN from localStorage
    let savedPin = initialPin;
    if (!savedPin) {
      try {
        const saved = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
        const match = saved.find((item: { id: string; pin?: string }) => item.id === adId);
        if (match?.pin) {
          savedPin = match.pin;
          setPin(match.pin);
        }
      } catch (err) {
        console.warn('localStorage reading error:', err);
      }
    } else {
      setPin(initialPin);
    }

    // Attempt to preload full ad data if available (bypassing any browser cache)
    fetch(`/api/ads/${adId}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    })
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
          setWhatsapp(formatPhoneInput(a.whatsapp || ''));
          if (a.photos && Array.isArray(a.photos)) {
            setPhotos(a.photos);
          }
        }
      })
      .catch(err => console.warn('Error pre-loading ad details:', err));
  }, [isOpen, adId, initialPin, initialAd]);

  if (!isOpen) return null;

  // Photo handlers (parallel processing, fast 960px WebP compression)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      setErrorMessage('Você pode manter no máximo 5 fotos no anúncio.');
      return;
    }

    setIsCompressing(true);
    setErrorMessage('');
    try {
      const compressedList = await Promise.all(
        files.map(file => compressImage(file, 960, 0.72))
      );
      const valid = compressedList.filter(Boolean);
      setPhotos(prev => [...prev, ...valid].slice(0, 5));
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao processar fotos. Tente novamente.');
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  // Step 1: Verify PIN to unlock editing
  const handleVerifyPinToUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toUpperCase();

    if (!cleanPin || !/^[a-zA-Z0-9]{4,6}$/.test(cleanPin)) {
      setErrorMessage('Digite o PIN de 6 caracteres (letras e números).');
      return;
    }

    setIsVerifyingPin(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/ads/${adId}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'PIN de segurança incorreto.');
        return;
      }

      // Populate form with 100% verified ad data
      if (data.ad) {
        const a = data.ad;
        setTitle(a.title || '');
        setDescription(a.description || '');
        setPrice(a.price ?? '');
        setPriceType(a.priceType || 'fixed');
        setCategory(a.category || 'outros');
        setBairro(a.bairro || 'Centro');
        setSellerName(a.sellerName || '');
        setWhatsapp(formatPhoneInput(a.whatsapp || ''));
        if (a.photos && Array.isArray(a.photos)) {
          setPhotos(a.photos);
        }
      }

      setIsUnlocked(true);
      setSuccessMessage('PIN verificado! Dados carregados para edição.');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err) {
      console.error('PIN verification error:', err);
      setErrorMessage('Erro ao verificar o PIN. Verifique sua conexão.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Step 2: Submit updated ad with same obligations as creation
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const cleanPin = pin.trim().toUpperCase();

    // Enforce exact same obligations as CreateAdModal via validateAdForm
    const validation = validateAdForm({
      title,
      description,
      whatsapp,
      category,
      bairro,
      pin: cleanPin,
    });

    // Custom check for price
    if (priceType === 'fixed') {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        validation.errors.price = 'Informe um valor válido maior que zero.';
        validation.isValid = false;
      }
    }

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setErrorMessage('Por favor, corrija os campos obrigatórios destacados abaixo.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/ads/${adId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: cleanPin,
          title: title.trim(),
          description: description.trim(),
          price: priceType === 'fixed' ? Number(price) : 0,
          priceType,
          category,
          bairro: bairro.trim(),
          sellerName: sellerName.trim(),
          whatsapp: whatsapp.replace(/\D/g, ''),
          photos: photos.length > 0 ? photos : ['/logo.jpg'],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao atualizar o anúncio.');
        return;
      }

      setSuccessMessage('Anúncio atualizado com sucesso na Feira dos Amigos!');
      if (onAdUpdated && data.ad) {
        onAdUpdated(data.ad);
      }

      // Close modal after feedback
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Update ad error:', err);
      setErrorMessage('Erro ao salvar as alterações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Status Action (Sold / Reopen)
  const handleStatusChange = async (newStatus: 'active' | 'sold') => {
    const cleanPin = pin.trim().toUpperCase();
    if (!cleanPin || !/^[a-zA-Z0-9]{4,6}$/.test(cleanPin)) {
      setErrorMessage('Digite o PIN de 6 caracteres para alterar o status.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/ads/${adId}/manage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao alterar status.');
        return;
      }

      setSuccessMessage(data.message || 'Status atualizado com sucesso!');
      onStatusChanged(newStatus);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error('Status change error:', err);
      setErrorMessage('Erro de conexão ao alterar status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    const cleanPin = pin.trim().toUpperCase();
    if (!cleanPin || !/^[a-zA-Z0-9]{4,6}$/.test(cleanPin)) {
      setErrorMessage('Digite o PIN de 6 caracteres para autorizar a exclusão.');
      return;
    }

    if (!confirm('Tem certeza de que deseja EXCLUIR DEFINITIVAMENTE este anúncio da feira?')) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/ads/${adId}/manage`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao excluir anúncio.');
        return;
      }

      // Clean from localStorage immediately
      try {
        const saved = JSON.parse(localStorage.getItem('feira_meus_anuncios') || '[]');
        const updated = saved.filter((item: { id: string }) => item.id !== adId);
        localStorage.setItem('feira_meus_anuncios', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage cleanup error on delete:', e);
      }

      setSuccessMessage('Anúncio excluído com sucesso.');
      if (onDeleted) {
        onDeleted();
      }
      setTimeout(() => onClose(), 600);
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage('Erro de conexão ao excluir anúncio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-purple-200 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 shrink-0">
          <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Gerenciar Anúncio
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">{adTitle}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-purple-50 p-1 rounded-2xl mb-4 border border-purple-100 shrink-0">
          <button
            onClick={() => {
              setActiveTab('edit');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-purple-700 hover:text-purple-950'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar Informações</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('status');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'status'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-purple-700 hover:text-purple-950'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Status & Exclusão</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 shrink-0 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 shrink-0 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Edit Tab */}
        {activeTab === 'edit' && (
          <div className="overflow-y-auto flex-1 pr-1">
            {!isUnlocked ? (
              /* PIN SECURITY GATE: Requires PIN first before showing edit form */
              <form onSubmit={handleVerifyPinToUnlock} className="space-y-4 py-3">
                <div className="text-center p-5 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-base text-purple-950 mb-1">
                    Edição Protegida por PIN
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Para sua segurança e dos feirantes, digite o PIN cadastrado para desbloquear a edição deste anúncio.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    PIN do Anúncio (6 caracteres)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={pin}
                      onChange={e => {
                        setPin(e.target.value.toUpperCase());
                        setErrorMessage('');
                      }}
                      placeholder="Ex: ABC123"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none text-base font-mono uppercase tracking-widest text-slate-900 bg-purple-50/30"
                    />
                    <KeyRound className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    💡 Letras e números são aceitos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingPin || !pin.trim()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white disabled:opacity-50 transition-all shadow-md shadow-purple-700/20 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isVerifyingPin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando PIN...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Verificar PIN e Desbloquear Edição</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* UNLOCKED EDIT FORM: Displays all pre-filled fields with same obligations as creation */
              <form onSubmit={handleEditSubmit} className="space-y-3.5">
                {/* Unlocked Confirmation Banner */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    Edição Desbloqueada (PIN: <span className="font-mono">{pin}</span>)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsUnlocked(false)}
                    className="text-[11px] text-purple-700 hover:underline font-semibold"
                  >
                    Trocar PIN
                  </button>
                </div>

                {/* Photos Management Section */}
                <div className="space-y-2 p-3 bg-purple-50/40 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Fotos do Anúncio ({photos.length}/5)
                    </label>
                    <span className="text-[11px] text-purple-700 font-semibold">
                      A 1ª foto é a capa principal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {photos.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-purple-200 bg-white shadow-sm"
                      >
                        <Image
                          src={src}
                          alt={`Foto ${idx + 1}`}
                          fill
                          unoptimized={src.startsWith('data:')}
                          className="object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-purple-700 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm z-10">
                            Capa
                          </span>
                        )}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 z-20">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setPrimaryPhoto(idx)}
                              className="text-[9px] bg-purple-600 hover:bg-purple-700 text-white font-bold px-1.5 py-0.5 rounded shadow w-full text-center"
                            >
                              Virar Capa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors shadow"
                            title="Excluir foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {photos.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-600 bg-white hover:bg-purple-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-1 text-center group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={isCompressing}
                          className="hidden"
                        />
                        {isCompressing ? (
                          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-bold text-purple-950">
                              {photos.length === 0 ? 'Adicionar' : 'Incluir'}
                            </span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                  {photos.length === 0 && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      ⚠️ Nenhuma foto selecionada. O logo oficial da Feira dos Amigos será utilizado como capa.
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Título do Anúncio *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Bicicleta Caloi Aro 29"
                    maxLength={100}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all ${
                      fieldErrors.title
                        ? 'border-rose-300 ring-2 ring-rose-200'
                        : 'border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20'
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.title}</p>
                  )}
                </div>

                {/* Price Type & Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tipo de Negociação e Valor *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                    {[
                      { id: 'fixed', label: 'Preço Fixo' },
                      { id: 'negotiable', label: 'A Combinar' },
                      { id: 'trade', label: 'Troca' },
                      { id: 'free', label: 'Doação' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPriceType(t.id as AdPriceType)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                          priceType === t.id
                            ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                            : 'bg-purple-50/50 text-slate-700 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {priceType === 'fixed' && (
                    <div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={price}
                          onChange={e => setPrice(e.target.value)}
                          placeholder="0,00"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${
                            fieldErrors.price
                              ? 'border-rose-300 ring-2 ring-rose-200'
                              : 'border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20'
                          }`}
                        />
                      </div>
                      {fieldErrors.price && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.price}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Category & Bairro */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as AdCategory)}
                      className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-purple-600"
                    >
                      {AD_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Bairro em Peruíbe *
                    </label>
                    <select
                      value={bairro}
                      onChange={e => setBairro(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-purple-600"
                    >
                      {PERUIBE_BAIRROS.map(b => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seller Name & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={e => setSellerName(e.target.value)}
                      placeholder="Ex: Carlos Silva"
                      maxLength={50}
                      className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={e => setWhatsapp(formatPhoneInput(e.target.value))}
                      placeholder="(13) 9XXXX-XXXX"
                      maxLength={15}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs text-slate-900 outline-none ${
                        fieldErrors.whatsapp
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-purple-200 focus:border-purple-600'
                      }`}
                    />
                    {fieldErrors.whatsapp && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.whatsapp}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Descrição do Item *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva o estado de conservação, detalhes e motivo da venda..."
                    maxLength={1000}
                    className={`w-full p-3 rounded-xl border text-xs text-slate-900 outline-none leading-relaxed ${
                      fieldErrors.description
                        ? 'border-rose-300 ring-2 ring-rose-200'
                        : 'border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20'
                    }`}
                  />
                  {fieldErrors.description && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.description}</p>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-purple-700 hover:bg-purple-800 text-white disabled:opacity-50 transition-all shadow-md shadow-purple-700/20 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando Alterações...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações no Anúncio</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Status & Exclusão Tab */}
        {activeTab === 'status' && (
          <div className="space-y-4 py-2 overflow-y-auto flex-1">
            {/* PIN Input if not already verified */}
            {!isUnlocked && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  PIN de Segurança (6 caracteres) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 focus:border-purple-600 outline-none font-mono text-sm tracking-widest uppercase text-slate-900 bg-purple-50/20"
                />
              </div>
            )}

            {isUnlocked && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PIN {pin} ativo para ações de status</span>
              </div>
            )}

            {/* Current Status Banner */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Status Atual:</span>
              {currentStatus === 'sold' ? (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-black uppercase text-[11px] border border-rose-200">
                  Vendido
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[11px] border border-emerald-200">
                  Ativo na Feira
                </span>
              )}
            </div>

            {/* Mark as Sold or Reopen */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Alterar Status</label>
              {currentStatus === 'active' ? (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleStatusChange('sold')}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Marcar como VENDIDO</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleStatusChange('active')}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reativar Anúncio na Feira</span>
                </button>
              )}
            </div>

            {/* Danger Zone: Delete */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-rose-700 mb-1.5">Área de Perigo</label>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleDelete}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Excluir Anúncio Definitivamente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
