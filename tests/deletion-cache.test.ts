import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  getAds,
  getAdById,
} from '@/lib/storage';
import { DELETE as deleteManageRoute } from '@/app/api/ads/[id]/manage/route';
import { GET as getAdsRoute } from '@/app/api/ads/route';
import { NextRequest } from 'next/server';

describe('Kairos: Instant Ad Deletion & Cache-Free Verification', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('immediately removes the ad from catalog and getAds without requiring cache clearing or reload', async () => {
    const ad1 = await saveAd({
      title: 'Item para Exclusao Instantanea',
      description: 'Deve sumir de imediato ao ser deletado.',
      price: 150,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Centro',
      sellerName: 'Vendedor Teste',
      whatsapp: '13997000000',
      photos: [],
      pin: 'DEL123',
    });

    const ad2 = await saveAd({
      title: 'Item que deve permanecer',
      description: 'Anuncio que fica ativo.',
      price: 200,
      priceType: 'fixed',
      category: 'eletronicos',
      bairro: 'Guaraú',
      sellerName: 'Outro Vendedor',
      whatsapp: '13997111111',
      photos: [],
      pin: 'STAY99',
    });

    // Verify both are present initially
    let currentAds = await getAds();
    expect(currentAds.map(a => a.id)).toContain(ad1.id);
    expect(currentAds.map(a => a.id)).toContain(ad2.id);

    // Call DELETE API route
    const deleteReq = new NextRequest(`http://localhost/api/ads/${ad1.id}/manage`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'DEL123' }),
    });

    const deleteRes = await deleteManageRoute(deleteReq, {
      params: Promise.resolve({ id: ad1.id }),
    });

    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // Verify ad1 is GONE from disk/catalog
    const fetchedAd1 = await getAdById(ad1.id);
    expect(fetchedAd1).toBeNull();

    // Verify getAds() no longer returns ad1
    currentAds = await getAds();
    expect(currentAds.map(a => a.id)).not.toContain(ad1.id);
    expect(currentAds.map(a => a.id)).toContain(ad2.id);
  });

  it('GET /api/ads returns strict no-cache headers to prevent browser/CDN stale responses', async () => {
    const getReq = new Request('http://localhost/api/ads?includeSold=true');
    const response = await getAdsRoute(getReq);

    expect(response.status).toBe(200);
    const cacheControl = response.headers.get('cache-control') || '';
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('no-cache');
  });
});
