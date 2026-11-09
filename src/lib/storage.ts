import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { put, del, list } from '@vercel/blob';
import { Ad, AdSummary, CreateAdInput, AdFilters, CommunityStats } from '../types/ad';

// In serverless environments (like Vercel), only /tmp is writable
const BASE_DATA_PATH = process.env.VERCEL
  ? path.join('/tmp', 'feira-data')
  : path.resolve(process.cwd(), 'data');

const LOCAL_DATA_DIR = path.join(BASE_DATA_PATH, 'local-ads');
const LOCAL_INDEX_PATH = path.join(BASE_DATA_PATH, 'catalog-index.json');

export function isVercelBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

function ensureLocalDirs(): void {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('ensureLocalDirs error:', e);
  }
}

async function readLocalIndex(): Promise<AdSummary[]> {
  ensureLocalDirs();
  if (!fs.existsSync(LOCAL_INDEX_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCAL_INDEX_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('readLocalIndex parse error, returning empty index:', err);
    return [];
  }
}

async function writeLocalIndex(index: AdSummary[]): Promise<void> {
  ensureLocalDirs();
  try {
    fs.writeFileSync(LOCAL_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
  } catch (e) {
    console.warn('writeLocalIndex error:', e);
  }
}

// Master index loader (Blob-aware with local fallback)
async function getCatalogIndex(): Promise<AdSummary[]> {
  if (isVercelBlobConfigured()) {
    try {
      const { blobs } = await list({ prefix: 'ads/catalog-index.json', limit: 1 });
      const indexBlob = blobs.find(b => b.pathname === 'ads/catalog-index.json');
      if (indexBlob && indexBlob.downloadUrl) {
        const res = await fetch(indexBlob.downloadUrl, { cache: 'no-store' });
        if (res.ok) {
          const remoteData: AdSummary[] = await res.json();
          await writeLocalIndex(remoteData);
          return remoteData;
        }
      }
    } catch (err) {
      console.warn('Error reading catalog-index from Vercel Blob, using local fallback:', err);
    }
  }
  return await readLocalIndex();
}

async function syncCatalogIndex(index: AdSummary[]): Promise<void> {
  await writeLocalIndex(index);
  if (isVercelBlobConfigured()) {
    try {
      await put('ads/catalog-index.json', JSON.stringify(index, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
    } catch (err) {
      console.warn('Error syncing catalog-index to Vercel Blob:', err);
    }
  }
}

function toSummary(ad: Ad): AdSummary {
  return {
    id: ad.id,
    title: ad.title,
    description: ad.description.slice(0, 160),
    price: ad.price,
    priceType: ad.priceType,
    category: ad.category,
    bairro: ad.bairro,
    sellerName: ad.sellerName,
    whatsapp: ad.whatsapp,
    thumbnail: ad.photos[0] || '/logo.jpg',
    photosCount: ad.photos.length,
    status: ad.status,
    expiresAt: ad.expiresAt,
    createdAt: ad.createdAt,
    views: ad.views || 0,
    whatsappClicks: ad.whatsappClicks || 0,
  };
}

export async function saveAd(input: CreateAdInput): Promise<Ad> {
  const id = `ad_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date();
  const duration = input.durationDays !== undefined ? input.durationDays : 30;
  const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString();

  const ad: Ad = {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    price: Number(input.price) || 0,
    priceType: input.priceType,
    category: input.category,
    bairro: input.bairro.trim(),
    sellerName: input.sellerName.trim(),
    whatsapp: input.whatsapp.replace(/\D/g, ''),
    phone: input.phone ? input.phone.replace(/\D/g, '') : undefined,
    photos: input.photos && input.photos.length > 0 ? input.photos : ['/logo.jpg'],
    status: 'active',
    pinHash: hashPin(input.pin),
    expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    views: 0,
    whatsappClicks: 0,
  };

  // 1. Write ad to local fallback
  ensureLocalDirs();
  try {
    fs.writeFileSync(path.join(LOCAL_DATA_DIR, `${id}.json`), JSON.stringify(ad, null, 2));
  } catch (e) {
    console.warn('Local write error:', e);
  }

  // 2. Write to Vercel Blob if configured
  if (isVercelBlobConfigured()) {
    try {
      await put(`ads/${id}/ad.json`, JSON.stringify(ad, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
    } catch (e) {
      console.warn('Vercel Blob put error:', e);
    }
  }

  // 3. Update master catalog index
  const index = await getCatalogIndex();
  index.unshift(toSummary(ad));
  await syncCatalogIndex(index);

  return ad;
}

export async function getAdById(id: string): Promise<Ad | null> {
  ensureLocalDirs();
  const localFile = path.join(LOCAL_DATA_DIR, `${id}.json`);
  if (fs.existsSync(localFile)) {
    try {
      const data = fs.readFileSync(localFile, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.warn('Local ad read error:', err);
    }
  }

  // If not on local disk, check Vercel Blob
  if (isVercelBlobConfigured()) {
    try {
      const { blobs } = await list({ prefix: `ads/${id}/ad.json`, limit: 1 });
      const adBlob = blobs.find(b => b.pathname === `ads/${id}/ad.json`);
      if (adBlob && adBlob.downloadUrl) {
        const res = await fetch(adBlob.downloadUrl, { cache: 'no-store' });
        if (res.ok) {
          const remoteAd: Ad = await res.json();
          // Cache locally
          try {
            fs.writeFileSync(localFile, JSON.stringify(remoteAd, null, 2));
          } catch (err) {
            console.warn('Local cache write error:', err);
          }
          return remoteAd;
        }
      }
    } catch (e) {
      console.warn('Vercel Blob fetch error for ad:', e);
    }
  }

  return null;
}

export async function getAds(filters?: AdFilters): Promise<AdSummary[]> {
  const index = await getCatalogIndex();
  const now = new Date().toISOString();

  const filtered = index.filter(ad => {
    // Check expiration
    if (ad.expiresAt && ad.expiresAt < now) {
      return false;
    }
    // Check sold status
    if (!filters?.includeSold && ad.status === 'sold') {
      return false;
    }
    // Category filter
    if (filters?.category && filters.category !== 'all' && ad.category !== filters.category) {
      return false;
    }
    // Bairro filter
    if (filters?.bairro && filters.bairro !== 'all' && ad.bairro !== filters.bairro) {
      return false;
    }
    // Min price
    if (filters?.minPrice !== undefined && ad.price < filters.minPrice) {
      return false;
    }
    // Max price
    if (filters?.maxPrice !== undefined && ad.price > filters.maxPrice) {
      return false;
    }
    // Price type
    if (filters?.priceType && filters.priceType !== 'all' && ad.priceType !== filters.priceType) {
      return false;
    }
    return true;
  });

  // Sort
  if (filters?.sortBy === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters?.sortBy === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filters?.sortBy === 'expiring') {
    filtered.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
  } else {
    // Default: most recent
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return filtered;
}

export async function updateAdStatus(
  id: string,
  pin: string,
  status: 'active' | 'sold'
): Promise<{ success: boolean; error?: string }> {
  const ad = await getAdById(id);
  if (!ad) {
    return { success: false, error: 'Anúncio não encontrado.' };
  }

  if (ad.pinHash !== hashPin(pin)) {
    return { success: false, error: 'PIN de segurança incorreto.' };
  }

  ad.status = status;
  ad.updatedAt = new Date().toISOString();

  // Save local
  ensureLocalDirs();
  const localFile = path.join(LOCAL_DATA_DIR, `${id}.json`);
  try {
    fs.writeFileSync(localFile, JSON.stringify(ad, null, 2));
  } catch (e) {
    console.warn('Local update error:', e);
  }

  // Save Blob
  if (isVercelBlobConfigured()) {
    try {
      await put(`ads/${id}/ad.json`, JSON.stringify(ad, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
    } catch (e) {
      console.warn('Blob update error:', e);
    }
  }

  // Update index
  const index = await getCatalogIndex();
  const itemIndex = index.findIndex(a => a.id === id);
  if (itemIndex !== -1) {
    index[itemIndex].status = status;
    await syncCatalogIndex(index);
  }

  return { success: true };
}

export async function deleteAd(
  id: string,
  pin: string
): Promise<{ success: boolean; error?: string }> {
  const ad = await getAdById(id);
  if (!ad) {
    return { success: false, error: 'Anúncio não encontrado.' };
  }

  if (ad.pinHash !== hashPin(pin)) {
    return { success: false, error: 'PIN de segurança incorreto.' };
  }

  // Delete local file
  ensureLocalDirs();
  const localFile = path.join(LOCAL_DATA_DIR, `${id}.json`);
  if (fs.existsSync(localFile)) {
    try {
      fs.unlinkSync(localFile);
    } catch (e) {
      console.warn('Local delete error:', e);
    }
  }

  // Delete Blob if configured
  if (isVercelBlobConfigured()) {
    try {
      const { blobs } = await list({ prefix: `ads/${id}/` });
      if (blobs.length > 0) {
        await del(blobs.map(b => b.url));
      }
    } catch (e) {
      console.warn('Blob delete error:', e);
    }
  }

  // Remove from catalog index
  const index = await getCatalogIndex();
  const filtered = index.filter(a => a.id !== id);
  await syncCatalogIndex(filtered);

  return { success: true };
}

export async function incrementAdMetric(
  id: string,
  metric: 'views' | 'whatsappClicks'
): Promise<{ views: number; whatsappClicks: number } | null> {
  const ad = await getAdById(id);
  if (!ad) {
    return null;
  }

  if (metric === 'views') {
    ad.views = (ad.views || 0) + 1;
  } else if (metric === 'whatsappClicks') {
    ad.whatsappClicks = (ad.whatsappClicks || 0) + 1;
  }

  // Update local ad file
  ensureLocalDirs();
  const localFile = path.join(LOCAL_DATA_DIR, `${id}.json`);
  try {
    fs.writeFileSync(localFile, JSON.stringify(ad, null, 2));
  } catch (err) {
    console.warn(`Local ad update error on metric ${metric} for ${id}:`, err);
  }

  // Update in Blob if configured
  if (isVercelBlobConfigured()) {
    try {
      await put(`ads/${id}/ad.json`, JSON.stringify(ad, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
    } catch (err) {
      console.warn(`Blob ad update error on metric ${metric} for ${id}:`, err);
    }
  }

  // Update in master catalog index
  const index = await getCatalogIndex();
  const item = index.find(a => a.id === id);
  if (item) {
    item.views = ad.views;
    item.whatsappClicks = ad.whatsappClicks;
    await syncCatalogIndex(index);
  }

  return {
    views: ad.views || 0,
    whatsappClicks: ad.whatsappClicks || 0,
  };
}

export async function purgeExpiredAds(): Promise<{ purgedCount: number; purgedIds: string[] }> {
  const index = await getCatalogIndex();
  const now = new Date().toISOString();
  const purgedIds: string[] = [];

  for (const item of index) {
    if (item.status !== 'expired' && item.expiresAt && item.expiresAt < now) {
      item.status = 'expired';
      purgedIds.push(item.id);

      // Update full ad file if present locally
      const localFile = path.join(LOCAL_DATA_DIR, `${item.id}.json`);
      if (fs.existsSync(localFile)) {
        try {
          const raw = fs.readFileSync(localFile, 'utf-8');
          const fullAd: Ad = JSON.parse(raw);
          fullAd.status = 'expired';
          fullAd.updatedAt = now;
          fs.writeFileSync(localFile, JSON.stringify(fullAd, null, 2));
        } catch (err) {
          console.warn(`Local expired ad update error for ${item.id}:`, err);
        }
      }

      // If Blob configured, optionally delete photos to save storage quota
      if (isVercelBlobConfigured()) {
        try {
          const { blobs } = await list({ prefix: `ads/${item.id}/photo-` });
          if (blobs.length > 0) {
            await del(blobs.map(b => b.url));
          }
        } catch (err) {
          console.warn(`Blob expired photos deletion error for ${item.id}:`, err);
        }
      }
    }
  }

  if (purgedIds.length > 0) {
    await syncCatalogIndex(index);
  }

  return { purgedCount: purgedIds.length, purgedIds };
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const index = await getCatalogIndex();
  const now = new Date().toISOString();

  let totalActive = 0;
  let totalSold = 0;
  let totalExpired = 0;
  let totalViews = 0;
  let totalWhatsappClicks = 0;
  const activeBairros = new Set<string>();

  for (const item of index) {
    totalViews += item.views || 0;
    totalWhatsappClicks += item.whatsappClicks || 0;

    if (item.status === 'sold') {
      totalSold++;
    } else if (item.status === 'expired' || (item.expiresAt && item.expiresAt < now)) {
      totalExpired++;
    } else {
      totalActive++;
      if (item.bairro) {
        activeBairros.add(item.bairro);
      }
    }
  }

  return {
    totalActive,
    totalSold,
    totalExpired,
    bairrosCount: activeBairros.size,
    totalViews,
    totalWhatsappClicks,
  };
}

export async function clearLocalStorageForTesting(): Promise<void> {
  ensureLocalDirs();
  try {
    if (fs.existsSync(LOCAL_DATA_DIR)) {
      const files = fs.readdirSync(LOCAL_DATA_DIR);
      for (const f of files) {
        fs.unlinkSync(path.join(LOCAL_DATA_DIR, f));
      }
    }
    if (fs.existsSync(LOCAL_INDEX_PATH)) {
      fs.unlinkSync(LOCAL_INDEX_PATH);
    }
  } catch (e) {
    console.warn('clearLocalStorageForTesting error:', e);
  }
}
