
class LatencyMonitor {
    constructor() {
        this.metrics = new Map();
        this.thresholds = {
            groq_prediction: 5000, // 5 seconds
            supabase_query: 2000,  // 2 seconds
            hash_verification: 1000 // 1 second
        };
    }

    async logLatency(operation, latency) {
        const timestamp = new Date().toISOString();
        
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        
        const operationMetrics = this.metrics.get(operation);
        operationMetrics.push({ latency, timestamp });
        
        // Keep only last 100 measurements
        if (operationMetrics.length > 100) {
            operationMetrics.shift();
        }
        
        // Check if latency exceeds threshold
        const threshold = this.thresholds[operation];
        if (threshold && latency > threshold) {
            console.warn(`⚠️ High latency detected for ${operation}: ${latency}ms (threshold: ${threshold}ms)`);
            
            // Trigger fallback if available
            this.triggerFallback(operation, latency);
        }
        
        return this.getOperationStats(operation);
    }

    getOperationStats(operation) {
        const metrics = this.metrics.get(operation) || [];
        if (metrics.length === 0) return null;
        
        const latencies = metrics.map(m => m.latency);
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const min = Math.min(...latencies);
        const max = Math.max(...latencies);
        
        // Calculate percentiles
        const sorted = [...latencies].sort((a, b) => a - b);
        const p50 = sorted[Math.floor(sorted.length * 0.5)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];
        
        return {
            operation,
            count: metrics.length,
            average: Math.round(avg),
            min,
            max,
            p50,
            p95,
            p99,
            threshold: this.thresholds[operation] || null,
            status: avg > (this.thresholds[operation] || Infinity) ? 'degraded' : 'healthy'
        };
    }

    getAllStats() {
        const stats = {};
        for (const operation of this.metrics.keys()) {
            stats[operation] = this.getOperationStats(operation);
        }
        return stats;
    }

    triggerFallback(operation, latency) {
        // Emit fallback event for different operations
        switch (operation) {
            case 'groq_prediction':
                console.log(`🔄 Groq API slow (${latency}ms) - switching to mathematical fallback`);
                break;
            case 'supabase_query':
                console.log(`🔄 Supabase slow (${latency}ms) - using local cache fallback`);
                break;
            default:
                console.log(`🔄 ${operation} slow (${latency}ms) - fallback triggered`);
        }
    }

    setThreshold(operation, threshold) {
        this.thresholds[operation] = threshold;
    }

    reset() {
        this.metrics.clear();
    }
}

export const latencyMonitor = new LatencyMonitor();

export async function logLatency(operation, latency) {
    return latencyMonitor.logLatency(operation, latency);
}

export function getLatencyStats(operation = null) {
    return operation ? latencyMonitor.getOperationStats(operation) : latencyMonitor.getAllStats();
}
