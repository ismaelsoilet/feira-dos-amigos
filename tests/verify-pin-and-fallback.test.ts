import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  getAdById,
  verifyAdPin,
} from '@/lib/storage';
import { POST as verifyPinRoute } from '@/app/api/ads/[id]/verify-pin/route';
import { NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

describe('Resilient Ad Recovery & PIN Verification Gate', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('verifies PIN correctly and returns ad data', async () => {
    const ad = await saveAd({
      title: 'Mesa de Madeira Maciça',
      description: 'Mesa artesanal em perfeito estado.',
      price: 400,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Centro',
      sellerName: 'Marcos',
      whatsapp: '13997771234',
      photos: ['/logo.jpg'],
      pin: 'MESA99',
    });

    // Wrong PIN
    const wrongCheck = await verifyAdPin(ad.id, 'WRONG1');
    expect(wrongCheck.valid).toBe(false);
    expect(wrongCheck.error).toContain('PIN incorreto');

    // Case-insensitive correct PIN
    const correctCheck = await verifyAdPin(ad.id, 'mesa99');
    expect(correctCheck.valid).toBe(true);
    expect(correctCheck.ad).toBeDefined();
    expect(correctCheck.ad?.title).toBe('Mesa de Madeira Maciça');
  });

  it('handles POST /api/ads/[id]/verify-pin endpoint accurately', async () => {
    const ad = await saveAd({
      title: 'Guitarra Tagima',
      description: 'Guitarra revisada com cordas novas.',
      price: 800,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Stella Maris',
      sellerName: 'Felipe',
      whatsapp: '13998889999',
      photos: ['/logo.jpg'],
      pin: 'TAG789',
    });

    // Invalid PIN via route
    const badReq = new NextRequest(`http://localhost/api/ads/${ad.id}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin: '000000' }),
    });
    const badRes = await verifyPinRoute(badReq, { params: Promise.resolve({ id: ad.id }) });
    expect(badRes.status).toBe(401);

    // Valid PIN via route
    const goodReq = new NextRequest(`http://localhost/api/ads/${ad.id}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin: 'tag789' }),
    });
    const goodRes = await verifyPinRoute(goodReq, { params: Promise.resolve({ id: ad.id }) });
    expect(goodRes.status).toBe(200);
    const data = await goodRes.json();
    expect(data.success).toBe(true);
    expect(data.ad.title).toBe('Guitarra Tagima');
    expect(data.ad.pinHash).toBeUndefined(); // Safe ad does not leak pinHash
  });

  it('recovers ad from catalog-index.json even if individual ad file was wiped (Zero-404)', async () => {
    const ad = await saveAd({
      title: 'Prancha de Surf Al Merrick',
      description: 'Prancha em excelente estado no Guaraú.',
      price: 900,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Guaraú',
      sellerName: 'Bia Surf',
      whatsapp: '13997778888',
      photos: ['/logo.jpg'],
      pin: 'SURF01',
    });

    // Simulate individual local file loss
    const localAdFile = path.resolve(process.cwd(), 'data', 'local-ads', `${ad.id}.json`);
    if (fs.existsSync(localAdFile)) {
      fs.unlinkSync(localAdFile);
    }

    // getAdById should not return null! It must recover from catalog index
    const recovered = await getAdById(ad.id);
    expect(recovered).not.toBeNull();
    expect(recovered?.id).toBe(ad.id);
    expect(recovered?.title).toBe('Prancha de Surf Al Merrick');
    expect(recovered?.bairro).toBe('Guaraú');
  });
});
