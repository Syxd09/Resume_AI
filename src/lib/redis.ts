import { LRUCache } from 'lru-cache';

// Initialize a 100% free, local in-memory LRU cache to replace Upstash Redis
const cache = new LRUCache<string, string>({
    max: 500, // Maximum number of AI prompts to store in memory
    ttl: 1000 * 60 * 60 * 24 * 7, // 7 Days time-to-live
});

// Provide a Redis-compatible API wrapper so we don't have to rewrite the AI endpoints
export const redis = {
    get: async (key: string): Promise<string | null> => {
        return cache.get(key) || null;
    },
    set: async (key: string, value: string, options?: { ex?: number }): Promise<void> => {
        if (options?.ex) {
            cache.set(key, value, { ttl: options.ex * 1000 });
        } else {
            cache.set(key, value);
        }
    }
};
