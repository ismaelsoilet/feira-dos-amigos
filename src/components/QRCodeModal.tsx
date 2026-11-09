'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Download, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function QRCodeModal({ isOpen, onClose, title, url }: QRCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#581c87', // deep purple
          light: '#ffffff',
        },
      })
        .then(uri => setDataUrl(uri))
        .catch(err => console.warn('QR Code generation error:', err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy link error:', err);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-purple-200 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex p-3 rounded-2xl bg-purple-100 text-purple-700 mb-3">
          <QrCode className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900 leading-snug">
          QR Code do Anúncio
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1 px-4 font-medium">
          {title}
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-purple-50/60 border border-purple-100 rounded-2xl inline-block shadow-inner">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR Code para ${title}`}
              className="w-56 h-56 mx-auto rounded-xl shadow-sm bg-white p-2"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-purple-400">
              Gerando QR Code...
            </div>
          )}
        </div>

        <p className="text-[11px] text-purple-900/80 mb-5 leading-relaxed bg-purple-50 p-2.5 rounded-xl border border-purple-100 font-medium">
          💡 <strong>Dica para Feirantes:</strong> Mostre na tela do celular ou imprima para colocar na sua barraca na Feira de Peruíbe!
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-900 font-bold text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-700" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Imagem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
