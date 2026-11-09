import { AdSummary, AdFilters } from '../types/ad';

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function filterAndSearchAds(
  ads: AdSummary[],
  query: string,
  filters?: AdFilters
): AdSummary[] {
  const normQuery = normalizeText(query).trim();
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 0);

  return ads.filter(ad => {
    // 1. Status check: sold items
    if (!filters?.includeSold && ad.status === 'sold') {
      return false;
    }

    // 1.1 Favorites filter
    if (filters?.onlyFavorites) {
      const favSet = new Set(filters.favoriteIds || []);
      if (!favSet.has(ad.id)) {
        return false;
      }
    }

    // 2. Category check
    if (filters?.category && filters.category !== 'all' && ad.category !== filters.category) {
      return false;
    }

    // 3. Bairro check
    if (filters?.bairro && filters.bairro !== 'all' && ad.bairro !== filters.bairro) {
      return false;
    }

    // 4. Price range
    if (filters?.minPrice !== undefined && ad.price < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && ad.price > filters.maxPrice) {
      return false;
    }

    // 5. Price type
    if (filters?.priceType && filters.priceType !== 'all' && ad.priceType !== filters.priceType) {
      return false;
    }

    // 6. Query matching
    if (queryTokens.length > 0) {
      const haystack = normalizeText(`${ad.title} ${ad.description} ${ad.category} ${ad.bairro} ${ad.sellerName}`);
      const matchesAll = queryTokens.every(token => haystack.includes(token));
      if (!matchesAll) {
        return false;
      }
    }

    return true;
  });
}

export function getHighlightParts(
  text: string,
  query: string
): { text: string; isMatch: boolean }[] {
  if (!text || !query.trim()) {
    return [{ text: text || '', isMatch: false }];
  }

  const queryTokens = query
    .split(/\s+/)
    .map(t => normalizeText(t).trim())
    .filter(t => t.length > 0);

  if (queryTokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  const normText = normalizeText(text);
  const matchRanges: [number, number][] = [];

  for (const token of queryTokens) {
    let startIdx = 0;
    while (startIdx < normText.length) {
      const idx = normText.indexOf(token, startIdx);
      if (idx === -1) break;

      matchRanges.push([idx, idx + token.length]);
      startIdx = idx + token.length;
    }
  }

  if (matchRanges.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Merge overlapping or contiguous ranges
  matchRanges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [matchRanges[0]];
  for (let i = 1; i < matchRanges.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = matchRanges[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  // Slice original text based on merged ranges
  const result: { text: string; isMatch: boolean }[] = [];
  let lastIndex = 0;

  for (const [start, end] of merged) {
    if (start > lastIndex) {
      result.push({ text: text.slice(lastIndex, start), isMatch: false });
    }
    result.push({ text: text.slice(start, end), isMatch: true });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return result;
}
