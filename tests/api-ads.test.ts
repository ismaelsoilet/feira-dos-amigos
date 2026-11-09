import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getAdsRoute, POST as postAdsRoute } from '../src/app/api/ads/route';
import { GET as getAdByIdRoute } from '../src/app/api/ads/[id]/route';
import { PATCH as patchManageRoute, DELETE as deleteManageRoute } from '../src/app/api/ads/[id]/manage/route';
import { clearLocalStorageForTesting } from '../src/lib/storage';
import { resetRateLimits } from '../src/lib/rate-limit';

describe('Task 3: Serverless API Routes', () => {
  beforeEach(async () => {
    await clearLocalStorageForTesting();
    resetRateLimits();
  });

  it('should reject creation if honeypot is filled by bot', async () => {
    const fakeRequest = new Request('http://localhost:3000/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        title: 'Spam Bot Ad',
        description: 'spam',
        price: 10,
        priceType: 'fixed',
        category: 'outros',
        bairro: 'Centro',
        sellerName: 'Bot',
        whatsapp: '13999999999',
        pin: '1234',
        website_hp: 'http://spam-link.com', // Honeypot filled!
      }),
    });

    const response = await postAdsRoute(fakeRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should create an ad via POST /api/ads and return 201 with management info', async () => {
    const req = new Request('http://localhost:3000/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        title: 'Prancha de Bodyboard',
        description: 'Ótima para as ondas do Guaraú.',
        price: 120,
        priceType: 'fixed',
        category: 'outros',
        bairro: 'Guaraú',
        sellerName: 'Mariana',
        whatsapp: '13998887766',
        photos: [],
        pin: '4321',
      }),
    });

    const response = await postAdsRoute(req);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.ad).toBeDefined();
    expect(data.ad.id).toBeDefined();
    expect(data.ad.pinHash).toBeUndefined(); // Don't expose hash in response
  });

  it('should list ads via GET /api/ads with filtering', async () => {
    // Create one active ad
    const postReq = new Request('http://localhost:3000/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        title: 'Bicicleta Barra Forte',
        description: 'Perfeita para andar no centro.',
        price: 250,
        priceType: 'fixed',
        category: 'veiculos',
        bairro: 'Centro',
        sellerName: 'José',
        whatsapp: '13991112233',
        pin: '1111',
      }),
    });
    await postAdsRoute(postReq);

    const getReq = new Request('http://localhost:3000/api/ads?category=veiculos');
    const response = await getAdsRoute(getReq);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ads.length).toBe(1);
    expect(data.ads[0].title).toBe('Bicicleta Barra Forte');
  });

  it('should mark ad as sold via PATCH /api/ads/[id]/manage with valid PIN', async () => {
    // 1. Create ad
    const postReq = new Request('http://localhost:3000/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        title: 'Violão Takamine Usado',
        description: 'Som acústico lindo.',
        price: 800,
        priceType: 'fixed',
        category: 'outros',
        bairro: 'Stella Maris',
        sellerName: 'Pedro',
        whatsapp: '13995554433',
        pin: '9876',
      }),
    });
    const createRes = await postAdsRoute(postReq);
    const { ad } = await createRes.json();

    // 2. Try with wrong PIN
    const wrongPatchReq = new Request(`http://localhost:3000/api/ads/${ad.id}/manage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '0000', status: 'sold' }),
    });
    const wrongRes = await patchManageRoute(wrongPatchReq, { params: Promise.resolve({ id: ad.id }) });
    expect(wrongRes.status).toBe(401);

    // 3. Mark as sold with right PIN
    const patchReq = new Request(`http://localhost:3000/api/ads/${ad.id}/manage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '9876', status: 'sold' }),
    });
    const patchRes = await patchManageRoute(patchReq, { params: Promise.resolve({ id: ad.id }) });
    expect(patchRes.status).toBe(200);

    // 4. Verify in GET route: should be hidden when includeSold is false
    const listRes = await getAdsRoute(new Request('http://localhost:3000/api/ads'));
    const listData = await listRes.json();
    expect(listData.ads.some((a: any) => a.id === ad.id)).toBe(false);

    // 5. Verify in GET route with includeSold=true: should appear with status sold
    const listAllRes = await getAdsRoute(new Request('http://localhost:3000/api/ads?includeSold=true'));
    const listAllData = await listAllRes.json();
    const found = listAllData.ads.find((a: any) => a.id === ad.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('sold');
  });
});
