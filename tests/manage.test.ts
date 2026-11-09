import { describe, it, expect, beforeEach } from 'vitest';
import { saveAd, updateAdStatus, deleteAd, getAdById, clearLocalStorageForTesting } from '../src/lib/storage';

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

  it('should reject status update if wrong PIN is provided', async () => {
    const ad = await saveAd({
      title: 'Geladeira Usada Frost Free',
      description: 'Em funcionamento normal no Guaraú.',
      price: 600,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Guaraú',
      sellerName: 'Marcos',
      whatsapp: '13997778899',
      photos: [],
      pin: '1234',
    });

    const res = await updateAdStatus(ad.id, '0000', 'sold');
    expect(res.success).toBe(false);
    expect(res.error).toContain('PIN');
  });

  it('should delete ad permanently when correct PIN is provided', async () => {
    const ad = await saveAd({
      title: 'Armário de Cozinha 3 Portas',
      description: 'Branco em bom estado no Stella Maris.',
      price: 180,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Stella Maris',
      sellerName: 'Helena',
      whatsapp: '13998889900',
      photos: [],
      pin: '7788',
    });

    const delRes = await deleteAd(ad.id, '7788');
    expect(delRes.success).toBe(true);

    const check = await getAdById(ad.id);
    expect(check).toBeNull();
  });
});
