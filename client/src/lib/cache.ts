/**
 * Lightweight in-memory cache for API responses.
 *
 * Since the scraper only runs every ~30 minutes, product and price data
 * is very stable. Caching avoids redundant network requests when
 * navigating between pages within the same session.
 *
 * All data lives in memory — it's automatically cleared on tab close
 * or full page reload.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Default TTLs in milliseconds */
export const TTL = {
  PRODUCT_LIST: 5 * 60 * 1000,    // 5 minutes
  PRODUCT_DETAIL: 5 * 60 * 1000,  // 5 minutes
  PRODUCT_PRICES: 5 * 60 * 1000,  // 5 minutes
  PRODUCT_IMAGE: 10 * 60 * 1000,  // 10 minutes
  PRODUCT_CARDS: 5 * 60 * 1000,   // 5 minutes
} as const;

/**
 * Get a cached value if it exists and hasn't expired.
 */
export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Check if a key exists in the cache and hasn't expired.
 * Useful when the cached value itself could be null.
 */
export function cacheHas(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  return true;
}

/**
 * Store a value in the cache with a TTL.
 */
export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Remove a specific key from the cache.
 */
export function cacheDelete(key: string): void {
  store.delete(key);
}

/**
 * Remove all keys that start with a given prefix.
 * Useful for invalidating related entries (e.g. all product-related caches).
 */
export function cacheInvalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/**
 * Clear the entire cache.
 */
export function cacheClear(): void {
  store.clear();
}

// ── Cache key builders ──

export const CacheKeys = {
  allProducts: () => "products:all",
  productDetail: (id: string) => `products:detail:${id}`,
  productPrices: (id: string) => `products:prices:${id}`,
  productImage: (id: string) => `products:image:${id}`,
  productCards: () => "products:cards",
} as const;
