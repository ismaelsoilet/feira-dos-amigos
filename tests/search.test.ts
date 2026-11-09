import { describe, it, expect } from 'vitest';
import { normalizeText, filterAndSearchAds, getHighlightParts } from '../src/lib/search';
import { AdSummary } from '../src/types/ad';

describe('Task 4: Smart Search & Term Highlighter', () => {
  const adsSample: AdSummary[] = [
    {
      id: '1',
      title: 'Bicicleta Aro 29 em Peruíbe',
      description: 'Ótima bicicleta semi nova no Centro de Peruíbe.',
      price: 600,
      priceType: 'fixed',
      category: 'veiculos',
      bairro: 'Centro',
      sellerName: 'Marcos',
      whatsapp: '13999991111',
      thumbnail: '/logo.jpg',
      photosCount: 1,
      status: 'active',
      expiresAt: '2026-12-31T23:59:59.000Z',
      createdAt: '2026-11-08T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'Prancha de Surf no Guaraú',
      description: 'Prancha para pegar altas ondas na praia do Guaraú.',
      price: 350,
      priceType: 'fixed',
      category: 'outros',
      bairro: 'Guaraú',
      sellerName: 'Bia',
      whatsapp: '13999992222',
      thumbnail: '/logo.jpg',
      photosCount: 2,
      status: 'active',
      expiresAt: '2026-12-31T23:59:59.000Z',
      createdAt: '2026-11-08T11:00:00.000Z',
    },
    {
      id: '3',
      title: 'Fogão 4 bocas Dako',
      description: 'Fogão em ótimo estado no Stella Maris.',
      price: 200,
      priceType: 'fixed',
      category: 'casa_moveis',
      bairro: 'Stella Maris',
      sellerName: 'Dona Neide',
      whatsapp: '13999993333',
      thumbnail: '/logo.jpg',
      photosCount: 1,
      status: 'sold',
      expiresAt: '2026-12-31T23:59:59.000Z',
      createdAt: '2026-11-08T09:00:00.000Z',
    },
  ];

  it('should normalize text removing accents and converting to lowercase', () => {
    expect(normalizeText('Peruíbe')).toBe('peruibe');
    expect(normalizeText('Fogão')).toBe('fogao');
    expect(normalizeText('AÇÃO & Troca!')).toBe('acao & troca!');
  });

  it('should search across title, description, and bairro with accent insensitivity', () => {
    // "peruibe" matches "Peruíbe"
    const res1 = filterAndSearchAds(adsSample, 'peruibe');
    expect(res1.length).toBe(1);
    expect(res1[0].id).toBe('1');

    // "guarau" matches "Guaraú"
    const res2 = filterAndSearchAds(adsSample, 'guarau');
    expect(res2.length).toBe(1);
    expect(res2[0].id).toBe('2');

    // "fogao" matches "Fogão" but only if includeSold is true
    const res3 = filterAndSearchAds(adsSample, 'fogao', { includeSold: false });
    expect(res3.length).toBe(0); // Sold by default excluded

    const res4 = filterAndSearchAds(adsSample, 'fogao', { includeSold: true });
    expect(res4.length).toBe(1);
    expect(res4[0].id).toBe('3');
  });

  it('should split text into highlighted parts accurately', () => {
    const text = 'Bicicleta Aro 29 em Peruíbe';
    const parts = getHighlightParts(text, 'aro peruibe');
    // Expect parts matching "Aro" and "Peruíbe" to have isMatch=true
    const matchedTexts = parts.filter(p => p.isMatch).map(p => p.text.toLowerCase());
    expect(matchedTexts).toContain('aro');
    expect(matchedTexts).toContain('peruíbe');
  });
});
