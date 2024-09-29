import NodeCache from 'node-cache';

class Cache {
  private cache: NodeCache;

  constructor(ttl: number) {
    this.cache = new NodeCache({ stdTTL: ttl });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  flush(key: string): void {
    this.cache.del(key);
  }

  flushAll(): void {
    this.cache.flushAll();
  }
}

export const cache = new Cache(600);
