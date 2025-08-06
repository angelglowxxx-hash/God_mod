# SkySniper — Odds96 Aviator Sniper Toolkit

[![Version](https://img.shields.io/badge/version-4.0.0-red.svg)](https://github.com/honeybaby/sky-sniper)  
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)  
[![Mobile Ready](https://img.shields.io/badge/mobile-ready-green.svg)](https://github.com/honeybaby/sky-sniper)  
[![AI Powered](https://img.shields.io/badge/AI-powered-orange.svg)](https://github.com/honeybaby/sky-sniper)

SkySniper is a premium browser extension for Odds96 Aviator, built by **Honey Baby** and powered by **angelglowxxx-hash**. It combines real-time crash analytics, AI-driven predictions, provably-fair hash verification, pattern scanning, auto-cashout, and Supabase sync—all wrapped in a slick black-red-white UI.

---

## 🔥 Features

- 🧠 AI prediction engine (OpenRouter + pattern analysis)  
- 🔐 Provably fair hash decoding via backend `/decode`  
- 📊 Pattern scanner with safe/unsafe tagging  
- 🛑 Auto cashout HUD overlay with configurable threshold  
- ☁️ Supabase sync via `/syncRound` endpoint  
- 🛰️ Backend health check via `/status`  
- 🖥️ Popup dashboard with round insights  
- 🧩 Floating HUD overlay with live multiplier + AI prediction  
- 🎯 Keyboard shortcuts for toggle and popup  
- 📲 Mobile-ready for Kiwi & Yandex browsers

---

## 🧱 Installation

1. Clone this repo or [Download ZIP](https://github.com/honeybaby/sky-sniper)  
2. Open Chrome or Kiwi → `chrome://extensions`  
3. Enable **Developer Mode**  
4. Click “Load unpacked” → Select folder  
5. Start Aviator game on [Odds96](https://odds96.in/en/casino/game/3838-aviator)  
6. Click extension icon → Access SkySniper popup

---

## 🚀 Usage

1. Navigate to an Odds96 Aviator game page  
2. Click the SkySniper icon or press `Ctrl+Shift+P` to open the dashboard  
3. View:
   - 🆔 Round ID, hash, pattern, and decoded result  
   - 🔮 AI prediction + safety tag  
   - 🚀 Suggested safe exit multiplier  
   - 🛰️ Backend status and synced rounds  
4. Press `Ctrl+Shift+S` to toggle the floating HUD overlay

---

## 🌐 API Setup (Optional)

This extension connects to:

- 🧠 **AI Model API** → via OpenRouter (`utils/aiPredictor.js`)  
- 🔐 **Hash Decode API** → via Render backend (`utils/hashVerifier.js`)  
- ☁️ **Supabase Sync** → via `triggerCloudSync()` in `dbHandler.js`

You can self-host these or use default endpoints provided by **angelglowxxx-hash**.

---

## 📲 Mobile Compatibility

Works seamlessly in:

- ✅ **Kiwi Browser** (Android)  
- ✅ **Yandex Browser** (Android)

Just unzip → Load via `chrome://extensions` → Enable → Sniper ready 💥

---

## 🧪 Developer Tips

- Use DevTools → Network → WebSocket tab to inspect live game data  
- Customize UI via `popup.css` and `sniperOverlay.js`  
- Debug Supabase sync via `Application → Storage → IndexedDB`  
- Add new modules in `utils/` and wire them via `background.js`

---

## 🖼️ Screenshots

### Popup Dashboard

![Popup Screenshot](assets/screenshots/popup.png)

### Floating HUD Overlay

![HUD Overlay](assets/screenshots/hud.gif)

---

## 🧙‍♂️ Credits & Ownership

Built with love by **Honey Baby** 💻  
Backend powered by **angelglowxxx-hash** 🔐  
Game target: [Odds96 Aviator](https://odds96.in/en/casino/game/3838-aviator)  
Inspired by open-source intelligence + zero-day imagination 🔥

---

## 📜 License

MIT License — use, remix, fork, but always respect the builder 👑
