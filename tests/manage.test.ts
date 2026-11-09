import { describe, it, expect, beforeEach } from 'vitest';
import { saveAd, updateAdStatus, getAdById, clearLocalStorageForTesting } from '../src/lib/storage';

describe('Task 7: Ad Management & Status Toggling', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('should toggle status to sold and back to active with valid PIN', async () => {
    const ad = await saveAd({
      title: 'Ventilador Mondial 40cm',
      description: 'Super potente, ideal para o verão de Peruíbe.',
      price: 90,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Centro',
      sellerName: 'Rita',
      whatsapp: '13991234567',
      photos: [],
      pin: '5566',
    });

    expect(ad.status).toBe('active');

    // 1. Mark as sold
    const soldRes = await updateAdStatus(ad.id, '5566', 'sold');
    expect(soldRes.success).toBe(true);

    const afterSold = await getAdById(ad.id);
    expect(afterSold?.status).toBe('sold');

    // 2. Reactivate
    const reactivateRes = await updateAdStatus(ad.id, '5566', 'active');
    expect(reactivateRes.success).toBe(true);

    const afterReactivate = await getAdById(ad.id);
    expect(afterReactivate?.status).toBe('active');
  });
});
