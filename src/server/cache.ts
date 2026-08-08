// Lapisan cache sesuai arsitektur PRD: aplikasi web membaca snapshot dari
// cache, bukan menembak sumber (LibreNMS) per permintaan.
//
// - Produksi: set REDIS_URL (Redis lokal/Upstash) → dipakai adapter Redis.
// - Tanpa REDIS_URL: fallback cache in-memory dengan TTL yang sama, cukup
//   untuk pengembangan single-instance.

import Redis from "ioredis";

export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

class MemoryCache implements CacheStore {
  private entries = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

class RedisCache implements CacheStore {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }
}

// Satu instans cache per proses (module scope bertahan antar-request).
export const cache: CacheStore = process.env.REDIS_URL
  ? new RedisCache(process.env.REDIS_URL)
  : new MemoryCache();
