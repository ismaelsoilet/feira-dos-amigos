import { describe, it, expect, beforeEach } from 'vitest';
import { saveAd, getAds, getAdById, updateAdStatus, deleteAd, clearLocalStorageForTesting } from '../src/lib/storage';
import { CreateAdInput } from '../src/types/ad';

describe('Task 2: Storage Adapter (Zero-DB)', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  const sampleAd: CreateAdInput = {
    title: 'Bicicleta Caloi Aro 29 em Peruíbe',
    description: 'Bicicleta em perfeito estado, pouco usada na praia.',
    price: 650,
    priceType: 'fixed',
    category: 'veiculos',
    bairro: 'Centro',
    sellerName: 'Carlos Silva',
    whatsapp: '13997123456',
    photos: ['data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA'],
    pin: '1234',
    durationDays: 30,
  };

  it('should save an ad and compute SHA-256 pinHash (never store raw PIN)', async () => {
    const ad = await saveAd(sampleAd);
    expect(ad.id).toBeDefined();
    expect(ad.title).toBe(sampleAd.title);
    expect(ad.pinHash).toBeDefined();
    expect(ad.pinHash).not.toBe('1234');
    expect(ad.status).toBe('active');
    expect(ad.expiresAt).toBeDefined();
  });

  it('should retrieve list of ads excluding sold ones by default', async () => {
    const ad1 = await saveAd(sampleAd);
    const ad2 = await saveAd({
      ...sampleAd,
      title: 'Prancha de Surf Funboard',
      category: 'outros',
      bairro: 'Guaraú',
    });

    // Mark ad1 as sold
    const updated = await updateAdStatus(ad1.id, '1234', 'sold');
    expect(updated.success).toBe(true);

    // Default search: exclude sold
    const activeAds = await getAds({ includeSold: false });
    expect(activeAds.some(a => a.id === ad1.id)).toBe(false);
    expect(activeAds.some(a => a.id === ad2.id)).toBe(true);

    // Filter with includeSold: true
    const allAds = await getAds({ includeSold: true });
    expect(allAds.some(a => a.id === ad1.id)).toBe(true);
    expect(allAds.find(a => a.id === ad1.id)?.status).toBe('sold');
  });

  it('should reject status update or delete when PIN is incorrect', async () => {
    const ad = await saveAd(sampleAd);
    const result = await updateAdStatus(ad.id, '9999', 'sold');
    expect(result.success).toBe(false);
    expect(result.error).toContain('PIN');

    const delResult = await deleteAd(ad.id, '0000');
    expect(delResult.success).toBe(false);
  });
});
