
import express from 'express';
import { supabase } from './utils/supabase.js';
import { logSync } from './utils/logger.js';

const router = express.Router();

// Sync round data and strategies
router.post('/', async (req, res) => {
    try {
        const {
            user_id,
            round_data,
            strategy,
            prediction_data,
            action_type = 'sync'
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                error: 'Missing user_id',
                message: 'User ID is required for sync'
            });
        }

        // Insert/Update sync data
        const { data, error } = await supabase
            .from('sync_sessions')
            .upsert({
                user_id,
                round_data,
                strategy,
                prediction_data,
                action_type,
                sync_time: new Date().toISOString(),
                status: 'active'
            }, {
                onConflict: 'user_id'
            })
            .select();

        if (error) throw error;

        // Get other active users for coordination
        const { data: otherUsers } = await supabase
            .from('sync_sessions')
            .select('*')
            .neq('user_id', user_id)
            .eq('status', 'active')
            .gte('sync_time', new Date(Date.now() - 60000).toISOString()); // Last minute

        // Auto-bet coordination logic
        const coordination = await calculateCoordination(user_id, otherUsers);

        // Log sync activity
        await logSync(supabase, {
            user_id,
            action_type,
            coordination_result: coordination,
            active_users: otherUsers.length
        });

        res.json({
            synced: true,
            user_id,
            coordination,
            active_users: otherUsers.length,
            sync_time: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({
            error: 'Sync failed',
            message: error.message
        });
    }
});

// Get sync status for user
router.get('/status/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const { data, error } = await supabase
            .from('sync_sessions')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Get global stats
        const { data: globalStats } = await supabase
            .from('sync_sessions')
            .select('strategy, prediction_data')
            .eq('status', 'active')
            .gte('sync_time', new Date(Date.now() - 300000).toISOString()); // Last 5 minutes

        const strategyDistribution = {};
        globalStats?.forEach(session => {
            const strategy = session.strategy || 'Unknown';
            strategyDistribution[strategy] = (strategyDistribution[strategy] || 0) + 1;
        });

        res.json({
            user_status: data || null,
            global_stats: {
                active_users: globalStats?.length || 0,
                strategy_distribution: strategyDistribution
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Status Error:', error);
        res.status(500).json({
            error: 'Status fetch failed',
            message: error.message
        });
    }
});

// Prediction history sync
router.get('/history/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const { data, error } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Calculate accuracy metrics
        const accuracy = calculateAccuracyMetrics(data);

        res.json({
            history: data,
            total_predictions: data.length,
            accuracy_metrics: accuracy,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({
            error: 'History fetch failed',
            message: error.message
        });
    }
});

// Strategy coordination
router.post('/coordinate', async (req, res) => {
    try {
        const { user_id, proposed_strategy, round_id } = req.body;

        // Get all active strategies for this round
        const { data: activeStrategies } = await supabase
            .from('sync_sessions')
            .select('user_id, strategy, prediction_data')
            .eq('status', 'active')
            .gte('sync_time', new Date(Date.now() - 30000).toISOString()); // Last 30 seconds

        // Calculate coordination recommendation
        const recommendation = await generateCoordinationRecommendation(
            user_id,
            proposed_strategy,
            activeStrategies
        );

        res.json({
            user_id,
            proposed_strategy,
            recommendation,
            active_strategies: activeStrategies,
            round_id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Coordination Error:', error);
        res.status(500).json({
            error: 'Coordination failed',
            message: error.message
        });
    }
});

// Calculate coordination logic
async function calculateCoordination(userId, otherUsers) {
    if (otherUsers.length === 0) {
        return {
            action: 'proceed',
            reason: 'No other active users',
            confidence: 'high'
        };
    }

    // Analyze other users' strategies
    const strategies = otherUsers.map(u => u.strategy);
    const aggressiveCount = strategies.filter(s => s === 'Aggressive').length;
    const conservativeCount = strategies.filter(s => s === 'Conservative').length;

    // Coordination logic
    if (aggressiveCount >= 3) {
        return {
            action: 'wait',
            reason: 'Too many aggressive players - market risk high',
            confidence: 'medium',
            suggested_delay: 30
        };
    }

    if (conservativeCount >= 5) {
        return {
            action: 'proceed-aggressive',
            reason: 'Conservative majority - opportunity for aggressive play',
            confidence: 'high'
        };
    }

    return {
        action: 'proceed',
        reason: 'Balanced coordination environment',
        confidence: 'high'
    };
}

// Generate coordination recommendation
async function generateCoordinationRecommendation(userId, proposedStrategy, activeStrategies) {
    const totalUsers = activeStrategies.length;
    
    if (totalUsers === 0) {
        return {
            action: 'proceed',
            confidence: 'high',
            reason: 'No coordination needed - you are alone'
        };
    }

    // Count strategies
    const strategyCounts = activeStrategies.reduce((acc, user) => {
        acc[user.strategy] = (acc[user.strategy] || 0) + 1;
        return acc;
    }, {});

    // Diversification logic
    const currentCount = strategyCounts[proposedStrategy] || 0;
    const dominantStrategy = Object.keys(strategyCounts).reduce((a, b) => 
        strategyCounts[a] > strategyCounts[b] ? a : b
    );

    if (currentCount >= totalUsers * 0.6) {
        return {
            action: 'diversify',
            confidence: 'medium',
            reason: `Too many ${proposedStrategy} players - consider ${dominantStrategy === proposedStrategy ? 'Balanced' : dominantStrategy}`,
            suggested_strategy: dominantStrategy === proposedStrategy ? 'Balanced' : dominantStrategy
        };
    }

    return {
        action: 'proceed',
        confidence: 'high',
        reason: 'Strategy distribution looks good'
    };
}

// Calculate accuracy metrics
function calculateAccuracyMetrics(predictions) {
    if (!predictions || predictions.length === 0) {
        return {
            overall_accuracy: 0,
            confidence_accuracy: {},
            strategy_accuracy: {}
        };
    }

    let correct = 0;
    const confidenceStats = {};
    const strategyStats = {};

    predictions.forEach(pred => {
        if (pred.actual_result && pred.prediction) {
            const predicted = parseFloat(pred.prediction.replace('x', ''));
            const actual = parseFloat(pred.actual_result);
            
            // Consider prediction correct if within 20% margin
            const isCorrect = Math.abs(predicted - actual) / actual <= 0.2;
            if (isCorrect) correct++;

            // Track by confidence
            if (!confidenceStats[pred.confidence]) {
                confidenceStats[pred.confidence] = { total: 0, correct: 0 };
            }
            confidenceStats[pred.confidence].total++;
            if (isCorrect) confidenceStats[pred.confidence].correct++;

            // Track by strategy
            if (!strategyStats[pred.strategy]) {
                strategyStats[pred.strategy] = { total: 0, correct: 0 };
            }
            strategyStats[pred.strategy].total++;
            if (isCorrect) strategyStats[pred.strategy].correct++;
        }
    });

    return {
        overall_accuracy: (correct / predictions.length) * 100,
        confidence_accuracy: Object.keys(confidenceStats).reduce((acc, key) => {
            const stats = confidenceStats[key];
            acc[key] = (stats.correct / stats.total) * 100;
            return acc;
        }, {}),
        strategy_accuracy: Object.keys(strategyStats).reduce((acc, key) => {
            const stats = strategyStats[key];
            acc[key] = (stats.correct / stats.total) * 100;
            return acc;
        }, {})
    };
}

export default router;
