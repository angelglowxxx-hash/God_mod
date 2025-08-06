
import express from 'express';
import fetch from 'node-fetch';
import { supabase } from './utils/supabase.js';
import { aiCache } from './utils/cache.js';
import { logLatency } from './utils/latency.js';
import { logPrediction } from './utils/logger.js';
import { buildAdvancedPrompt } from './utils/promptBuilder.js';

const router = express.Router();

// AI Prediction Engine with Groq
router.post('/', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const {
            round_data,
            pattern_summary,
            hash_history,
            crash_points,
            strategy = 'Balanced',
            volatility_index = 0
        } = req.body;

        // Validate required data
        if (!crash_points || crash_points.length < 10) {
            return res.status(400).json({
                error: 'Insufficient data',
                message: 'Need at least 10 crash points for prediction'
            });
        }

        // Check cache first
        const cacheKey = `predict_${JSON.stringify(crash_points.slice(-10))}_${strategy}`;
        const cached = aiCache.get(cacheKey);
        if (cached) {
            return res.json({
                ...cached,
                cached: true,
                latency: Date.now() - startTime
            });
        }

        // Build advanced AI prompt
        const prompt = buildAdvancedPrompt({
            round_data,
            pattern_summary,
            hash_history,
            crash_points,
            strategy,
            volatility_index
        });

        // Call Groq AI with voting system
        const predictions = await Promise.allSettled([
            callGroqAI(prompt, 'llama3-70b-8192', 0.3), // Conservative
            callGroqAI(prompt, 'llama3-70b-8192', 0.7), // Balanced
            callGroqAI(prompt, 'llama3-70b-8192', 0.9)  // Aggressive
        ]);

        const successfulPredictions = predictions
            .filter(p => p.status === 'fulfilled')
            .map(p => p.value);

        if (successfulPredictions.length === 0) {
            throw new Error('All AI calls failed');
        }

        // Merge predictions using voting
        const finalPrediction = mergePredictions(successfulPredictions, strategy);
        
        // Cache the result
        aiCache.set(cacheKey, finalPrediction, 300); // 5 minutes

        // Log to Supabase
        await logPrediction(supabase, {
            ...finalPrediction,
            strategy,
            input_data: { crash_points: crash_points.slice(-10) }
        });

        const latency = Date.now() - startTime;
        await logLatency('groq_prediction', latency);

        res.json({
            ...finalPrediction,
            cached: false,
            latency,
            models_used: successfulPredictions.length
        });

    } catch (error) {
        console.error('Prediction Error:', error);
        
        // Fallback prediction
        const fallback = generateFallbackPrediction(req.body.crash_points);
        
        res.status(200).json({
            ...fallback,
            fallback: true,
            error: error.message,
            latency: Date.now() - startTime
        });
    }
});

// Call Groq AI API
async function callGroqAI(prompt, model, temperature) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: 1000,
            top_p: 0.9
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const cleanContent = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanContent);
}

// Merge multiple AI predictions using voting
function mergePredictions(predictions, strategy) {
    if (predictions.length === 1) return predictions[0];

    // Extract prediction values
    const predictionValues = predictions.map(p => 
        parseFloat(p.prediction.replace('x', ''))
    );

    // Calculate merged values based on strategy
    let mergedPrediction;
    if (strategy === 'Conservative') {
        mergedPrediction = Math.min(...predictionValues);
    } else if (strategy === 'Aggressive') {
        mergedPrediction = Math.max(...predictionValues);
    } else {
        // Balanced - use median
        const sorted = predictionValues.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        mergedPrediction = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    // Merge other properties
    const confidenceLevels = { 'Low': 1, 'Medium': 2, 'High': 3, 'EXTREME': 4 };
    const avgConfidence = predictions.reduce((sum, p) => 
        sum + confidenceLevels[p.confidence], 0) / predictions.length;
    
    const confidenceKeys = Object.keys(confidenceLevels);
    const finalConfidence = confidenceKeys[Math.round(avgConfidence) - 1] || 'Medium';

    return {
        prediction: `${mergedPrediction.toFixed(2)}x`,
        confidence: finalConfidence,
        comment: `Merged prediction from ${predictions.length} AI models using ${strategy} strategy`,
        strategy,
        entry_timing: predictions[0].entry_timing,
        risk_level: Math.round(predictions.reduce((sum, p) => sum + p.risk_level, 0) / predictions.length),
        voting_consensus: predictions.length,
        explanation: `AI consensus reached through multi-model voting system`
    };
}

// Generate fallback prediction when AI fails
function generateFallbackPrediction(crashPoints) {
    if (!crashPoints || crashPoints.length === 0) {
        return {
            prediction: '2.15x',
            confidence: 'Low',
            comment: 'Fallback prediction - insufficient data',
            strategy: 'Conservative',
            entry_timing: 'Wait 1-2 rounds',
            risk_level: 3,
            fallback: true
        };
    }

    const recent = crashPoints.slice(-5).map(parseFloat);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    
    return {
        prediction: `${Math.max(1.5, Math.min(avg * 1.1, 10.0)).toFixed(2)}x`,
        confidence: 'Medium',
        comment: 'Mathematical fallback based on recent average',
        strategy: 'Balanced',
        entry_timing: 'Immediate',
        risk_level: 4,
        fallback: true
    };
}

export default router;
