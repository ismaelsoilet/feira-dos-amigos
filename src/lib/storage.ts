import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { put } from '@vercel/blob';
import { Ad, AdSummary, CreateAdInput, AdFilters } from '../types/ad';

const LOCAL_DATA_DIR = path.resolve(process.cwd(), 'data/local-ads');
const LOCAL_INDEX_PATH = path.resolve(process.cwd(), 'data/catalog-index.json');

function isVercelBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

function ensureLocalDirs(): void {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
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
  } catch {
    return [];
  }
}

async function writeLocalIndex(index: AdSummary[]): Promise<void> {
  ensureLocalDirs();
  fs.writeFileSync(LOCAL_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
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
  };
}

export async function saveAd(input: CreateAdInput): Promise<Ad> {
  const id = `ad_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date();
  const duration = input.durationDays || 30;
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
  };

  if (isVercelBlobConfigured()) {
    try {
      await put(`ads/${id}/ad.json`, JSON.stringify(ad, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
    } catch (e) {
      console.warn('Vercel Blob put error, falling back to local file:', e);
      ensureLocalDirs();
      fs.writeFileSync(path.join(LOCAL_DATA_DIR, `${id}.json`), JSON.stringify(ad, null, 2));
    }
  } else {
    ensureLocalDirs();
    fs.writeFileSync(path.join(LOCAL_DATA_DIR, `${id}.json`), JSON.stringify(ad, null, 2));
  }

  // Update catalog index
  const index = await readLocalIndex();
  index.unshift(toSummary(ad));
  await writeLocalIndex(index);

  return ad;
}

export async function getAdById(id: string): Promise<Ad | null> {
  ensureLocalDirs();
  const localFile = path.join(LOCAL_DATA_DIR, `${id}.json`);
  if (fs.existsSync(localFile)) {
    try {
      const data = fs.readFileSync(localFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export async function getAds(filters?: AdFilters): Promise<AdSummary[]> {
  const index = await readLocalIndex();
  const now = new Date().toISOString();

  let filtered = index.filter(ad => {
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

  ensureLocalDirs();
  fs.writeFileSync(path.join(LOCAL_DATA_DIR, `${id}.json`), JSON.stringify(ad, null, 2));

  // Update index
  const index = await readLocalIndex();
  const itemIndex = index.findIndex(a => a.id === id);
  if (itemIndex !== -1) {
    index[itemIndex].status = status;
    await writeLocalIndex(index);
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

  ensureLocalDirs();
  const filePath = path.join(LOCAL_DATA_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const index = await readLocalIndex();
  const filtered = index.filter(a => a.id !== id);
  await writeLocalIndex(filtered);

  return { success: true };
}

export async function clearLocalStorageForTesting(): Promise<void> {
  ensureLocalDirs();
  if (fs.existsSync(LOCAL_DATA_DIR)) {
    const files = fs.readdirSync(LOCAL_DATA_DIR);
    for (const f of files) {
      fs.unlinkSync(path.join(LOCAL_DATA_DIR, f));
    }
  }
  if (fs.existsSync(LOCAL_INDEX_PATH)) {
    fs.unlinkSync(LOCAL_INDEX_PATH);
  }
}
