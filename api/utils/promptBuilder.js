
export function buildAdvancedPrompt({
    round_data,
    pattern_summary,
    hash_history,
    crash_points,
    strategy = 'Balanced',
    volatility_index = 0
}) {
    const recentPoints = crash_points.slice(-50);
    const last10 = crash_points.slice(-10);
    const last5 = crash_points.slice(-5);
    
    // Calculate analytics
    const analytics = calculateAnalytics(recentPoints);
    const patterns = detectPatterns(recentPoints);
    const streaks = analyzeStreaks(recentPoints);
    
    return `
# SKYSNIPER AI ARCHON - ULTIMATE PREDICTION ENGINE

You are the ARCHON, an elite AI prediction system for Aviator crash games with access to advanced pattern recognition, mathematical modeling, and multi-dimensional analysis capabilities.

## MISSION PARAMETERS
- **Strategy Mode**: ${strategy}
- **Volatility Index**: ${volatility_index}
- **Data Quality**: ${recentPoints.length} crash points available
- **Analysis Depth**: Maximum precision required

## HISTORICAL CRASH DATA (Most Recent First)
**Last 50 Rounds**: [${recentPoints.join(', ')}]
**Last 10 Rounds**: [${last10.join(', ')}]
**Last 5 Rounds**: [${last5.join(', ')}]

## ADVANCED ANALYTICS
**Statistical Metrics**:
- Mean: ${analytics.mean.toFixed(3)}x
- Median: ${analytics.median.toFixed(3)}x
- Standard Deviation: ${analytics.stdDev.toFixed(3)}
- Variance: ${analytics.variance.toFixed(3)}
- Skewness: ${analytics.skewness.toFixed(3)}
- Kurtosis: ${analytics.kurtosis.toFixed(3)}

**Distribution Analysis**:
- Low crashes (<2.0x): ${analytics.lowCount} (${(analytics.lowPercentage).toFixed(1)}%)
- Medium crashes (2.0x-5.0x): ${analytics.mediumCount} (${(analytics.mediumPercentage).toFixed(1)}%)
- High crashes (>5.0x): ${analytics.highCount} (${(analytics.highPercentage).toFixed(1)}%)

**Volatility Indicators**:
- Recent volatility: ${analytics.recentVolatility.toFixed(3)}
- Trend direction: ${analytics.trendDirection}
- Momentum: ${analytics.momentum.toFixed(3)}

## PATTERN RECOGNITION
**Detected Patterns**:
${patterns.map(p => `- ${p.type}: ${p.description} (Confidence: ${p.confidence})`).join('\n')}

**Streak Analysis**:
- Current streak: ${streaks.current.count} ${streaks.current.type} rounds
- Longest streak: ${streaks.longest.count} ${streaks.longest.type} rounds
- Streak probability: ${streaks.breakProbability.toFixed(1)}%

**Cycle Analysis**:
- Pattern cycle: ${patterns.length > 0 ? patterns[0].cycle : 'No clear cycle'}
- Correction probability: ${analytics.correctionProbability.toFixed(1)}%

## STRATEGY-SPECIFIC INSTRUCTIONS

${getStrategyInstructions(strategy)}

## MATHEMATICAL MODELS
Apply these advanced prediction models:

1. **Harmonic Mean Reversion**: ${analytics.harmonicMean.toFixed(3)}x
2. **Fibonacci Retracement**: ${analytics.fibonacciLevel.toFixed(3)}x
3. **Bollinger Band Prediction**: ${analytics.bollingerPrediction.toFixed(3)}x
4. **Monte Carlo Simulation**: ${analytics.monteCarloResult.toFixed(3)}x
5. **Neural Network Weights**: Consider recent pattern weights

## RISK ASSESSMENT MATRIX
- **Market Condition**: ${analytics.marketCondition}
- **Entry Risk**: ${analytics.entryRisk}/10
- **Volatility Risk**: ${volatility_index}/10
- **Pattern Reliability**: ${analytics.patternReliability}/10

## OUTPUT REQUIREMENTS
Respond with EXACTLY this JSON format (no additional text):

{
    "prediction": "X.XXx",
    "confidence": "Low|Medium|High|EXTREME",
    "comment": "Advanced technical analysis with specific reasoning (max 150 chars)",
    "strategy": "${strategy}",
    "entry_timing": "Immediate|Wait 1-2 rounds|Wait 3+ rounds",
    "risk_level": 1-10,
    "pattern_signal": "bullish|bearish|neutral",
    "mathematical_basis": "Primary model used for prediction",
    "streak_factor": "How current streak affects prediction",
    "volatility_adjustment": "How volatility influenced the prediction"
}

## ARCHON DIRECTIVES
1. **Precision**: Use all available mathematical models
2. **Adaptation**: Adjust for current market conditions
3. **Risk Management**: Factor in strategy-specific risk tolerance
4. **Pattern Recognition**: Weight recent patterns heavily
5. **Streak Analysis**: Consider streak break probability
6. **Volatility Compensation**: Adjust for market volatility

Execute prediction with maximum computational power and analytical depth.
    `.trim();
}

