import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  purgeExpiredAds,
  getCommunityStats,
  getAdById,
  updateAdStatus,
} from '@/lib/storage';
import { GET as getStatsRoute } from '@/app/api/stats/route';

describe('Auto-Purge & Community Stats (TDD Red-Green-Refactor)', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('purges expired ads and updates their status to expired', async () => {
    // 1. Create active ad
    const activeAd = await saveAd({
      title: 'Bicicleta Caloi Aro 29',
      description: 'Em ótimo estado de conservação.',
      price: 650,
      priceType: 'fixed',
      category: 'veiculos',
      bairro: 'Centro',
      sellerName: 'Carlos',
      whatsapp: '13999991111',
      photos: [],
      pin: '1234',
      durationDays: 30,
    });

    // 2. Create expired ad (set expiration in the past)
    const expiredAd = await saveAd({
      title: 'Mesa de Madeira Rústica',
      description: 'Mesa com 4 cadeiras.',
      price: 200,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Stella Maris',
      sellerName: 'Ana',
      whatsapp: '13999992222',
      photos: [],
      pin: '5678',
      durationDays: -5, // already expired 5 days ago
    });

    // Run purge
    const result = await purgeExpiredAds();
    expect(result.purgedCount).toBe(1);

    // Verify status
    const checkedExpired = await getAdById(expiredAd.id);
    expect(checkedExpired?.status).toBe('expired');

    const checkedActive = await getAdById(activeAd.id);
    expect(checkedActive?.status).toBe('active');
  });

  it('aggregates community statistics correctly', async () => {
    // Ad 1: active in Centro
    await saveAd({
      title: 'Celular Xiaomi Note 10',
      description: 'Na caixa com nota.',
      price: 700,
      priceType: 'fixed',
      category: 'eletronicos',
      bairro: 'Centro',
      sellerName: 'Marcos',
      whatsapp: '13999993333',
      photos: [],
      pin: '1111',
      durationDays: 30,
    });

    // Ad 2: sold in Guaraú
    const ad2 = await saveAd({
      title: 'Prancha de Surf 6.2',
      description: 'Prancha de surf.',
      price: 350,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Guaraú',
      sellerName: 'Pedro',
      whatsapp: '13999994444',
      photos: [],
      pin: '2222',
      durationDays: 30,
    });
    await updateAdStatus(ad2.id, '2222', 'sold');

    // Ad 3: expired in Centro
    await saveAd({
      title: 'Geladeira Antiga',
      description: 'Funcionando.',
      price: 150,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Centro',
      sellerName: 'Lúcia',
      whatsapp: '13999995555',
      photos: [],
      pin: '3333',
      durationDays: -2,
    });
    await purgeExpiredAds();

    const stats = await getCommunityStats();
    expect(stats.totalActive).toBe(1);
    expect(stats.totalSold).toBe(1);
    expect(stats.totalExpired).toBe(1);
    expect(stats.bairrosCount).toBe(1); // active bairros
  });

  it('serves GET /api/stats endpoint with proper JSON headers and shape', async () => {
    await saveAd({
      title: 'Bolo Caseiro de Cenoura',
      description: 'Delicioso e quentinho.',
      price: 25,
      priceType: 'fixed',
      category: 'feira_alimentos',
      bairro: 'Caraguava',
      sellerName: 'Dona Neide',
      whatsapp: '13999996666',
      photos: [],
      pin: '9999',
      durationDays: 15,
    });

    const res = await getStatsRoute();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
    expect(data.stats.totalActive).toBeGreaterThanOrEqual(1);
    expect(typeof data.stats.bairrosCount).toBe('number');
  });
});
