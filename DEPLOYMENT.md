# KryptoPulse Standalone Production Deployment Guide

KryptoPulse is a fully independent, production-grade cryptocurrency analytics and AI intelligence web application. It operates completely self-contained without any dependency on Google AI Studio, preview sessions, or workspace environments.

---

## 1. Architecture Overview

```
User Web Browser
       │
       ▼ (HTTPS)
Production Express Server (Port 3000 / Environment PORT)
  ├── Static Frontend Files (Vite SPA compiled to /dist)
  ├── API Layer (/api/crypto, /api/crypto/markets, /api/crypto/technical, /api/chat)
  └── Services:
       ├── CoinGecko Public Cryptocurrency API (Multi-currency cached proxy)
       └── Provider-Independent AI Service (Google Gemini / OpenAI / Custom Provider)
```

---

## 2. Environment Variables

Create a `.env` file in the root directory (or set these in your cloud provider's dashboard):

```bash
# ----------------------------------------------------------------------
# AI Provider Configuration
# ----------------------------------------------------------------------
# AI_PROVIDER: 'gemini' (default) or 'openai' / 'openai-compatible'
AI_PROVIDER="gemini"

# GEMINI_API_KEY or AI_API_KEY: Your production API Key
GEMINI_API_KEY="your_api_key_here"
AI_API_KEY="your_api_key_here"

# AI_MODEL: Model to use for analysis (default: gemini-flash-latest)
AI_MODEL="gemini-flash-latest"

# ----------------------------------------------------------------------
# Server & Runtime Configuration
# ----------------------------------------------------------------------
PORT=3000
NODE_ENV=production
```

---

## 3. Deploying to Cloud Platforms

### A. Deploy to Render (1-Click or Git)
1. Push this repository to GitHub or GitLab.
2. In Render Dashboard, click **New > Web Service** and connect your repository (or use the included `render.yaml`).
3. Set the following build settings:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `tsx server.ts`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `GEMINI_API_KEY`: `<Your-Gemini-Key>`
   - `AI_MODEL`: `gemini-flash-latest`
5. Click **Create Web Service**. Once deployed, your public URL will be live!

### B. Deploy to Railway
1. Click **New Project > Deploy from GitHub repo**.
2. Railway automatically detects `Dockerfile` or `package.json`.
3. Add the `GEMINI_API_KEY` and `AI_MODEL` environment variables under the **Variables** tab.
4. Railway will build and deploy your application.

### C. Deploy via Docker
Build and run the production container anywhere:

```bash
# 1. Build the production Docker image
docker build -t kryptopulse-app .

# 2. Run the container
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  -e AI_MODEL="gemini-flash-latest" \
  -e NODE_ENV="production" \
  --name kryptopulse kryptopulse-app
```

Access at `http://localhost:3000`.

### D. Deploy on a VPS (Ubuntu/Debian, Nginx, PM2)
```bash
# Clone and install
git clone <repo-url> /var/www/kryptopulse
cd /var/www/kryptopulse
npm install
npm run build

# Start with PM2 process manager
pm2 start "tsx server.ts" --name kryptopulse

# Configure Nginx reverse proxy to port 3000
```

---

## 4. Verifying Standalone Independence

To confirm complete independence from Google AI Studio:

1. Close Google AI Studio completely in your browser.
2. Start the local production build:
   ```bash
   npm run build
   NODE_ENV=production tsx server.ts
   ```
3. Open `http://localhost:3000` in a clean incognito browser window.
4. Verify all features:
   - Currency switcher (INR, USD, EUR, GBP, JPY, CAD, AUD, SGD, AED) updates all prices across the platform.
   - Charts render historical series in the chosen currency.
   - Comparison matrix loads live data.
   - AI Research Terminal responds to custom inquiries and quick-action buttons (`[Analyze Bitcoin]`, `[Technical Analysis]`, etc.).
   - Technical indicator calculations (RSI, MACD, Bollinger Bands) show genuine mathematical values.
