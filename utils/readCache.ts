import type { Request, Response } from 'express';

interface Entry { body: string; expiresAt: number; bytes: number }

/** Bounded per-process cache. Simultaneous misses share one database load. */
export class ReadCache {
  private entries = new Map<string, Entry>();
  private pending = new Map<string, Promise<string>>();
  private bytes = 0;

  constructor(private maxEntries = 200, private maxBytes = 16 * 1024 * 1024, private now = Date.now) {}

  invalidate(prefix: string) {
    for (const [key, entry] of this.entries) {
      if (key.startsWith(prefix)) { this.entries.delete(key); this.bytes -= entry.bytes; }
    }
    // Detach old loads so a write cannot repopulate the cache with pre-write data.
    for (const key of this.pending.keys()) if (key.startsWith(prefix)) this.pending.delete(key);
  }

  async read(key: string, ttlMs: number, load: () => Promise<unknown>): Promise<{ body: string; status: 'HIT' | 'MISS' | 'COALESCED' }> {
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > this.now()) {
      this.entries.delete(key);
      this.entries.set(key, cached);
      return { body: cached.body, status: 'HIT' };
    }
    if (cached) { this.entries.delete(key); this.bytes -= cached.bytes; }
    const existing = this.pending.get(key);
    if (existing) return { body: await existing, status: 'COALESCED' };
    const pending = Promise.resolve().then(load).then(value => JSON.stringify(value));
    this.pending.set(key, pending);
    try {
      const body = await pending;
      const bytes = Buffer.byteLength(body);
      if (this.pending.get(key) === pending && bytes <= this.maxBytes) {
        this.entries.set(key, { body, bytes, expiresAt: this.now() + ttlMs });
        this.bytes += bytes;
        while (this.entries.size > this.maxEntries || this.bytes > this.maxBytes) {
          const oldest = this.entries.keys().next().value!;
          this.bytes -= this.entries.get(oldest)!.bytes;
          this.entries.delete(oldest);
        }
      }
      return { body, status: 'MISS' };
    } finally {
      if (this.pending.get(key) === pending) this.pending.delete(key);
    }
  }
}

export async function cachedJson(req: Request, res: Response, namespace: string, ttlMs: number, load: () => Promise<unknown>) {
  const cache: ReadCache = req.app.locals.readCache;
  const start = performance.now();
  const result = await cache.read(`${namespace}:${req.originalUrl}`, ttlMs, load);
  res.set('X-Cache', result.status);
  res.set('Server-Timing', `data;dur=${(performance.now() - start).toFixed(1)}`);
  // Revalidate browser copies; application writes invalidate the server cache immediately.
  if (!res.get('Cache-Control')?.includes('private')) res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  res.type('json').send(result.body);
}
