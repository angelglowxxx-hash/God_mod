
class AICache {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map();
        this.maxSize = 1000;
        
        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 300000);
    }

    get(key) {
        const now = Date.now();
        const expiry = this.ttl.get(key);
        
        if (expiry && now > expiry) {
            this.cache.delete(key);
            this.ttl.delete(key);
            return null;
        }
        
        return this.cache.get(key) || null;
    }

    set(key, value, ttlSeconds = 300) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.ttl.delete(firstKey);
        }
        
        this.cache.set(key, value);
        this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    clear() {
        this.cache.clear();
        this.ttl.clear();
    }

    cleanup() {
        const now = Date.now();
        for (const [key, expiry] of this.ttl.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.ttl.delete(key);
            }
        }
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hitRate || 0
        };
    }
}

export const aiCache = new AICache();
