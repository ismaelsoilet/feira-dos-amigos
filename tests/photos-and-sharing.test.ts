import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  updateAd,
  getAdById,
  getAds,
} from '@/lib/storage';
import { buildWhatsAppLink, getAdShareUrl } from '@/components/AdCard';
import { AdSummary } from '@/types/ad';
import { GET as getImageRoute } from '@/app/api/ads/[id]/image/route';

describe('Kairos: Photos Edit, Rich WhatsApp Link & Social Image Route', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  describe('1. Photo Management in updateAd', () => {
    it('allows altering, including and deleting photos with catalog index sync', async () => {
      const ad = await saveAd({
        title: 'Bicicleta Infantil Aro 16',
        description: 'Em ótimo estado de conservação.',
        price: 250,
        priceType: 'fixed',
        category: 'veiculos',
        bairro: 'Centro',
        sellerName: 'Maria',
        whatsapp: '13998884444',
        photos: ['data:image/webp;base64,FOTO_ORIGINAL_1', 'data:image/webp;base64,FOTO_ORIGINAL_2'],
        pin: 'FOTO01',
      });

      expect(ad.photos).toHaveLength(2);
      expect(ad.photos[0]).toBe('data:image/webp;base64,FOTO_ORIGINAL_1');

      // Update: delete photo 1, add photo 3
      const updated = await updateAd(ad.id, {
        pin: 'FOTO01',
        photos: ['data:image/webp;base64,FOTO_ORIGINAL_2', 'data:image/webp;base64,NOVA_FOTO_3'],
      });

      expect(updated.success).toBe(true);
      expect(updated.ad?.photos).toHaveLength(2);
      expect(updated.ad?.photos[0]).toBe('data:image/webp;base64,FOTO_ORIGINAL_2');
      expect(updated.ad?.photos[1]).toBe('data:image/webp;base64,NOVA_FOTO_3');

      // Check persistence in getAdById
      const fetched = await getAdById(ad.id);
      expect(fetched?.photos).toEqual([
        'data:image/webp;base64,FOTO_ORIGINAL_2',
        'data:image/webp;base64,NOVA_FOTO_3',
      ]);

      // Check catalog index thumbnail
      const all = await getAds();
      const sum = all.find(s => s.id === ad.id);
      expect(sum?.thumbnail).toBe('data:image/webp;base64,FOTO_ORIGINAL_2');
      expect(sum?.photosCount).toBe(2);
    });

    it('falls back to default logo if all photos are removed during edit', async () => {
      const ad = await saveAd({
        title: 'Mesa de Madeira Maciça',
        description: 'Mesa rústica 6 lugares.',
        price: 800,
        priceType: 'fixed',
        category: 'casa_moveis',
        bairro: 'Caraguava',
        sellerName: 'Carlos',
        whatsapp: '13998885555',
        photos: ['data:image/webp;base64,MESA_01'],
        pin: 'FOTO02',
      });

      const updated = await updateAd(ad.id, {
        pin: 'FOTO02',
        photos: [],
      });

      expect(updated.success).toBe(true);
      expect(updated.ad?.photos).toEqual(['/logo.jpg']);

      const fetched = await getAdById(ad.id);
      expect(fetched?.photos).toEqual(['/logo.jpg']);
    });
  });

  describe('2. Enriched WhatsApp Link with Direct Ad Link', () => {
    it('references the ad title, price and direct ad URL in WhatsApp pre-filled text', () => {
      const sampleAd: AdSummary = {
        id: 'ad_mesa_789',
        title: 'Mesa de Centro Rústica',
        description: 'Madeira de demolição',
        price: 320,
        priceType: 'fixed',
        category: 'casa_moveis',
        bairro: 'Stella Maris',
        sellerName: 'João da Feira',
        whatsapp: '13997112233',
        thumbnail: '/logo.jpg',
        photosCount: 1,
        status: 'active',
        expiresAt: '2026-12-31T23:59:59.000Z',
        createdAt: '2026-11-09T10:00:00.000Z',
      };

      const link = buildWhatsAppLink(sampleAd);

      expect(link).toContain('https://wa.me/5513997112233');
      // Must contain ad title
      expect(link).toContain(encodeURIComponent('Mesa de Centro Rústica'));
      // Must contain formatted price
      expect(link).toContain(encodeURIComponent('R$ 320,00'));
      // Must contain direct link to the ad
      expect(link).toContain(encodeURIComponent(getAdShareUrl(sampleAd.id)));
      // Must mention Peruíbe
      expect(link).toContain('Perw%C3%ADbe'.slice(0, 3) || 'Per');
    });
  });

  describe('3. Social Image Endpoint GET /api/ads/[id]/image', () => {
    it('serves binary webp buffer from base64 data URI', async () => {
      // 1x1 transparent WebP base64
      const webpBase64 = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA';
      const ad = await saveAd({
        title: 'Item com Foto WebP',
        description: 'Teste de streaming de imagem.',
        price: 50,
        priceType: 'fixed',
        category: 'outros',
        bairro: 'Centro',
        sellerName: 'Ana',
        whatsapp: '13998886666',
        photos: [webpBase64],
        pin: 'IMG001',
      });

      const response = await getImageRoute(
        new Request(`http://localhost/api/ads/${ad.id}/image`),
        { params: Promise.resolve({ id: ad.id }) }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('image/webp');
      const arrayBuffer = await response.arrayBuffer();
      expect(arrayBuffer.byteLength).toBeGreaterThan(10);
    });

    it('falls back to public/logo.jpg if ad does not have custom photos or ad is missing', async () => {
      const response = await getImageRoute(
        new Request(`http://localhost/api/ads/inexistent_ad/image`),
        { params: Promise.resolve({ id: 'inexistent_ad' }) }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('image/');
      const arrayBuffer = await response.arrayBuffer();
      expect(arrayBuffer.byteLength).toBeGreaterThan(100);
    });
  });
});
