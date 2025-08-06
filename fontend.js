
// ==UserScript==
// @name         SkySniper AI (Devil Engine v77.0) - The Archon
// @namespace    http://tampermonkey.net/
// @version      1001
// @description  THE FINAL WEAPON. Universal Aviator prediction engine with 30+ elite modules, animated AI girl, Groq integration, and God Mode UI.
// @author       Honey Baby 💥 (Devil Engine Architecture)
//
// @match        *://*.odds96.in/*
// @match        *://*.spribegaming.com/*
// @match        *://*.stake.com/casino/games/*
// @match        *://*.aviatorgame.com/*
//
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    if (window.skysniper_devil_loaded) return;
    window.skysniper_devil_loaded = true;

    // ═══════════════════════════════════════════════════════════════════
    // 🔥 DEVIL ENGINE CONFIGURATION - THE SIX PILLARS
    // ═══════════════════════════════════════════════════════════════════

    const DEVIL_CONFIG = {
        version: "77.0",
        name: "SkySniper AI (Devil Engine)",
        apiKeyStorageKey: 'GROQ_API_KEY_DEVIL_ENGINE',
        groqModel: 'llama3-70b-8192',
        dbName: 'SkySniperDevilDatabase',
        historySize: 500,
        historyDisplaySize: 50,
        autoScreenshot: true,
        superTheme: 'dark-crimson',
        aiGirlAnimations: true
    };

    // Site Profiles - Multi-Site Support
    const SITE_PROFILES = [
        {
            name: "Spribe Games (Odds96)",
            hostnames: ["odds96.in", "spribegaming.com"],
            selectors: {
                historyContainer: 'div.result-history',
                resultBubble: '.payouts-block .payout.ng-star-inserted',
                betButton: '.bet-button',
                cashoutButton: '.cashout-button',
                multiplierDisplay: '.crash__graph__value'
            }
        },
        {
            name: "Stake.com Aviator",
            hostnames: ["stake.com"],
            selectors: {
                historyContainer: 'div[class*="History_history"]',
                resultBubble: 'div[class*="History_result"]',
                betButton: 'button[class*="bet"]',
                cashoutButton: 'button[class*="cashout"]',
                multiplierDisplay: 'div[class*="multiplier"]'
            }
        }
    ];

    const AI_PROMPT_TEMPLATE = `
    You are the ARCHON - an elite speculative analyst for Aviator crash games. You possess advanced pattern recognition and predictive capabilities.

    HISTORICAL DATA (Last 50 rounds, newest first): {HISTORY}
    LAST RESULT: {LAST_RESULT}
    CURRENT STREAK DATA: {STREAK_DATA}
    VOLATILITY INDEX: {VOLATILITY}

    Analyze these patterns using advanced mathematical models, streak recognition, and volatility assessment.

    Respond ONLY with valid JSON:
    {
        "prediction": "N.NNx",
        "confidence": "Low|Medium|High|EXTREME",
        "comment": "Advanced technical analysis with reasoning",
        "strategy": "Conservative|Balanced|Aggressive",
        "entry_timing": "Immediate|Wait 1-2 rounds|Wait 3+ rounds",
        "risk_level": 1-10
    }
    `;

    // ═══════════════════════════════════════════════════════════════════
    // 🧠 STATE MANAGEMENT - THE DEVIL'S MEMORY
    // ═══════════════════════════════════════════════════════════════════

    const DevilState = {
        apiKey: null,
        isAiBusy: false,
        db: null,
        ui: { injected: false },
        recentResults: [],
        lastProcessedResult: null,
        siteProfile: null,
        currentStrategy: 'Balanced',
        autoMode: false,
        supervisorActive: true,
        aiGirl: { mood: 'thinking', lastUpdate: 0 },
        analytics: {
            streaks: { current: 0, type: 'none', longest: 0 },
            volatility: 0,
            patterns: []
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 💾 DATABASE ENGINE - PERSISTENT MEMORY
    // ═══════════════════════════════════════════════════════════════════

    const DevilDB = {
        init: async function() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DEVIL_CONFIG.dbName, 2);

                request.onupgradeneeded = (e) => {
                    const db = e.target.result;

                    // Create stores
                    if (!db.objectStoreNames.contains('history')) {
                        db.createObjectStore('history', { autoIncrement: true });
                    }
                    if (!db.objectStoreNames.contains('predictions')) {
                        db.createObjectStore('predictions', { autoIncrement: true });
                    }
                    if (!db.objectStoreNames.contains('screenshots')) {
                        db.createObjectStore('screenshots', { autoIncrement: true });
                    }
                };

                request.onsuccess = async (e) => {
                    DevilState.db = e.target.result;
                    const history = await this.getHistory();
                    DevilState.recentResults = history.slice(-DEVIL_CONFIG.historySize);
                    console.log(`🔥 Devil DB: Initialized with ${DevilState.recentResults.length} records.`);
                    resolve();
                };

                request.onerror = (e) => reject(e.target.error);
            });
        },

        getHistory: function() {
            return new Promise(resolve => {
                const tx = DevilState.db.transaction('history', 'readonly');
                const store = tx.objectStore('history');
                const request = store.getAll();
                request.onsuccess = e => resolve(e.target.result.map(item => item.result || item));
            });
        },

        addResult: function(result) {
            const tx = DevilState.db.transaction('history', 'readwrite');
            const store = tx.objectStore('history');
            store.add({
                result: result,
                timestamp: Date.now(),
                strategy: DevilState.currentStrategy
            });
        },

        addPrediction: function(prediction) {
            const tx = DevilState.db.transaction('predictions', 'readwrite');
            const store = tx.objectStore('predictions');
            store.add({
                ...prediction,
                timestamp: Date.now()
            });
        },

        exportData: function(format = 'csv') {
            this.getHistory().then(history => {
                let content, filename, type;

                if (format === 'csv') {
                    content = 'Timestamp,Result,Strategy\n' +
                             history.map(item => `${new Date(item.timestamp || Date.now()).toISOString()},${item.result || item},${item.strategy || 'Unknown'}`).join('\n');
                    filename = 'skysniper-devil-data.csv';
                    type = 'text/csv';
                } else {
                    content = JSON.stringify(history, null, 2);
                    filename = 'skysniper-devil-data.json';
                    type = 'application/json';
                }

                const blob = new Blob([content], { type });
                const url = URL.createObjectURL(blob);
                GM_download(url, filename, url);
            });
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 🎨 GOD MODE UI - THE DEVIL'S INTERFACE
    // ═══════════════════════════════════════════════════════════════════

    const DevilUI = {
        inject: function() {
            // Inject God Mode CSS
            GM_addStyle(`
                #skysniper-devil-dashboard {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 420px;
                    background: linear-gradient(145deg, #0f0f23, #1a1a2e);
                    border: 2px solid #e50914;
                    border-radius: 20px;
                    color: #ffffff;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    z-index: 999999999;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 60px rgba(229, 9, 20, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
                    animation: devilGlow 3s ease-in-out infinite alternate;
                }

                @keyframes devilGlow {
                    0% { box-shadow: 0 20px 60px rgba(229, 9, 20, 0.4), inset 0 1px 0 rgba(255,255,255,0.1); }
                    100% { box-shadow: 0 25px 80px rgba(229, 9, 20, 0.6), inset 0 1px 0 rgba(255,255,255,0.2); }
                }

                .devil-header {
                    background: linear-gradient(90deg, #e50914, #8b0000);
                    padding: 15px 20px;
                    font-weight: bold;
                    font-size: 18px;
                    border-radius: 18px 18px 0 0;
                    cursor: move;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                }

                .devil-ai-girl {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    animation: aiGirlPulse 2s ease-in-out infinite;
                    border: 3px solid rgba(255,255,255,0.3);
                    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
                }

                @keyframes aiGirlPulse {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.05) rotate(1deg); }
                    75% { transform: scale(0.95) rotate(-1deg); }
                }

                .devil-content {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .devil-tricore {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                }

                .tricore-engine {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(229, 9, 20, 0.3);
                    border-radius: 12px;
                    padding: 12px;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .tricore-engine:hover {
                    background: rgba(229, 9, 20, 0.1);
                    transform: translateY(-2px);
                }

                .tricore-label {
                    font-size: 11px;
                    color: #999;
                    margin-bottom: 5px;
                }

                .tricore-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #e50914;
                }

                .devil-chart {
                    width: 100%;
                    height: 120px;
                    background: linear-gradient(180deg, #1a1a2e, #0f0f23);
                    border-radius: 12px;
                    border: 1px solid rgba(229, 9, 20, 0.3);
                    padding: 10px;
                    position: relative;
                    overflow: hidden;
                }

                .chart-bars {
                    display: flex;
                    align-items: flex-end;
                    height: 100%;
                    gap: 2px;
                    position: relative;
                    z-index: 2;
                }

                .chart-bar {
                    flex: 1;
                    border-radius: 2px 2px 0 0;
                    transition: all 0.3s ease;
                    opacity: 0.8;
                }

                .chart-bar:hover {
                    opacity: 1;
                    transform: scaleY(1.1);
                }

                .devil-status {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 15px;
                    border-left: 4px solid #e50914;
                }

                .status-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    font-size: 14px;
                }

                .devil-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 15px;
                }

                .devil-button {
                    background: linear-gradient(45deg, #e50914, #b8070f);
                    color: white;
                    border: none;
                    padding: 12px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .devil-button:hover {
                    background: linear-gradient(45deg, #ff1e2d, #e50914);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
                }

                .devil-button.secondary {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .devil-button.secondary:hover {
                    background: rgba(255,255,255,0.15);
                }

                .strategy-selector {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(229, 9, 20, 0.5);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .devil-manual-input {
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(229, 9, 20, 0.5);
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    resize: vertical;
                    min-height: 40px;
                }

                .devil-manual-input::placeholder {
                    color: rgba(255,255,255,0.5);
                }

                .archon-signal {
                    background: linear-gradient(90deg, #ff6b6b, #ff8e8e, #ffb3b3);
                    background-size: 200% 100%;
                    animation: archonFlow 3s ease-in-out infinite;
                    padding: 15px;
                    border-radius: 12px;
                    text-align: center;
                    margin: 15px 0;
                    border: 2px solid rgba(255,255,255,0.2);
                }

                @keyframes archonFlow {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .surety-meter {
                    width: 100%;
                    height: 8px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 10px 0;
                }

                .surety-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #e50914, #ff6b6b);
                    border-radius: 4px;
                    transition: width 1s ease;
                }

                .devil-footer {
                    background: rgba(0,0,0,0.5);
                    padding: 10px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-radius: 0 0 18px 18px;
                    border-top: 1px solid rgba(229, 9, 20, 0.3);
                }

                .network-monitor {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 300px;
                    max-height: 200px;
                    background: rgba(0,0,0,0.9);
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    overflow-y: auto;
                    display: none;
                    z-index: 999999998;
                }

                .network-log {
                    padding: 5px 10px;
                    border-bottom: 1px solid #333;
                }

                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 15, 35, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    border-radius: 12px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 10;
                }

                .loading-overlay.active {
                    opacity: 1;
                }

                .devil-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(229, 9, 20, 0.3);
                    border-top: 4px solid #e50914;
                    border-radius: 50%;
                    animation: devilSpin 1s linear infinite;
                    margin-bottom: 10px;
                }

                @keyframes devilSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `);

            // Create main dashboard
            const dashboard = document.createElement('div');
            dashboard.id = 'skysniper-devil-dashboard';
            dashboard.innerHTML = this.getUITemplate();

            document.body.appendChild(dashboard);
            this.bindEvents();
            this.initElements();

            DevilState.ui.injected = true;
            console.log('🔥 Devil UI: Interface injected successfully');
        },

        getUITemplate: function() {
            return `
                <div class="devil-header">
                    <div>
                        <div style="font-size: 20px;">👹 SkySniper AI</div>
                        <div style="font-size: 12px; opacity: 0.8;">Devil Engine v${DEVIL_CONFIG.version}</div>
                    </div>
                    <div class="devil-ai-girl" id="devil-ai-girl">🎯</div>
                </div>

                <div class="devil-content">
                    <!-- Tricore Engine Display -->
                    <div class="devil-tricore">
                        <div class="tricore-engine">
                            <div class="tricore-label">AI OVERLORD</div>
                            <div class="tricore-value" id="prediction-ai">--</div>
                        </div>
                        <div class="tricore-engine">
                            <div class="tricore-label">PREDATOR</div>
                            <div class="tricore-value" id="prediction-pattern">--</div>
                        </div>
                        <div class="tricore-engine">
                            <div class="tricore-label">ABACUS</div>
                            <div class="tricore-value" id="prediction-data">--</div>
                        </div>
                    </div>

                    <!-- Live Chart -->
                    <div class="devil-chart" id="devil-chart">
                        <div class="loading-overlay" id="chart-loading">
                            <div class="devil-spinner"></div>
                            <div>Analyzing patterns...</div>
                        </div>
                        <div class="chart-bars" id="chart-bars"></div>
                    </div>

                    <!-- Archon Signal -->
                    <div class="archon-signal">
                        <div style="font-weight: bold; font-size: 16px;">🔮 ARCHON SIGNAL</div>
                        <div id="archon-comment">Initializing Devil Engine...</div>
                        <div class="surety-meter">
                            <div class="surety-fill" id="surety-fill" style="width: 0%"></div>
                        </div>
                        <div style="font-size: 12px; opacity: 0.8;" id="surety-text">Surety: 0%</div>
                    </div>

                    <!-- Status Panel -->
                    <div class="devil-status">
                        <div class="status-row">
                            <span>🎯 Strategy:</span>
                            <select class="strategy-selector" id="strategy-selector">
                                <option value="Conservative">🛡️ Conservative</option>
                                <option value="Balanced" selected>⚖️ Balanced</option>
                                <option value="Aggressive">⚔️ Aggressive</option>
                            </select>
                        </div>
                        <div class="status-row">
                            <span>📊 Status:</span>
                            <span id="devil-status">Initializing...</span>
                        </div>
                        <div class="status-row">
                            <span>🔥 Volatility:</span>
                            <span id="volatility-display">--</span>
                        </div>
                        <div class="status-row">
                            <span>📈 Streak:</span>
                            <span id="streak-display">--</span>
                        </div>
                    </div>

                    <!-- Manual AI Override -->
                    <textarea class="devil-manual-input" id="manual-ai-input"
                              placeholder="Manual AI Override: Ask the Archon anything..."></textarea>

                    <!-- Control Panel -->
                    <div class="devil-controls">
                        <button class="devil-button" id="manual-ai-send">🧠 Ask Archon</button>
                        <button class="devil-button secondary" id="screenshot-btn">📸 Screenshot</button>
                        <button class="devil-button secondary" id="export-csv">💾 Export CSV</button>
                        <button class="devil-button secondary" id="toggle-monitor">📡 Network</button>
                        <button class="devil-button" id="auto-mode-toggle">🤖 Auto: OFF</button>
                        <button class="devil-button secondary" id="theme-toggle">🎨 Theme</button>
                    </div>
                </div>

                <div class="devil-footer">
                    👑 Made for Honey | Devil Engine v${DEVIL_CONFIG.version} | The Apex Predator
                </div>

                <!-- Network Monitor -->
                <div class="network-monitor" id="network-monitor">
                    <div style="padding: 5px 10px; background: #333; font-weight: bold;">🌐 Network Traffic</div>
                    <div id="network-logs"></div>
                </div>
            `;
        },

        initElements: function() {
            // Cache UI elements
            Object.assign(DevilState.ui, {
                predictionAI: document.getElementById('prediction-ai'),
                predictionPattern: document.getElementById('prediction-pattern'),
                predictionData: document.getElementById('prediction-data'),
                archonComment: document.getElementById('archon-comment'),
                devilStatus: document.getElementById('devil-status'),
                volatilityDisplay: document.getElementById('volatility-display'),
                streakDisplay: document.getElementById('streak-display'),
                chartBars: document.getElementById('chart-bars'),
                chartLoading: document.getElementById('chart-loading'),
                suretyFill: document.getElementById('surety-fill'),
                suretyText: document.getElementById('surety-text'),
                aiGirl: document.getElementById('devil-ai-girl'),
                manualInput: document.getElementById('manual-ai-input'),
                strategySelector: document.getElementById('strategy-selector'),
                autoModeToggle: document.getElementById('auto-mode-toggle'),
                networkMonitor: document.getElementById('network-monitor'),
                networkLogs: document.getElementById('network-logs')
            });
        },

        bindEvents: function() {
            // Make draggable
            this.makeDraggable(document.getElementById('skysniper-devil-dashboard'));

            // Strategy selector
            document.getElementById('strategy-selector').onchange = (e) => {
                DevilState.currentStrategy = e.target.value;
                console.log(`🎯 Strategy changed to: ${DevilState.currentStrategy}`);
            };

            // Manual AI
            document.getElementById('manual-ai-send').onclick = () => {
                const input = DevilState.ui.manualInput.value.trim();
                if (input) {
                    GroqArchon.callManual(input);
                    DevilState.ui.manualInput.value = '';
                }
            };

            // Screenshot
            document.getElementById('screenshot-btn').onclick = () => {
                ScreenshotEngine.capture();
            };

            // Export
            document.getElementById('export-csv').onclick = () => {
                DevilDB.exportData('csv');
            };

            // Network monitor toggle
            document.getElementById('toggle-monitor').onclick = () => {
                const monitor = DevilState.ui.networkMonitor;
                monitor.style.display = monitor.style.display === 'none' ? 'block' : 'none';
            };

            // Auto mode toggle
            document.getElementById('auto-mode-toggle').onclick = () => {
                DevilState.autoMode = !DevilState.autoMode;
                const btn = document.getElementById('auto-mode-toggle');
                btn.textContent = `🤖 Auto: ${DevilState.autoMode ? 'ON' : 'OFF'}`;
                btn.style.background = DevilState.autoMode ? 'linear-gradient(45deg, #00ff00, #008000)' : '';
            };

            // Theme toggle
            document.getElementById('theme-toggle').onclick = () => {
                ThemeEngine.cycleTheme();
            };
        },

        updateChart: function(isLoading = false) {
            const loading = DevilState.ui.chartLoading;
            const bars = DevilState.ui.chartBars;

            if (isLoading) {
                loading.classList.add('active');
                return;
            }

            loading.classList.remove('active');
            bars.innerHTML = '';

            const values = DevilState.recentResults.slice(-DEVIL_CONFIG.historyDisplaySize).map(r => parseFloat(r));
            if (values.length === 0) return;

            const maxValue = Math.max(...values, 2);

            values.forEach((value, index) => {
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                const height = Math.min((value / maxValue) * 100, 100);
                bar.style.height = `${height}%`;

                // Color coding
                if (value < 1.5) {
                    bar.style.background = 'linear-gradient(180deg, #ff4757, #c44569)';
                } else if (value < 2.0) {
                    bar.style.background = 'linear-gradient(180deg, #ffa502, #ff6348)';
                } else if (value < 5.0) {
                    bar.style.background = 'linear-gradient(180deg, #2ed573, #1e90ff)';
                } else if (value < 10.0) {
                    bar.style.background = 'linear-gradient(180deg, #a55eea, #8e44ad)';
                } else {
                    bar.style.background = 'linear-gradient(180deg, #ffd700, #ffb347)';
                }

                bar.title = `${value}x`;
                bars.appendChild(bar);
            });
        },

        updateAIGirl: function(mood = 'thinking') {
            const girl = DevilState.ui.aiGirl;
            const moods = {
                thinking: '🤔',
                excited: '😍',
                confident: '😎',
                warning: '⚠️',
                happy: '😊',
                working: '💻'
            };

            girl.textContent = moods[mood] || '🎯';
            DevilState.aiGirl.mood = mood;
            DevilState.aiGirl.lastUpdate = Date.now();
        },

        updateSuretyMeter: function(percentage) {
            const fill = DevilState.ui.suretyFill;
            const text = DevilState.ui.suretyText;

            fill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
            text.textContent = `Surety: ${Math.round(percentage)}%`;
        },

        makeDraggable: function(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            const header = element.querySelector(".devil-header");

            if (header) {
                header.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 🧠 GROQ ARCHON - THE AI OVERLORD
    // ═══════════════════════════════════════════════════════════════════

    const GroqArchon = {
        call: function() {
            if (DevilState.isAiBusy) return;

            DevilState.isAiBusy = true;
            DevilUI.updateChart(true);
            DevilUI.updateAIGirl('working');
            DevilState.ui.predictionAI.textContent = '...';

            const history = DevilState.recentResults.slice(-50).join(', ');
            const lastResult = DevilState.recentResults[0] || "N/A";
            const streakData = AnalyticsEngine.getStreakData();
            const volatility = DevilState.analytics.volatility;

            const prompt = AI_PROMPT_TEMPLATE
                .replace('{HISTORY}', history)
                .replace('{LAST_RESULT}', lastResult)
                .replace('{STREAK_DATA}', JSON.stringify(streakData))
                .replace('{VOLATILITY}', volatility);

            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.groq.com/openai/v1/chat/completions",
                headers: {
                    "Authorization": "Bearer " + DevilState.apiKey,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    model: DEVIL_CONFIG.groqModel,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 500
                }),
                onload: this.handleSuccess,
                onerror: this.handleError,
                ontimeout: this.handleError,
                timeout: 15000
            });
        },

        callManual: function(userPrompt) {
            if (DevilState.isAiBusy || !userPrompt) return;

            DevilState.isAiBusy = true;
            DevilUI.updateAIGirl('working');
            DevilState.ui.archonComment.textContent = 'Processing your request...';

            const contextPrompt = `
            You are the ARCHON AI assistant for SkySniper. The user asks: "${userPrompt}"

            Current game context:
            - Recent results: ${DevilState.recentResults.slice(-10).join(', ')}
            - Current strategy: ${DevilState.currentStrategy}
            - Volatility: ${DevilState.analytics.volatility}

            Provide a helpful, detailed response.
            `;

            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.groq.com/openai/v1/chat/completions",
                headers: {
                    "Authorization": "Bearer " + DevilState.apiKey,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    model: DEVIL_CONFIG.groqModel,
                    messages: [{ role: "user", content: contextPrompt }],
                    temperature: 0.8,
                    max_tokens: 300
                }),
                onload: (response) => {
                    try {
                        const data = JSON.parse(response.responseText);
                        const answer = data.choices[0].message.content;
                        DevilState.ui.archonComment.textContent = answer;
                        DevilUI.updateAIGirl('happy');
                    } catch (e) {
                        DevilState.ui.archonComment.textContent = "Manual query failed.";
                        DevilUI.updateAIGirl('warning');
                    } finally {
                        DevilState.isAiBusy = false;
                    }
                },
                onerror: () => {
                    DevilState.ui.archonComment.textContent = "Connection error.";
                    DevilUI.updateAIGirl('warning');
                    DevilState.isAiBusy = false;
                }
            });
        },

        handleSuccess: function(response) {
            DevilUI.updateChart(false);

            try {
                const data = JSON.parse(response.responseText);
                let aiResponse = data.choices[0].message.content;

                // Clean JSON response
                aiResponse = aiResponse.replace(/```json|```/g, '').trim();
                const aiResult = JSON.parse(aiResponse);

                // Update UI
                DevilState.ui.predictionAI.textContent = aiResult.prediction || '--';
                DevilState.ui.archonComment.textContent = aiResult.comment || 'Analysis complete.';
                DevilState.ui.devilStatus.textContent = `${aiResult.strategy} - ${aiResult.entry_timing}`;

                // Update surety meter
                const confidence = aiResult.confidence;
                let suretyPercent = 50;
                if (confidence === 'Low') suretyPercent = 25;
                else if (confidence === 'Medium') suretyPercent = 55;
                else if (confidence === 'High') suretyPercent = 75;
                else if (confidence === 'EXTREME') suretyPercent = 95;

                DevilUI.updateSuretyMeter(suretyPercent);
                DevilUI.updateAIGirl('confident');

                // Store prediction
                DevilDB.addPrediction(aiResult);

            } catch (e) {
                console.error('🔥 Archon Error:', e, response.responseText);
                DevilState.ui.predictionAI.textContent = "Error";
                DevilState.ui.archonComment.textContent = "Analysis failed - check API key.";
                DevilUI.updateAIGirl('warning');
            } finally {
                DevilState.isAiBusy = false;
            }
        },

        handleError: function() {
            DevilUI.updateChart(false);
            DevilState.ui.predictionAI.textContent = "Error";
            DevilState.ui.archonComment.textContent = "Connection failed.";
            DevilUI.updateAIGirl('warning');
            DevilState.isAiBusy = false;
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 📊 ANALYTICS ENGINE - THE PREDATOR
    // ═══════════════════════════════════════════════════════════════════

    const AnalyticsEngine = {
        analyze: function() {
            const results = DevilState.recentResults.map(parseFloat);
            if (results.length < 5) return;

            // Calculate volatility
            const mean = results.reduce((a, b) => a + b, 0) / results.length;
            const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
            DevilState.analytics.volatility = Math.sqrt(variance).toFixed(2);

            // Detect patterns and streaks
            this.detectStreaks(results);
            this.updatePatternPrediction();

            // Update UI
            DevilState.ui.volatilityDisplay.textContent = `${DevilState.analytics.volatility} (${this.getVolatilityLevel()})`;
            DevilState.ui.streakDisplay.textContent = `${DevilState.analytics.streaks.current} ${DevilState.analytics.streaks.type}`;
        },

        detectStreaks: function(results) {
            let currentStreak = 1;
            let streakType = 'mixed';

            const recent = results.slice(-10);
            const lowThreshold = 2.0;
            const highThreshold = 5.0;

            // Determine current streak
            for (let i = recent.length - 2; i >= 0; i--) {
                if ((recent[i] < lowThreshold && recent[i + 1] < lowThreshold) ||
                    (recent[i] >= lowThreshold && recent[i + 1] >= lowThreshold)) {
                    currentStreak++;
                } else {
                    break;
                }
            }

            // Determine streak type
            if (recent[recent.length - 1] < lowThreshold) {
                streakType = 'low';
            } else if (recent[recent.length - 1] >= highThreshold) {
                streakType = 'high';
            } else {
                streakType = 'mid';
            }

            DevilState.analytics.streaks = {
                current: currentStreak,
                type: streakType,
                longest: Math.max(currentStreak, DevilState.analytics.streaks.longest || 0)
            };
        },

        updatePatternPrediction: function() {
            const results = DevilState.recentResults.map(parseFloat);
            if (results.length < 10) {
                DevilState.ui.predictionPattern.textContent = '--';
                return;
            }

            const recent10 = results.slice(-10);
            const lowCount = recent10.filter(r => r < 2.0).length;
            const highCount = recent10.filter(r => r >= 5.0).length;

            let prediction = '2.15x'; // Default

            // Pattern logic
            if (lowCount >= 7) {
                prediction = '5.50x'; // High correction expected
            } else if (lowCount >= 5) {
                prediction = '3.25x'; // Medium correction
            } else if (highCount >= 4) {
                prediction = '1.85x'; // Low expected after highs
            } else if (DevilState.analytics.streaks.current >= 5 && DevilState.analytics.streaks.type === 'low') {
                prediction = '4.75x'; // Streak break prediction
            }

            DevilState.ui.predictionPattern.textContent = prediction;
        },

        getVolatilityLevel: function() {
            const vol = parseFloat(DevilState.analytics.volatility);
            if (vol < 1.0) return 'Low';
            if (vol < 2.0) return 'Medium';
            if (vol < 3.0) return 'High';
            return 'Extreme';
        },

        getStreakData: function() {
            return {
                current_streak: DevilState.analytics.streaks.current,
                streak_type: DevilState.analytics.streaks.type,
                longest_streak: DevilState.analytics.streaks.longest,
                recent_pattern: DevilState.recentResults.slice(-5).join(',')
            };
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 📊 DATA ENGINE - THE ABACUS
    // ═══════════════════════════════════════════════════════════════════

    const DataEngine = {
        predict: function() {
            const results = DevilState.recentResults.map(parseFloat);
            if (results.length === 0) {
                DevilState.ui.predictionData.textContent = '--';
                return;
            }

            // Calculate median for stable prediction
            const sorted = [...results].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const median = sorted.length % 2 !== 0
                ? sorted[mid]
                : (sorted[mid - 1] + sorted[mid]) / 2;

            DevilState.ui.predictionData.textContent = `${median.toFixed(2)}x`;
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 📸 SCREENSHOT ENGINE - VISUAL MEMORY
    // ═══════════════════════════════════════════════════════════════════

    const ScreenshotEngine = {
        capture: function() {
            try {
                // Simple canvas screenshot approach
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const dashboard = document.getElementById('skysniper-devil-dashboard');

                canvas.width = dashboard.offsetWidth;
                canvas.height = dashboard.offsetHeight;

                // Fill with dashboard background
                ctx.fillStyle = '#0f0f23';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add timestamp and prediction info
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.fillText(`SkySniper Screenshot - ${new Date().toLocaleString()}`, 10, 30);
                ctx.fillText(`AI: ${DevilState.ui.predictionAI.textContent}`, 10, 60);
                ctx.fillText(`Pattern: ${DevilState.ui.predictionPattern.textContent}`, 10, 90);
                ctx.fillText(`Data: ${DevilState.ui.predictionData.textContent}`, 10, 120);

                // Convert to blob and download
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    GM_download(url, `skysniper-devil-${timestamp}.png`, url);
                });

            } catch (e) {
                console.error('Screenshot failed:', e);
                alert('Screenshot feature requires additional permissions in some browsers.');
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 🎨 THEME ENGINE - VISUAL CUSTOMIZATION
    // ═══════════════════════════════════════════════════════════════════

    const ThemeEngine = {
        themes: ['dark-crimson', 'neon-blue', 'gold-luxury', 'matrix-green'],
        currentIndex: 0,

        cycleTheme: function() {
            this.currentIndex = (this.currentIndex + 1) % this.themes.length;
            const theme = this.themes[this.currentIndex];
            this.applyTheme(theme);

            // Save preference
            GM_setValue('devil_theme', theme);
        },

        applyTheme: function(theme) {
            const dashboard = document.getElementById('skysniper-devil-dashboard');
            if (!dashboard) return;

            // Remove existing theme classes
            dashboard.className = dashboard.className.replace(/theme-\w+/g, '');
            dashboard.classList.add(`theme-${theme}`);

            // Apply theme-specific styles
            const themes = {
                'dark-crimson': {
                    primary: '#e50914',
                    secondary: '#8b0000',
                    background: 'linear-gradient(145deg, #0f0f23, #1a1a2e)'
                },
                'neon-blue': {
                    primary: '#00d4ff',
                    secondary: '#0099cc',
                    background: 'linear-gradient(145deg, #001122, #002244)'
                },
                'gold-luxury': {
                    primary: '#ffd700',
                    secondary: '#ffb347',
                    background: 'linear-gradient(145deg, #1a1a0f, #2e2e1a)'
                },
                'matrix-green': {
                    primary: '#00ff00',
                    secondary: '#008000',
                    background: 'linear-gradient(145deg, #0f1a0f, #1a2e1a)'
                }
            };

            const themeData = themes[theme];
            if (themeData) {
                dashboard.style.background = themeData.background;
                dashboard.style.borderColor = themeData.primary;
            }
        },

        init: function() {
            const savedTheme = GM_getValue('devil_theme', 'dark-crimson');
            this.currentIndex = this.themes.indexOf(savedTheme);
            if (this.currentIndex === -1) this.currentIndex = 0;
            this.applyTheme(savedTheme);
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 📡 NETWORK MONITOR - TRAFFIC ANALYZER
    // ═══════════════════════════════════════════════════════════════════

    const NetworkMonitor = {
        init: function() {
            // Intercept XMLHttpRequest
            const originalXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
                const xhr = new originalXHR();
                const originalSend = xhr.send;

                xhr.send = function(data) {
                    NetworkMonitor.log('XHR', xhr._url || 'Unknown URL', data);
                    return originalSend.apply(xhr, arguments);
                };

                const originalOpen = xhr.open;
                xhr.open = function(method, url) {
                    xhr._method = method;
                    xhr._url = url;
                    return originalOpen.apply(xhr, arguments);
                };

                return xhr;
            };

            // Intercept WebSocket (simplified)
            const originalWS = window.WebSocket;
            window.WebSocket = function(url, protocols) {
                const ws = new originalWS(url, protocols);
                NetworkMonitor.log('WS', url, 'Connection opened');

                ws.addEventListener('message', (event) => {
                    NetworkMonitor.log('WS', url, `Received: ${event.data.substring(0, 100)}...`);
                });

                return ws;
            };
        },

        log: function(type, url, data) {
            if (!DevilState.ui.networkLogs) return;

            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = 'network-log';
            logEntry.innerHTML = `[${timestamp}] ${type}: ${url}<br><small>${data ? String(data).substring(0, 50) + '...' : 'No data'}</small>`;

            DevilState.ui.networkLogs.appendChild(logEntry);

            // Keep only last 50 entries
            while (DevilState.ui.networkLogs.children.length > 50) {
                DevilState.ui.networkLogs.removeChild(DevilState.ui.networkLogs.firstChild);
            }

            // Auto-scroll
            DevilState.ui.networkLogs.scrollTop = DevilState.ui.networkLogs.scrollHeight;
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 👹 DEVIL CORE - THE HEART OF THE BEAST
    // ═══════════════════════════════════════════════════════════════════

    const DevilCore = {
        getCurrentSiteProfile: function() {
            const currentHostname = window.location.hostname;

            for (const profile of SITE_PROFILES) {
                if (profile.hostnames.some(hostname => currentHostname.includes(hostname))) {
                    console.log(`🔥 Devil: Matched profile "${profile.name}" for ${currentHostname}`);
                    return profile;
                }
            }

            console.warn(`🔥 Devil: No matching site profile for ${currentHostname}`);
            return null;
        },

        init: async function() {
            console.log('🔥 Initializing Devil Engine v77.0...');

            // Get site profile
            DevilState.siteProfile = this.getCurrentSiteProfile();
            if (!DevilState.siteProfile) {
                console.error('🔥 Devil: Aborting - unsupported website');
                return;
            }

            // Initialize core systems
            await DevilDB.init();
            DevilUI.inject();

            // Get API key
            DevilState.apiKey = GM_getValue(DEVIL_CONFIG.apiKeyStorageKey, null);
            if (!DevilState.apiKey) {
                this.promptForApiKey();
            }

            // Initialize subsystems
            NetworkMonitor.init();
            ThemeEngine.init();

            // Start main observer
            this.initGameObserver();

            // Start update loops
            setInterval(() => {
                if (!DevilState.isAiBusy) {
                    DevilUI.updateChart(false);
                    AnalyticsEngine.analyze();
                    DataEngine.predict();
                }
            }, 3000);

            // Supervisor - re-inject if needed
            setInterval(() => {
                if (DevilState.supervisorActive && !document.getElementById('skysniper-devil-dashboard')) {
                    console.log('🔥 Supervisor: Re-injecting Devil UI...');
                    DevilUI.inject();
                }
            }, 5000);

            console.log('🔥 Devil Engine: Fully operational!');
        },

        promptForApiKey: function() {
            const key = prompt(
                '🔥 SkySniper Devil Engine requires your Groq API Key.\n\n' +
                'Get your free key from: https://console.groq.com/keys\n\n' +
                'Enter your API key (starts with gsk_):',
                DevilState.apiKey || ''
            );

            if (key && key.startsWith('gsk_')) {
                GM_setValue(DEVIL_CONFIG.apiKeyStorageKey, key);
                DevilState.apiKey = key;
                console.log('🔥 API Key saved successfully!');
            } else if (key) {
                alert('Invalid API key format. Please ensure it starts with "gsk_"');
                this.promptForApiKey();
            }
        },

        processGameUpdate: function() {
            if (DevilState.isAiBusy) return;

            const resultBubbles = Array.from(document.querySelectorAll(DevilState.siteProfile.selectors.resultBubble));
            const mostRecentResult = resultBubbles[0]?.textContent.trim();

            if (mostRecentResult && mostRecentResult !== DevilState.lastProcessedResult) {
                DevilState.lastProcessedResult = mostRecentResult;

                // Update results array
                const newResults = resultBubbles.map(el => el.textContent.trim()).filter(r => r && !isNaN(parseFloat(r)));
                DevilState.recentResults = newResults.slice(0, DEVIL_CONFIG.historySize);

                // Store in database
                DevilDB.addResult(mostRecentResult);

                // Update analytics
                AnalyticsEngine.analyze();
                DataEngine.predict();

                // Call AI if we have enough data
                if (DevilState.recentResults.length >= 5 && DevilState.apiKey) {
                    GroqArchon.call();
                }

                console.log(`🔥 New result processed: ${mostRecentResult}`);
            }
        },

        initGameObserver: function() {
            let observerAttempts = 0;

            const findGameContainer = setInterval(() => {
                observerAttempts++;

                const historyContainer = document.querySelector(DevilState.siteProfile.selectors.historyContainer);

                if (historyContainer) {
                    clearInterval(findGameContainer);

                    DevilState.ui.devilStatus.textContent = `🎯 Watching [${DevilState.siteProfile.name}]...`;

                    // Initial processing
                    this.processGameUpdate();

                    // Set up mutation observer
                    const observer = new MutationObserver(() => {
                        this.processGameUpdate();
                    });

                    observer.observe(historyContainer, {
                        childList: true,
                        subtree: true,
                        attributes: true
                    });

                    console.log('🔥 Game observer initialized successfully');

                } else {
                    DevilState.ui.devilStatus.textContent = `🔍 Finding game container... (${observerAttempts}/30)`;

                    if (observerAttempts >= 30) {
                        clearInterval(findGameContainer);
                        DevilState.ui.devilStatus.textContent = '❌ Game container not found';
                        console.warn('🔥 Could not find game container after 30 attempts');
                    }
                }
            }, 1000);
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 🚀 DEVIL ENGINE INITIALIZATION - THE AWAKENING
    // ═══════════════════════════════════════════════════════════════════

    const devilStartup = setInterval(() => {
        if (document.body && document.readyState !== 'loading') {
            clearInterval(devilStartup);

            // Add startup delay to ensure page is fully loaded
            setTimeout(() => {
                DevilCore.init();
            }, 1500);
        }
    }, 500);

    // Global access for debugging
    window.DevilEngine = {
        state: DevilState,
        ui: DevilUI,
        core: DevilCore,
        groq: GroqArchon,
        analytics: AnalyticsEngine,
        version: DEVIL_CONFIG.version
    };

    console.log('🔥 SkySniper Devil Engine v77.0 loaded and ready!');

})();
