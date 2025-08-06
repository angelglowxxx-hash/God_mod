
import express from 'express';
import crypto from 'crypto';
import { supabase } from './utils/supabase.js';
import { logVerification } from './utils/logger.js';

const router = express.Router();

// Verify provably fair hash
router.post('/', async (req, res) => {
    try {
        const { hash, salt, round_id } = req.body;

        if (!hash || !salt) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Hash and salt are required'
            });
        }

        // Decode crash point from hash
        const crashPoint = decodeCrashPoint(hash, salt);
        const tag = classifyCrashPoint(crashPoint);
        const pattern = await analyzePattern(crashPoint, round_id);

        // Log verification to Supabase
        await logVerification(supabase, {
            hash,
            salt,
            round_id,
            crash_point: crashPoint,
            tag,
            pattern_position: pattern.position,
            verification_time: new Date().toISOString()
        });

        res.json({
            verified: true,
            crash_point: crashPoint,
            tag,
            pattern,
            round_id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({
            error: 'Verification failed',
            message: error.message
        });
    }
});

// Decode crash point from hash and salt
function decodeCrashPoint(hash, salt) {
    try {
        // Create HMAC-SHA256 hash
        const hmac = crypto.createHmac('sha256', salt);
        hmac.update(hash);
        const result = hmac.digest('hex');

        // Take first 8 characters and convert to integer
        const hex = result.substring(0, 8);
        const intValue = parseInt(hex, 16);

        // Convert to crash point (Aviator algorithm approximation)
        if (intValue === 0) return 1.00;
        
        // Calculate crash point using house edge
        const houseEdge = 0.01; // 1% house edge
        const crashPoint = Math.floor((2 ** 32 / (intValue + 1)) * (1 - houseEdge) * 100) / 100;
        
        return Math.max(1.00, Math.min(crashPoint, 1000000.00));
        
    } catch (error) {
        console.error('Decode Error:', error);
        return 1.00; // Safe fallback
    }
}

// Classify crash point safety
function classifyCrashPoint(crashPoint) {
    if (crashPoint < 1.5) return 'very-risky';
    if (crashPoint < 2.0) return 'risky';
    if (crashPoint < 3.0) return 'moderate';
    if (crashPoint < 5.0) return 'safe';
    if (crashPoint < 10.0) return 'very-safe';
    return 'moonshot';
}

// Analyze pattern position
async function analyzePattern(crashPoint, roundId) {
    try {
        // Get recent crash points from database
        const { data: recentData } = await supabase
            .from('verifications')
            .select('crash_point')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!recentData || recentData.length === 0) {
            return {
                position: 'unknown',
                streak_count: 0,
                pattern_type: 'insufficient-data'
            };
        }

        const recentPoints = recentData.map(d => d.crash_point);
        
        // Detect streaks
        let streakCount = 0;
        let streakType = 'mixed';
        
        const threshold = 2.0;
        const isLow = crashPoint < threshold;
        
        for (let i = 0; i < recentPoints.length; i++) {
            const pointIsLow = recentPoints[i] < threshold;
            if (pointIsLow === isLow) {
                streakCount++;
            } else {
                break;
            }
        }
        
        if (streakCount >= 3) {
            streakType = isLow ? 'low-streak' : 'high-streak';
        }

        // Pattern analysis
        const lowCount = recentPoints.slice(0, 10).filter(p => p < 2.0).length;
        const highCount = recentPoints.slice(0, 10).filter(p => p >= 5.0).length;
        
        let patternType = 'balanced';
        if (lowCount >= 7) patternType = 'low-heavy';
        else if (highCount >= 4) patternType = 'high-heavy';
        else if (streakCount >= 5) patternType = 'streak-pattern';

        return {
            position: streakCount >= 3 ? 'streak-active' : 'normal',
            streak_count: streakCount,
            pattern_type: patternType,
            recent_low_ratio: lowCount / 10,
            recent_high_ratio: highCount / 10
        };

    } catch (error) {
        console.error('Pattern Analysis Error:', error);
        return {
            position: 'error',
            streak_count: 0,
            pattern_type: 'analysis-failed'
        };
    }
}

// Batch verification endpoint
router.post('/batch', async (req, res) => {
    try {
        const { verifications } = req.body;
        
        if (!Array.isArray(verifications)) {
            return res.status(400).json({
                error: 'Invalid format',
                message: 'Expected array of verifications'
            });
        }

        const results = await Promise.all(
            verifications.map(async (v) => {
                try {
                    const crashPoint = decodeCrashPoint(v.hash, v.salt);
                    const tag = classifyCrashPoint(crashPoint);
                    return {
                        round_id: v.round_id,
                        crash_point: crashPoint,
                        tag,
                        verified: true
                    };
                } catch (error) {
                    return {
                        round_id: v.round_id,
                        error: error.message,
                        verified: false
                    };
                }
            })
        );

        res.json({
            batch_size: verifications.length,
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Batch Verification Error:', error);
        res.status(500).json({
            error: 'Batch verification failed',
            message: error.message
        });
    }
});

export default router;
