
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing. Please check your .env file.');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for common database operations

// Insert with error handling
export async function safeInsert(table, data) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();
        
        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        console.error(`Insert error for table ${table}:`, error);
        return { success: false, error: error.message };
    }
}

// Update with error handling
export async function safeUpdate(table, updates, conditions) {
    try {
        let query = supabase.from(table).update(updates);
        
        // Apply conditions
        Object.keys(conditions).forEach(key => {
            query = query.eq(key, conditions[key]);
        });
        
        const { data, error } = await query.select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error(`Update error for table ${table}:`, error);
        return { success: false, error: error.message };
    }
}

// Select with error handling
export async function safeSelect(table, columns = '*', conditions = {}, options = {}) {
    try {
        let query = supabase.from(table).select(columns);
        
        // Apply conditions
        Object.keys(conditions).forEach(key => {
            query = query.eq(key, conditions[key]);
        });
        
        // Apply options
        if (options.limit) query = query.limit(options.limit);
        if (options.order) {
            query = query.order(options.order.column, { 
                ascending: options.order.ascending !== false 
            });
        }
        if (options.range) {
            query = query.range(options.range.from, options.range.to);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error(`Select error for table ${table}:`, error);
        return { success: false, error: error.message };
    }
}

// Upsert with error handling
export async function safeUpsert(table, data, onConflict) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .upsert(data, { onConflict })
            .select();
        
        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        console.error(`Upsert error for table ${table}:`, error);
        return { success: false, error: error.message };
    }
}

// Delete with error handling
export async function safeDelete(table, conditions) {
    try {
        let query = supabase.from(table);
        
        // Apply conditions
        Object.keys(conditions).forEach(key => {
            query = query.eq(key, conditions[key]);
        });
        
        const { data, error } = await query.delete();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error(`Delete error for table ${table}:`, error);
        return { success: false, error: error.message };
    }
}

// Real-time subscription helper
export function subscribeToTable(table, callback, options = {}) {
    const subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', {
            event: options.event || '*',
            schema: 'public',
            table: table,
            filter: options.filter
        }, callback)
        .subscribe();
    
    return subscription;
}

// Health check
export async function checkConnection() {
    try {
        const { data, error } = await supabase
            .from('predictions')
            .select('id')
            .limit(1);
        
        if (error) throw error;
        return { connected: true, timestamp: new Date().toISOString() };
    } catch (error) {
        console.error('Supabase connection check failed:', error);
        return { connected: false, error: error.message };
    }
}

// Batch operations
export async function batchInsert(table, dataArray, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < dataArray.length; i += batchSize) {
        const batch = dataArray.slice(i, i + batchSize);
        const result = await safeInsert(table, batch);
        results.push(result);
        
        // Small delay between batches
        if (i + batchSize < dataArray.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
}

// Query builder helper
export class QueryBuilder {
    constructor(table) {
        this.table = table;
        this.query = supabase.from(table);
    }
    
    select(columns = '*') {
        this.query = this.query.select(columns);
        return this;
    }
    
    where(column, operator, value) {
        switch (operator) {
            case '=':
                this.query = this.query.eq(column, value);
                break;
            case '!=':
                this.query = this.query.neq(column, value);
                break;
            case '>':
                this.query = this.query.gt(column, value);
                break;
            case '>=':
                this.query = this.query.gte(column, value);
                break;
            case '<':
                this.query = this.query.lt(column, value);
                break;
            case '<=':
                this.query = this.query.lte(column, value);
                break;
            case 'like':
                this.query = this.query.like(column, value);
                break;
            case 'in':
                this.query = this.query.in(column, value);
                break;
        }
        return this;
    }
    
    orderBy(column, ascending = true) {
        this.query = this.query.order(column, { ascending });
        return this;
    }
    
    limit(count) {
        this.query = this.query.limit(count);
        return this;
    }
    
    async execute() {
        try {
            const { data, error } = await this.query;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
