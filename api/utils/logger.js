
import { createClient } from '@supabase/supabase-js';

// Create Supabase client lazily to avoid initialization errors
let supabase = null;

function getSupabaseClient() {
    if (!supabase) {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.warn('Supabase credentials not found in environment variables');
            return null;
        }
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
    }
    return supabase;
}

// Log prediction results and errors
export async function logPrediction(supabaseClient, predictionData) {
    try {
        const { data, error } = await supabaseClient
            .from('predictions')
            .insert({
                prediction: predictionData.prediction,
                confidence: predictionData.confidence,
                comment: predictionData.comment,
                strategy: predictionData.strategy,
                risk_level: predictionData.risk_level,
                input_data: predictionData.input_data,
                models_used: predictionData.models_used || 1,
                voting_consensus: predictionData.voting_consensus || 1,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Prediction logging error:', error);
        return null;
    }
}

// Log hash verification results
export async function logVerification(supabaseClient, verificationData) {
    try {
        const { data, error } = await supabaseClient
            .from('verifications')
            .insert({
                hash: verificationData.hash,
                salt: verificationData.salt,
                round_id: verificationData.round_id,
                crash_point: verificationData.crash_point,
                tag: verificationData.tag,
                pattern_position: verificationData.pattern_position,
                verification_time: verificationData.verification_time,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Verification logging error:', error);
        return null;
    }
}

// Log sync activities
export async function logSync(supabaseClient, syncData) {
    try {
        const { data, error } = await supabaseClient
            .from('sync_logs')
            .insert({
                user_id: syncData.user_id,
                action_type: syncData.action_type,
                coordination_result: syncData.coordination_result,
                active_users: syncData.active_users,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Sync logging error:', error);
        return null;
    }
}

// Log API errors and system events
export async function logError(error, context = {}) {
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) return null;

        const { data, errorLog } = await supabaseClient
            .from('error_logs')
            .insert({
                error_message: error.message,
                error_stack: error.stack,
                context: context,
                severity: context.severity || 'medium',
                created_at: new Date().toISOString()
            });

        if (errorLog) console.error('Error logging failed:', errorLog);
        return data;
    } catch (logError) {
        console.error('Error logging failed:', logError);
        return null;
    }
}

// Log accuracy tracking
export async function logAccuracy(predictionId, actualResult, accuracy) {
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) return null;

        const { data, error } = await supabaseClient
            .from('accuracy_tracking')
            .insert({
                prediction_id: predictionId,
                actual_result: actualResult,
                accuracy_percentage: accuracy,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Accuracy logging error:', error);
        return null;
    }
}

// Get system logs for debugging
export async function getSystemLogs(type = 'all', limit = 100) {
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) return null;

        let query;
        
        switch (type) {
            case 'predictions':
                query = supabaseClient.from('predictions').select('*');
                break;
            case 'verifications':
                query = supabaseClient.from('verifications').select('*');
                break;
            case 'errors':
                query = supabaseClient.from('error_logs').select('*');
                break;
            case 'sync':
                query = supabaseClient.from('sync_logs').select('*');
                break;
            default:
                // Return summary of all log types
                const [predictions, verifications, errors, sync] = await Promise.all([
                    supabaseClient.from('predictions').select('*').limit(20),
                    supabaseClient.from('verifications').select('*').limit(20),
                    supabaseClient.from('error_logs').select('*').limit(20),
                    supabaseClient.from('sync_logs').select('*').limit(20)
                ]);
                
                return {
                    predictions: predictions.data || [],
                    verifications: verifications.data || [],
                    errors: errors.data || [],
                    sync: sync.data || []
                };
        }
        
        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit);
            
        if (error) throw error;
        return data;
        
    } catch (error) {
        console.error('System logs fetch error:', error);
        return null;
    }
}

// Analytics and insights
export async function getAnalytics(timeframe = '24h') {
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) return null;

        const now = new Date();
        let startTime;
        
        switch (timeframe) {
            case '1h':
                startTime = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case '24h':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        const [predictions, verifications, errors] = await Promise.all([
            supabaseClient
                .from('predictions')
                .select('*')
                .gte('created_at', startTime.toISOString()),
            supabaseClient
                .from('verifications')
                .select('*')
                .gte('created_at', startTime.toISOString()),
            supabaseClient
                .from('error_logs')
                .select('*')
                .gte('created_at', startTime.toISOString())
        ]);
        
        return {
            timeframe,
            predictions: {
                total: predictions.data?.length || 0,
                by_confidence: groupBy(predictions.data || [], 'confidence'),
                by_strategy: groupBy(predictions.data || [], 'strategy')
            },
            verifications: {
                total: verifications.data?.length || 0,
                by_tag: groupBy(verifications.data || [], 'tag')
            },
            errors: {
                total: errors.data?.length || 0,
                by_severity: groupBy(errors.data || [], 'severity')
            }
        };
        
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return null;
    }
}

// Helper function to group data
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key] || 'unknown';
        groups[group] = (groups[group] || 0) + 1;
        return groups;
    }, {});
}
