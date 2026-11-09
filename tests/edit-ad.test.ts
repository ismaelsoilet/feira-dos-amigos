import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAd,
  clearLocalStorageForTesting,
  updateAd,
  getAdById,
  getAds,
} from '@/lib/storage';
import { PUT as putManageRoute } from '@/app/api/ads/[id]/manage/route';
import { NextRequest } from 'next/server';

describe('Edit Ad with PIN (TDD Red-Green-Refactor)', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
  });

  it('rejects editing an ad when the PIN is incorrect', async () => {
    const ad = await saveAd({
      title: 'Ventilador Mondial 40cm',
      description: 'Ventilador potente e silencioso.',
      price: 120,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Centro',
      sellerName: 'Roberto',
      whatsapp: '13998881111',
      photos: [],
      pin: 'EDT432',
    });

    const result = await updateAd(ad.id, {
      pin: 'WRONG9',
      title: 'Tentativa de Hack',
      price: 10,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('PIN de segurança incorreto.');

    // Ensure ad was not altered
    const unchanged = await getAdById(ad.id);
    expect(unchanged?.title).toBe('Ventilador Mondial 40cm');
    expect(unchanged?.price).toBe(120);
  });

  it('updates ad fields successfully when correct 6-character alphanumeric PIN is provided and syncs catalog index', async () => {
    const ad = await saveAd({
      title: 'Prancha de Bodyboard',
      description: 'Ótima para pegar onda no Guaraú.',
      price: 150,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Guaraú',
      sellerName: 'Lucas',
      whatsapp: '13998882222',
      photos: ['/logo.jpg'],
      pin: 'XYZ777',
    });

    const result = await updateAd(ad.id, {
      pin: 'XYZ777',
      title: 'Prancha de Bodyboard Genesis Profissional',
      price: 130,
      priceType: 'negotiable',
      bairro: 'Stella Maris',
      description: 'Prancha com leash novo incluído!',
      whatsapp: '13998883333',
    });

    expect(result.success).toBe(true);
    expect(result.ad?.title).toBe('Prancha de Bodyboard Genesis Profissional');
    expect(result.ad?.price).toBe(130);
    expect(result.ad?.priceType).toBe('negotiable');
    expect(result.ad?.bairro).toBe('Stella Maris');
    expect(result.ad?.description).toBe('Prancha com leash novo incluído!');
    expect(result.ad?.whatsapp).toBe('13998883333');

    // Verify disk / local persistence
    const fetched = await getAdById(ad.id);
    expect(fetched?.title).toBe('Prancha de Bodyboard Genesis Profissional');
    expect(fetched?.price).toBe(130);
    expect(fetched?.bairro).toBe('Stella Maris');

    // Verify catalog summary index
    const summaries = await getAds();
    const sum = summaries.find(s => s.id === ad.id);
    expect(sum?.title).toBe('Prancha de Bodyboard Genesis Profissional');
    expect(sum?.price).toBe(130);
    expect(sum?.bairro).toBe('Stella Maris');
  });

  it('handles PUT /api/ads/[id]/manage route with valid 6-char alphanumeric PIN (case-insensitive)', async () => {
    const ad = await saveAd({
      title: 'Violão Di Giorgio Clássico',
      description: 'Com capa acolchoada.',
      price: 500,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Centro',
      sellerName: 'Júlia',
      whatsapp: '13998884444',
      photos: [],
      pin: 'VIO555',
    });

    // Provide lowercase 'vio555' to test case-insensitivity
    const req = new NextRequest(`http://localhost:3000/api/ads/${ad.id}/manage`, {
      method: 'PUT',
      body: JSON.stringify({
        pin: 'vio555',
        title: 'Violão Di Giorgio Clássico (Impecável)',
        price: 450,
      }),
    });

    const res = await putManageRoute(req, { params: Promise.resolve({ id: ad.id }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.ad.title).toBe('Violão Di Giorgio Clássico (Impecável)');
    expect(json.ad.price).toBe(450);
  });

  it('returns 400 on PUT /api/ads/[id]/manage with invalid PIN format (<6 characters)', async () => {
    const ad = await saveAd({
      title: 'Mesa Dobrável',
      description: 'Mesa de praia.',
      price: 50,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Centro',
      sellerName: 'Ana',
      whatsapp: '13998885555',
      photos: [],
      pin: 'TAB111',
    });

    const req = new NextRequest(`http://localhost:3000/api/ads/${ad.id}/manage`, {
      method: 'PUT',
      body: JSON.stringify({
        pin: '1234', // Only 4 digits
        title: 'Tentativa Invalida',
      }),
    });

    const res = await putManageRoute(req, { params: Promise.resolve({ id: ad.id }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('6 caracteres');
  });

  it('returns 401 on PUT /api/ads/[id]/manage with wrong 6-character PIN', async () => {
    const ad = await saveAd({
      title: 'Mesa Dobrável',
      description: 'Mesa de praia.',
      price: 50,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Centro',
      sellerName: 'Ana',
      whatsapp: '13998885555',
      photos: [],
      pin: 'TAB111',
    });

    const req = new NextRequest(`http://localhost:3000/api/ads/${ad.id}/manage`, {
      method: 'PUT',
      body: JSON.stringify({
        pin: 'ERR999',
        title: 'Tentativa Invalida',
      }),
    });

    const res = await putManageRoute(req, { params: Promise.resolve({ id: ad.id }) });
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe('PIN de segurança incorreto.');
  });
});
