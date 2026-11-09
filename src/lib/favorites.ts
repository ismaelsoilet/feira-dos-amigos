const FAVORITES_KEY = 'feira_favoritos';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Error reading favorites from localStorage:', err);
    return [];
  }
}

export function isFavorite(id: string): boolean {
  const favs = getFavorites();
  return favs.includes(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const favs = getFavorites();
    const index = favs.indexOf(id);
    let updated: string[];
    let isNowFav: boolean;

    if (index >= 0) {
      updated = favs.filter(item => item !== id);
      isNowFav = false;
    } else {
      updated = [...favs, id];
      isNowFav = true;
    }

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new CustomEvent('feira_favorites_updated', { detail: updated }));
    return isNowFav;
  } catch (err) {
    console.warn('Error saving favorite to localStorage:', err);
    return false;
  }
}
