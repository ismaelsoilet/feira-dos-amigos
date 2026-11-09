export type AdCategory =
  | 'eletronicos'
  | 'veiculos'
  | 'imoveis'
  | 'casa_moveis'
  | 'roupas'
  | 'servicos'
  | 'feira_alimentos'
  | 'outros';

export type AdPriceType = 'fixed' | 'negotiable' | 'free' | 'trade';

export type AdStatus = 'active' | 'sold' | 'expired';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: AdPriceType;
  category: AdCategory;
  bairro: string;
  sellerName: string;
  whatsapp: string;
  phone?: string;
  photos: string[];
  status: AdStatus;
  pinHash: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdSummary {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: AdPriceType;
  category: AdCategory;
  bairro: string;
  sellerName: string;
  whatsapp: string;
  thumbnail: string;
  photosCount: number;
  status: AdStatus;
  expiresAt: string;
  createdAt: string;
}

export interface CreateAdInput {
  title: string;
  description: string;
  price: number;
  priceType: AdPriceType;
  category: AdCategory;
  bairro: string;
  sellerName: string;
  whatsapp: string;
  phone?: string;
  photos: string[];
  pin: string;
  durationDays?: number;
}

export interface AdFilters {
  query?: string;
  category?: AdCategory | 'all';
  bairro?: string | 'all';
  minPrice?: number;
  maxPrice?: number;
  priceType?: AdPriceType | 'all';
  includeSold?: boolean;
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'expiring';
}

export const PERUIBE_BAIRROS = [
  'Centro',
  'Stella Maris',
  'Guaraú',
  'Três Marias',
  'Caraguava',
  'Jardim Ribamar',
  'Estação',
  'Ruínas',
  'Arpoador',
  'Jardim Brasil',
  'Jardim Veneza',
  'Balneário Oásis',
  'Parque Turístico',
  'Outro Bairro de Peruíbe',
] as const;

export const AD_CATEGORIES: { id: AdCategory; label: string; icon: string }[] = [
  { id: 'eletronicos', label: 'Eletrônicos & Info', icon: 'Smartphone' },
  { id: 'veiculos', label: 'Veículos & Autos', icon: 'Car' },
  { id: 'imoveis', label: 'Imóveis & Aluguel', icon: 'Home' },
  { id: 'casa_moveis', label: 'Móveis & Casa', icon: 'Armchair' },
  { id: 'roupas', label: 'Roupas & Moda', icon: 'Shirt' },
  { id: 'servicos', label: 'Serviços & Bicos', icon: 'Wrench' },
  { id: 'feira_alimentos', label: 'Feira & Comida', icon: 'Apple' },
  { id: 'outros', label: 'Outros & Trocas', icon: 'Package' },
];
