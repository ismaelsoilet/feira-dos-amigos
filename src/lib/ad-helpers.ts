import { AdPriceType, AdSummary, Ad } from '@/types/ad';

export function formatPrice(price: number, type: AdPriceType): string {
  if (type === 'free') return 'Doação / Grátis';
  if (type === 'trade') return 'Troca';
  if (type === 'negotiable') return 'A combinar';
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
  return formatted.replace(/\u00a0/g, ' ');
}

export function getAdShareUrl(id: string): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/anuncio/${id}`;
  }
  return `https://feiradosamigos.vercel.app/anuncio/${id}`;
}

export function buildWhatsAppLink(
  ad: AdSummary | Ad | { id: string; title: string; sellerName: string; whatsapp: string; price: number; priceType: AdPriceType }
): string {
  const cleanPhone = ad.whatsapp.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const shareUrl = getAdShareUrl(ad.id);
  const priceDisplay = formatPrice(ad.price, ad.priceType);
  const text = `Olá, ${ad.sellerName}! Vi seu anúncio "${ad.title}" (${priceDisplay}) na Feira dos Amigos Peruíbe.\n\nLink do anúncio: ${shareUrl}\n\nAinda está disponível?`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}
