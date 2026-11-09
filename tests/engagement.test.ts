import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  incrementAdMetric,
  getAdById,
  getAds,
} from '@/lib/storage';
import { POST as postViewRoute } from '@/app/api/ads/[id]/view/route';
import { POST as postWhatsappClickRoute } from '@/app/api/ads/[id]/whatsapp-click/route';
import { NextRequest } from 'next/server';

describe('Engagement Metrics (Views & WhatsApp Clicks) TDD', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('increments views and whatsapp clicks in storage and updates index', async () => {
    const ad = await saveAd({
      title: 'Violão Takamine Elétrico',
      description: 'Cordas de aço, afinador embutido.',
      price: 1800,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Centro',
      sellerName: 'Felipe',
      whatsapp: '13999997777',
      photos: [],
      pin: '4321',
    });

    expect(ad.views).toBe(0);
    expect(ad.whatsappClicks).toBe(0);

    // Increment views twice
    const v1 = await incrementAdMetric(ad.id, 'views');
    expect(v1.views).toBe(1);
    const v2 = await incrementAdMetric(ad.id, 'views');
    expect(v2.views).toBe(2);

    // Increment whatsappClicks
    const w1 = await incrementAdMetric(ad.id, 'whatsappClicks');
    expect(w1.whatsappClicks).toBe(1);

    // Verify ad file
    const fetched = await getAdById(ad.id);
    expect(fetched?.views).toBe(2);
    expect(fetched?.whatsappClicks).toBe(1);

    // Verify catalog summary
    const summaries = await getAds();
    const sum = summaries.find(s => s.id === ad.id);
    expect(sum?.views).toBe(2);
    expect(sum?.whatsappClicks).toBe(1);
  });

  it('serves POST /api/ads/[id]/view route handler', async () => {
    const ad = await saveAd({
      title: 'Smart TV 50 Polegadas 4K',
      description: 'Como nova.',
      price: 1400,
      priceType: 'fixed',
      category: 'eletronicos',
      bairro: 'Stella Maris',
      sellerName: 'Bruna',
      whatsapp: '13999998888',
      photos: [],
      pin: '9876',
    });

    const req = new NextRequest(`http://localhost:3000/api/ads/${ad.id}/view`, {
      method: 'POST',
    });
    const res = await postViewRoute(req, { params: Promise.resolve({ id: ad.id }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.views).toBe(1);
  });

  it('serves POST /api/ads/[id]/whatsapp-click route handler', async () => {
    const ad = await saveAd({
      title: 'Bolo de Chocolate Vulcão',
      description: 'Sob encomenda.',
      price: 45,
      priceType: 'fixed',
      category: 'feira_alimentos',
      bairro: 'Centro',
      sellerName: 'Clara',
      whatsapp: '13999990000',
      photos: [],
      pin: '5432',
    });

    const req = new NextRequest(`http://localhost:3000/api/ads/${ad.id}/whatsapp-click`, {
      method: 'POST',
    });
    const res = await postWhatsappClickRoute(req, { params: Promise.resolve({ id: ad.id }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.whatsappClicks).toBe(1);
  });

  it('returns 404 for non-existent ad metrics', async () => {
    const req = new NextRequest('http://localhost:3000/api/ads/ad_fake_999/view', {
      method: 'POST',
    });
    const res = await postViewRoute(req, { params: Promise.resolve({ id: 'ad_fake_999' }) });
    expect(res.status).toBe(404);
  });
});