function calculateAnalytics(crashPoints) {
    const points = crashPoints.map(parseFloat);
    const n = points.length;
    
    // Basic statistics
    const mean = points.reduce((a, b) => a + b, 0) / n;
    const sortedPoints = [...points].sort((a, b) => a - b);
    const median = n % 2 === 0 
        ? (sortedPoints[n/2 - 1] + sortedPoints[n/2]) / 2 
        : sortedPoints[Math.floor(n/2)];
    
    // Variance and standard deviation
    const variance = points.reduce((sum, point) => sum + Math.pow(point - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Skewness and kurtosis
    const skewness = points.reduce((sum, point) => sum + Math.pow((point - mean) / stdDev, 3), 0) / n;
    const kurtosis = points.reduce((sum, point) => sum + Math.pow((point - mean) / stdDev, 4), 0) / n - 3;
    
    // Distribution counts
    const lowCount = points.filter(p => p < 2.0).length;
    const mediumCount = points.filter(p => p >= 2.0 && p <= 5.0).length;
    const highCount = points.filter(p => p > 5.0).length;
    
    // Recent volatility (last 10 points)
    const recent10 = points.slice(-10);
    const recentMean = recent10.reduce((a, b) => a + b, 0) / recent10.length;
    const recentVolatility = Math.sqrt(recent10.reduce((sum, p) => sum + Math.pow(p - recentMean, 2), 0) / recent10.length);
    
    // Trend analysis
    const first5 = points.slice(0, 5);
    const last5 = points.slice(-5);
    const firstAvg = first5.reduce((a, b) => a + b, 0) / 5;
    const lastAvg = last5.reduce((a, b) => a + b, 0) / 5;
    const trendDirection = lastAvg > firstAvg ? 'upward' : lastAvg < firstAvg ? 'downward' : 'stable';
    const momentum = (lastAvg - firstAvg) / firstAvg;
    
    // Advanced calculations
    const harmonicMean = n / points.reduce((sum, p) => sum + 1/p, 0);
    const fibonacciLevel = mean * 1.618; // Golden ratio
    const bollingerUpper = mean + (2 * stdDev);
    const bollingerLower = mean - (2 * stdDev);
    const bollingerPrediction = (bollingerUpper + bollingerLower) / 2;
    
    // Monte Carlo simulation (simplified)
    const monteCarloResult = simulateMonteCarlo(points);
    
    // Market condition assessment
    let marketCondition = 'stable';
    if (recentVolatility > stdDev * 1.5) marketCondition = 'volatile';
    else if (recentVolatility < stdDev * 0.5) marketCondition = 'calm';
    
    // Risk assessments
    const entryRisk = Math.min(10, Math.max(1, Math.round(recentVolatility * 3)));
    const patternReliability = Math.max(1, Math.min(10, Math.round(10 - (stdDev * 2))));
    const correctionProbability = lowCount > points.length * 0.6 ? 80 : 
                                  highCount > points.length * 0.3 ? 70 : 50;
    
    return {
        mean,
        median,
        variance,
        stdDev,
        skewness,
        kurtosis,
        lowCount,
        mediumCount,
        highCount,
        lowPercentage: (lowCount / n) * 100,
        mediumPercentage: (mediumCount / n) * 100,
        highPercentage: (highCount / n) * 100,
        recentVolatility,
        trendDirection,
        momentum,
        harmonicMean,
        fibonacciLevel,
        bollingerPrediction,
        monteCarloResult,
        marketCondition,
        entryRisk,
        patternReliability,
        correctionProbability
    };
}

function detectPatterns(crashPoints) {
    const patterns = [];
    const points = crashPoints.map(parseFloat);
    
    // Detect alternating patterns
    let alternatingCount = 0;
    for (let i = 1; i < points.length - 1; i++) {
        if ((points[i-1] < 2 && points[i] >= 2 && points[i+1] < 2) ||
            (points[i-1] >= 2 && points[i] < 2 && points[i+1] >= 2)) {
            alternatingCount++;
        }
    }
    
    if (alternatingCount >= 3) {
        patterns.push({
            type: 'Alternating',
            description: `High-Low alternating pattern detected`,
            confidence: Math.min(95, alternatingCount * 15),
            cycle: 2
        });
    }
    
    // Detect ascending/descending patterns
    let ascendingCount = 0;
    let descendingCount = 0;
    
    for (let i = 1; i < points.length; i++) {
        if (points[i] > points[i-1]) ascendingCount++;
        if (points[i] < points[i-1]) descendingCount++;
    }
    
    if (ascendingCount > points.length * 0.7) {
        patterns.push({
            type: 'Ascending',
            description: 'Strong upward trend detected',
            confidence: Math.round((ascendingCount / points.length) * 100),
            cycle: 'trend'
        });
    }
    
    if (descendingCount > points.length * 0.7) {
        patterns.push({
            type: 'Descending',
            description: 'Strong downward trend detected',
            confidence: Math.round((descendingCount / points.length) * 100),
            cycle: 'trend'
        });
    }
    
    // Detect clustering patterns
    const clusters = findClusters(points);
    if (clusters.length > 1) {
        patterns.push({
            type: 'Clustering',
            description: `${clusters.length} distinct value clusters identified`,
            confidence: 75,
            cycle: clusters.length
        });
    }
    
    return patterns;
}

function analyzeStreaks(crashPoints) {
    const points = crashPoints.map(parseFloat);
    let currentStreak = { count: 1, type: 'unknown' };
    let longestStreak = { count: 0, type: 'unknown' };
    
    if (points.length === 0) return { current: currentStreak, longest: longestStreak, breakProbability: 50 };
    
    // Determine current streak
    const lastPoint = points[points.length - 1];
    const isLow = lastPoint < 2.0;
    const streakType = isLow ? 'low' : 'high';
    
    // Count current streak
    for (let i = points.length - 2; i >= 0; i--) {
        const pointIsLow = points[i] < 2.0;
        if (pointIsLow === isLow) {
            currentStreak.count++;
        } else {
            break;
        }
    }
    currentStreak.type = streakType;
    
    // Find longest streak in history
    let tempStreak = 1;
    let tempType = points[0] < 2.0 ? 'low' : 'high';
    
    for (let i = 1; i < points.length; i++) {
        const currentIsLow = points[i] < 2.0;
        const currentType = currentIsLow ? 'low' : 'high';
        
        if (currentType === tempType) {
            tempStreak++;
        } else {
            if (tempStreak > longestStreak.count) {
                longestStreak = { count: tempStreak, type: tempType };
            }
            tempStreak = 1;
            tempType = currentType;
        }
    }
    
    // Check final streak
    if (tempStreak > longestStreak.count) {
        longestStreak = { count: tempStreak, type: tempType };
    }
    
    // Calculate break probability based on streak length
    let breakProbability = 50; // Base probability
    if (currentStreak.count >= 3) {
        breakProbability = Math.min(90, 50 + (currentStreak.count * 8));
    }
    
    return {
        current: currentStreak,
        longest: longestStreak,
        breakProbability
    };
}

function findClusters(points) {
    const clusters = [];
    const tolerance = 0.5;
    
    points.forEach(point => {
        let foundCluster = false;
        
        for (let cluster of clusters) {
            if (Math.abs(cluster.center - point) <= tolerance) {
                cluster.points.push(point);
                cluster.center = cluster.points.reduce((a, b) => a + b, 0) / cluster.points.length;
                foundCluster = true;
                break;
            }
        }
        
        if (!foundCluster) {
            clusters.push({
                center: point,
                points: [point]
            });
        }
    });
    
    return clusters.filter(c => c.points.length >= 3);
}

function simulateMonteCarlo(points) {
    const simulations = 1000;
    const results = [];
    
    for (let i = 0; i < simulations; i++) {
        // Simple Monte Carlo: randomly sample from historical data with some variation
        const randomPoint = points[Math.floor(Math.random() * points.length)];
        const variation = (Math.random() - 0.5) * 0.5; // ±25% variation
        results.push(Math.max(1.0, randomPoint * (1 + variation)));
    }
    
    return results.reduce((a, b) => a + b, 0) / results.length;
}

function getStrategyInstructions(strategy) {
    switch (strategy) {
        case 'Conservative':
            return `
**CONSERVATIVE STRATEGY PARAMETERS**:
- Prioritize safety and risk minimization
- Favor predictions in 1.5x - 3.0x range
- High confidence threshold required
- Prefer "Wait" entry timing for uncertain conditions
- Risk level should not exceed 5/10
- Focus on pattern reliability over potential gains
            `;
        case 'Aggressive':
            return `
**AGGRESSIVE STRATEGY PARAMETERS**:
- Maximize potential returns
- Consider higher crash point predictions (3x+)
- Accept higher risk levels (6-9/10)
- Favor "Immediate" entry timing
- Exploit streak break opportunities
- Weight momentum and volatility heavily
            `;
        default:
            return `
**BALANCED STRATEGY PARAMETERS**:
- Balance risk and reward optimization
- Target 2.0x - 5.0x prediction range
- Moderate confidence and risk levels
- Adaptive entry timing based on conditions
- Consider both safety and opportunity
- Integrate multiple analytical approaches
            `;
    }
}
