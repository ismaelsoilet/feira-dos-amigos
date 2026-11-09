import { describe, it, expect } from 'vitest';
import { formatPrice, buildWhatsAppLink } from '../src/components/AdCard';
import { AdSummary } from '../src/types/ad';

describe('Task 5: UI Components & Formatters', () => {
  it('should format price correctly based on priceType', () => {
    expect(formatPrice(150, 'fixed')).toBe('R$ 150,00');
    expect(formatPrice(0, 'free')).toBe('Doação / Grátis');
    expect(formatPrice(0, 'trade')).toBe('Troca');
    expect(formatPrice(0, 'negotiable')).toBe('A combinar');
  });

  it('should build direct WhatsApp URL with pre-filled message mentioning Peruíbe and Ad Title', () => {
    const ad: AdSummary = {
      id: 'ad_123',
      title: 'Bicicleta Caloi 29',
      description: 'Ótimo estado',
      price: 500,
      priceType: 'fixed',
      category: 'veiculos',
      bairro: 'Centro',
      sellerName: 'Ismael',
      whatsapp: '13997123456',
      thumbnail: '/logo.jpg',
      photosCount: 1,
      status: 'active',
      expiresAt: '2026-12-31T23:59:59.000Z',
      createdAt: '2026-11-08T10:00:00.000Z',
    };

    const link = buildWhatsAppLink(ad);
    expect(link).toContain('https://wa.me/5513997123456');
    expect(link).toContain(encodeURIComponent('Bicicleta Caloi 29'));
    expect(link).toContain('Feira%20dos%20Amigos');
  });

  it('should generate valid QR code data URLs for stand sharing', async () => {
    const QRCode = (await import('qrcode')).default;
    const uri = await QRCode.toDataURL('https://feiradosamigos.vercel.app/anuncio/ad_test_qr', {
      width: 200,
    });
    expect(uri.startsWith('data:image/png;base64,')).toBe(true);
  });
});
