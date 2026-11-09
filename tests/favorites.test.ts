import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { getFavorites, isFavorite, toggleFavorite } from '@/lib/favorites';

class LocalStorageMock {
  store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('Favorites Helper (Local-First)', () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;
  const originalCustomEvent = (globalThis as unknown as { CustomEvent?: unknown }).CustomEvent;

  beforeAll(() => {
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: new LocalStorageMock(),
      dispatchEvent: () => true,
    };
    (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class CustomEvent {
      constructor(public type: string, public init?: unknown) {}
    };
  });

  afterAll(() => {
    (globalThis as unknown as { window: unknown }).window = originalWindow;
    (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = originalCustomEvent;
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with empty favorites and toggles correctly', () => {
    expect(getFavorites()).toEqual([]);
    expect(isFavorite('ad_123')).toBe(false);

    // Toggle on
    const res1 = toggleFavorite('ad_123');
    expect(res1).toBe(true);
    expect(isFavorite('ad_123')).toBe(true);
    expect(getFavorites()).toEqual(['ad_123']);

    // Toggle off
    const res2 = toggleFavorite('ad_123');
    expect(res2).toBe(false);
    expect(isFavorite('ad_123')).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('handles multiple favorites correctly', () => {
    toggleFavorite('ad_1');
    toggleFavorite('ad_2');
    toggleFavorite('ad_3');

    expect(getFavorites()).toEqual(['ad_1', 'ad_2', 'ad_3']);
    expect(isFavorite('ad_2')).toBe(true);
    expect(isFavorite('ad_99')).toBe(false);

    toggleFavorite('ad_2');
    expect(getFavorites()).toEqual(['ad_1', 'ad_3']);
  });
});
