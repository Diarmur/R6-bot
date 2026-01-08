type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, value: T, ttl = 1800) {
  cache.set(key, { value, expires: Date.now() + ttl * 1000 });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
