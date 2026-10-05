# KryptoPulse Standalone Production Deployment Guide

KryptoPulse is a fully independent, production-grade cryptocurrency analytics and AI intelligence web application. It operates completely self-contained without any dependency on Google AI Studio, preview sessions, or workspace environments.

---

## 1. Architecture Overview

### Traditional Server Hosting (Render / Railway / Docker / VPS):
```
User Web Browser
       │
       ▼ (HTTPS)
Production Express Server (Port 3000 / Environment PORT)
  ├── Static Frontend Files (Vite SPA compiled to /dist)
  ├── API Layer (/api/currencies, /api/crypto/markets, /api/crypto/overview, /api/chat)
  └── Services:
       ├── Resilient Multi-Provider Crypto Engine (CoinGecko + Binance Live 24hr Tickers)
       └── Provider-Independent AI Service (Google Gemini / OpenAI / Custom Provider)
```

### Serverless Hosting (Vercel):
```
User Web Browser
       │
       ├──────────────────────────────────────────────┐
       ▼ (Static HTML/JS/CSS CDN)                     ▼ (API Requests /api/*)
Vercel Edge Network (/dist)                    Vercel Serverless Functions (/api/*)
  ├── Single Page App Navigation                 ├── /api/crypto/markets
  └── Fallback Public Resilience                 ├── /api/crypto/history/[coinId]
                                                 ├── /api/crypto/technical/[coinId]
                                                 ├── /api/crypto/overview
                                                 ├── /api/currencies
                                                 └── /api/chat
                                                       │
                                                       ▼
                                         External Upstream Data Feeds
                                         ├── CoinGecko API (with key header)
                                         ├── Binance 24hr Ticker API
                                         └── Google Gemini AI API
```

---

## 2. Environment Variables

Create a `.env` file in the root directory for local runs, or set these in your cloud provider's dashboard:

```bash
# ----------------------------------------------------------------------
# AI Provider Configuration
# ----------------------------------------------------------------------
# AI_PROVIDER: 'gemini' (default) or 'openai' / 'openai-compatible'
AI_PROVIDER="gemini"

# GEMINI_API_KEY or AI_API_KEY: Your production API Key
GEMINI_API_KEY="your_api_key_here"
AI_API_KEY="your_api_key_here"

# AI_MODEL: Model to use for analysis (default: gemini-2.5-flash)
AI_MODEL="gemini-2.5-flash"

# ----------------------------------------------------------------------
# Cryptocurrency Market Data Configuration (Optional)
# ----------------------------------------------------------------------
# Optional CoinGecko API Key. If omitted, multi-provider engine automatically
# uses Binance and public feeds with dynamic currency conversion.
CRYPTO_API_KEY=""
COINGECKO_API_KEY=""

# ----------------------------------------------------------------------
# Server & Runtime Configuration
# ----------------------------------------------------------------------
PORT=3000
NODE_ENV=production
```

---

## 3. Deploying to Vercel (Step-by-Step)

### Why "No Sync" Happened on Vercel Previously:
1. **Missing Serverless Functions**: Vercel does not execute `server.ts`. When a Vite SPA was deployed, Vercel only served the static `dist/` bundle. Calls to `/api/crypto/markets` returned `404 Not Found`.
2. **CoinGecko Cloud IP Throttling**: CoinGecko's free tier rate-limits or blocks AWS Lambda/Vercel shared outbound IPs with HTTP 429/403.
3. **SPA Route Rewrites**: Refreshing on routes like `/dashboard` or `/charts` without `vercel.json` rewrites returned 404.

### How KryptoPulse Fixes This for Vercel:
1. **Dedicated `/api` Serverless Functions**: Individual Vercel TypeScript functions exist in `/api/crypto/markets.ts`, `/api/crypto/history/[coinId].ts`, `/api/crypto/technical/[coinId].ts`, `/api/crypto/overview.ts`, `/api/currencies.ts`, and `/api/chat.ts`.
2. **`vercel.json` Routing Configuration**: Automatically routes `/api/*` to the serverless functions while rewriting all SPA paths (`/dashboard`, `/history`, `/charts`, etc.) to `/index.html`.
3. **Multi-Provider Data Aggregation**: The backend queries CoinGecko with API key headers if provided, and falls back to Binance 24hr real-time tickers and live currency conversion. Real live data is guaranteed without rate limits.
4. **Client-Side Resilient Fallback**: Even in the event of upstream network latency, `src/services/api.ts` features automatic retries and direct public market synchronization.

### Deploying to Vercel:
1. Push your repository to **GitHub**.
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel automatically detects **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `AI_API_KEY` (or `GEMINI_API_KEY`): Your Gemini API key.
   - `AI_MODEL`: `gemini-2.5-flash`
   - `NODE_ENV`: `production`
   - *(Optional)* `CRYPTO_API_KEY`: If you have a CoinGecko Demo or Pro key.
6. Click **Deploy**.
7. Once deployed, open your live Vercel URL. All market telemetry, charts, comparisons, and the AI assistant will synchronize immediately with live prices in INR!

---

## 4. Deploying to Other Platforms

### A. Deploy to Render
1. In Render Dashboard, click **New > Web Service** and connect your repository (or use `render.yaml`).
2. Build Command: `npm install && npm run build`
3. Start Command: `tsx server.ts`
4. Set `NODE_ENV=production`, `PORT=3000`, `AI_API_KEY`, `AI_MODEL`.

### B. Deploy to Railway
1. Click **New Project > Deploy from GitHub repo**.
2. Railway will run the Dockerfile or package.json scripts automatically.
3. Add `AI_API_KEY` and `AI_MODEL` under Variables.

### C. Deploy via Docker
```bash
docker build -t kryptopulse-app .
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  -e AI_MODEL="gemini-2.5-flash" \
  -e NODE_ENV="production" \
  --name kryptopulse kryptopulse-app
```
Access at `http://localhost:3000`.

---

## 5. Diagnostic Verification Checklist

After deploying to Vercel, open your browser's Developer Tools (F12 > Console & Network) and verify:

1. **Markets Request**:
   - `GET /api/crypto/markets?vs_currency=inr` returns `HTTP 200 OK`.
   - Response contains array of 5 coins (BTC, ETH, USDT, BNB, SOL) with positive prices, 24h changes, high/low, and market cap.
2. **Header Sync Status**:
   - The top status indicator shows `Synchronized • Base: INR (₹)`.
   - The timestamp shows the current time.
3. **Interactive Charts**:
   - `GET /api/crypto/history/bitcoin?days=7&vs_currency=inr` returns `HTTP 200 OK`.
   - Area chart renders historical line with price values.
4. **AI Assistant**:
   - Send `What is the current Bitcoin price in INR?`
   - `POST /api/chat` returns `HTTP 200 OK` with grounded live market telemetry.
