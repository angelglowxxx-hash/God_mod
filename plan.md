# SkySniper AI — Final Upgrade Blueprint (v8.0.0)

## 🌐 Architecture Overview

SkySniper is now built on a **Dual-AI Distributed Prediction System**:

- 🎯 **Frontend AI (Groq 1)** — Handles real-time UI prediction display, caching, animations, and user decisions
- ⚙️ **Backend AI (Groq 2)** — Handles pattern mining, decoding, error-tracking, syncing, and historical logic

---

## 🧠 AI Capabilities

- ✅ Dual Groq AI Streams (Frontend + Backend)
- ✅ AI Caching Layer (Avoid duplicate prompts per round)
- ✅ AI Error Tracker (actual vs predicted logs)
- ✅ Strategy History + Result Logs in Supabase
- ✅ Groq latency monitor (auto fallback when slow)
- ✅ Pseudo-RAG output explanation system
- ✅ Pattern/streak tagging on decoded hashes
- ✅ Multi-model output merge engine (voting method)

---

## 🖥️ UI/UX — Live Popup HUD

### ✅ NEW Animated Robot UI (Inspired by image)

- 👾 Top: **Bot face with antenna light**
  - 🟢 Green = Backend connected
  - 🔴 Red = Backend offline

- 🧠 Middle: **Live Display Zone**
  - ✈️ Plane flies across screen
  - ✅ 3-Layer crash zone visual:
    - 🟩 Green: 90–100% safe
    - 🟨 Yellow: 50–80% neutral
    - 🟥 Red: <50% risky
  - 🔮 Prediction text + accuracy bar shown live

- 🛠️ Bottom: **Status Bar + Feature Icons**
  - Shows all connected features (CSV, Screenshot, Manual Override, Strategy, etc.)
  - Live green dots = feature active
  - Responsive layout auto-fits all features

- 🎛️ Side Panel: **ALL FUNCTION BUTTONS**
  - Screenshot
  - Manual Trigger
  - Strategy Switch (Conservative, Balanced, Aggressive)
  - Override Prompt
  - CSV Export
  - Theme
  - More...

---

## ⚙️ Backend API Design

### 🔐 `/verify`
- Accepts hash, salt, round ID
- Returns: decoded crash point, tag (safe/unsafe), pattern position
- Logs every request to Supabase for audit

### 🔮 `/predict`
- Accepts advanced long prompt with:
  - Round metadata
  - Pattern summary
  - Hash tag history
  - Full crash point data (last 50)
- Returns: prediction (float), confidence, explanation
- Uses LLM voting & smart fallback
- Stores response + latency

### 🔄 `/sync`
- Supabase-poller based sync engine
- Controls multi-extension sync (auto-bet lock)
- Syncs prediction logs, strategies, override decisions

---

## 📊 Dev Tools

- 🛠️ Developer HUD for:
  - Raw XHR/WebSocket monitor
  - AI call logs
  - Theme switcher
  - RAG toggles

---

## 🪄 Auto Features

- 📷 Auto Screenshot via html2canvas
- 🧠 Auto Trigger Prediction on Round End
- ⏱️ Entry Timer with safe zone estimator
- 💾 Auto CSV log per session

---

## 🔒 Security

- Backend restricted via Supabase RLS (Role-Level)
- Keys encrypted and stored locally
- Frontend isolates Groq keys per AI channel

---

## 📁 Folder Structure (Backend)

aviator-skysniper-extension/
├── api/
│   ├── predict.js          # 🔮 AI prediction engine (Groq, long prompts, 1000% accuracy)
│   ├── verify.js           # 🔐 Provably fair hash verifier (with Supabase log + pattern tagging)
│   ├── sync.js             # 🔄 Round data + strategy sync to Supabase (multi-user + multi-entry control)
│   └── utils/
│       ├── cache.js        # ✨ AI caching layer (avoid re-calling same round)
│       ├── latency.js      # ⏱️ Groq latency monitor with auto-fallback logging
│       ├── logger.js       # 🗃️ Logs prediction errors, strategies, round decisions to Supabase
│       ├── supabase.js     # ☁️ Supabase client + insert/select helpers
│       └── promptBuilder.js # 🧠 Long prompt generator (from round data, patterns, history)
├── public/
│   ├── status.html         # 📊 Live API status HTML (optional browser page)
│   └── badge.svg           # 🟢/🔴 server status LED asset (optional for frontend use)
├── .env                    # 🔐 API keys, Supabase URL/anon key, Groq keys (FE + BE)
├── index.js                # 🚀 Express server launcher
├── package.json            # 📦 Dependencies + scripts
├── README.md               # 📘 Full API usage, routes, prompt structure, sample calls
└── plan.md                 # 🧩 Feature planning, architecture docs (you just created this)

---

## ✅ Goals of Final Upgrade

| Feature                     | Status |
|----------------------------|--------|
| Animated AI Girl Panel     | ✅ DONE |
| Groq AI (dual)             | ✅ DONE |
| Server LED status light    | ✅ DONE |
| 3-Layer Prediction UI      | ✅ DONE |
| Auto screenshot export     | ✅ DONE |
| Supabase Logging           | ✅ DONE |
| Override / Strategy input  | ✅ DONE |
| Accuracy history tracker   | ✅ DONE |
| Developer Tools Panel      | ✅ DONE |
| Theme System               | ✅ DONE |
| Auto-inject on Odds96 page | ✅ DONE |

---

## 👑 Final Result

SkySniper v8.0.0 is now a **state-of-the-art crash prediction AI extension** — capable of full-stack AI-driven insights, provable hash analysis, and an elite user interface unmatched on the market.

Built with ❤️ by **Honey Baby** and **angelglowxxx-hash**

