import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  updateAd,
  getAdById,
} from '@/lib/storage';
import { GET as getAdByIdRoute } from '@/app/api/ads/[id]/route';

describe('Kairos: Multi-container consistency & Image Cache Prevention', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('GET /api/ads/[id] returns strict no-store headers to prevent browser caching old ad photos', async () => {
    const ad = await saveAd({
      title: 'Produto Teste Cache Individual',
      description: 'Descricao de teste.',
      price: 100,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Centro',
      sellerName: 'Vendedor',
      whatsapp: '13997000000',
      photos: ['data:image/webp;base64,FOTO_1'],
      pin: 'TST111',
    });

    const req = new Request(`http://localhost/api/ads/${ad.id}`);
    const res = await getAdByIdRoute(req, { params: Promise.resolve({ id: ad.id }) });

    expect(res.status).toBe(200);
    const cacheControl = res.headers.get('cache-control') || '';
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('no-cache');
  });

  it('reflects updated photos immediately on subsequent getAdById calls', async () => {
    const ad = await saveAd({
      title: 'Guitarra com Fotos Antigas',
      description: 'Fotos originais do anúncio.',
      price: 3000,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Centro',
      sellerName: 'Músico',
      whatsapp: '13997223344',
      photos: ['data:image/webp;base64,FOTO_VELHA_1', 'data:image/webp;base64,FOTO_VELHA_2'],
      pin: 'GTR123',
    });

    // Verify initial photos
    const initial = await getAdById(ad.id);
    expect(initial?.photos).toEqual(['data:image/webp;base64,FOTO_VELHA_1', 'data:image/webp;base64,FOTO_VELHA_2']);

    // Remove photo 1, add photo 3
    const updateResult = await updateAd(ad.id, {
      pin: 'GTR123',
      photos: ['data:image/webp;base64,FOTO_VELHA_2', 'data:image/webp;base64,FOTO_NOVA_3'],
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.ad?.photos).toEqual(['data:image/webp;base64,FOTO_VELHA_2', 'data:image/webp;base64,FOTO_NOVA_3']);

    // Check that immediate getAdById reflects the new photos
    const refetched = await getAdById(ad.id);
    expect(refetched?.photos).not.toContain('data:image/webp;base64,FOTO_VELHA_1');
    expect(refetched?.photos).toEqual(['data:image/webp;base64,FOTO_VELHA_2', 'data:image/webp;base64,FOTO_NOVA_3']);
  });
});
