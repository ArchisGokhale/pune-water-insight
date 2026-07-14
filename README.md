<div align="center">

# 💧 Pune Water Intelligence

### *The real-time water security dashboard for Pune district.*

**Live reservoir storage · Ward-level supply · Monsoon forecasts · AI-grounded insights**

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-pune--water--insight.lovable.app-0ea5e9?style=for-the-badge)](https://pune-water-insight.lovable.app)
[![Made with Lovable](https://img.shields.io/badge/Made_with-Lovable-ff5eae?style=for-the-badge)](https://lovable.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ef4444?style=for-the-badge&logo=react)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

![Status](https://img.shields.io/badge/Monsoon_2026-🌧_Active-22c55e?style=flat-square)
![Reservoirs](https://img.shields.io/badge/Reservoirs_Tracked-7-0ea5e9?style=flat-square)
![Talukas](https://img.shields.io/badge/Talukas-13-8b5cf6?style=flat-square)
![PMC Wards](https://img.shields.io/badge/PMC_Wards-41-f59e0b?style=flat-square)
![AI](https://img.shields.io/badge/AI-Gemini_Grounded-a855f7?style=flat-square)

</div>

---

## 🌊 What is this?

> **A single glass pane for every drop of water flowing into, out of, and across Pune.**

From the ghats of Mulshi to the taps of Kothrud, this dashboard fuses **live reservoir telemetry, IMD rainfall, PMC ward schedules, and AI-grounded insight** into one calm, beautiful interface. Whether you're a citizen wondering "will my tap run tomorrow?", a journalist tracking the monsoon, or a planner watching Khadakwasla fill — this is your control room.

```
              🌧  RAINFALL         →   🏞  CATCHMENT      →   🌀  RESERVOIR
                 (13 talukas)          (7 dam network)         (Khadakwasla+)
                       ↓                        ↓                       ↓
              📈 FORECAST (15d)     ↔   🧠 AI INSIGHTS     ↔   🚰 WARD SUPPLY
                                                                  (41 wards)
```

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%" valign="top">

### 📊 Real-Time Dashboard
- 7 major reservoirs · TMC, % fill, inflow/outflow
- 14-day per-dam storage timeline
- Khadakwasla drinking-water focus
- YoY comparison + net delta
- **Days-of-supply** countdown

### 🗺 Interactive District Map
- Stylized SVG of Pune district
- Toggle layers: talukas · rainfall heatmap · reservoirs · rivers · catchments · IMD stations · flood zones · radar
- Ghat vs plains rainfall departure

</td>
<td width="50%" valign="top">

### 🔮 Forecast & Modeling
- **15-day AI forecast** (Open-Meteo powered)
- Rainfall → Storage hydrological calculator
- Runoff coefficient · evaporation loss
- Historical YoY trends

### 🧠 AI Assistant
- Floating **Gemini-grounded** chatbot
- Answers with live JSON snapshot as context
- Cites exact reservoir/taluka numbers

### 🚰 Ward-Level Water Supply
- All **41 PMC wards** · daily schedules
- Flood-watch flags for low-lying zones
- Live PMC/PCMC/WRD advisories

</td>
</tr>
</table>

---

## 🎨 Design Language

<div align="center">

| Palette | Typography | Motion |
|:---:|:---:|:---:|
| Deep monsoon indigo · glacier cyan · warning amber | Precision sans · monospaced telemetry | Glassmorphic layers · subtle liquid transitions |

</div>

Dark-first UI with a soft light mode. Sticky nav with a live **IST clock**. Every card, chart, and callout is built from semantic design tokens — no hardcoded hex in components.

---

## 🧬 Tech Stack

```ts
Framework    → TanStack Start v1  (React 19 · SSR · Server Fns)
Build        → Vite 7
Styling      → Tailwind CSS v4  (native @theme tokens)
Data Fetch   → TanStack Query
Backend      → Lovable Cloud  (Postgres · Auth · Storage · Edge Fns)
AI           → Lovable AI Gateway → Gemini
Rainfall     → Open-Meteo
News         → Firecrawl (live 24h aggregator)
Deploy       → Cloudflare Workers  (workerd + nodejs_compat)
```

---

## 🚀 Discoverability (AEO-optimized)

Built to be the **go-to reference** for Pune water & rainfall data — for humans *and* AI engines.

- ✅ JSON-LD structured data (`WebSite`, `Organization`, `Dataset`, `FAQPage`, `BreadcrumbList`)
- ✅ Dynamic `/sitemap.xml`
- ✅ AI-crawler-friendly `robots.txt` (allows GPTBot, PerplexityBot, ClaudeBot, Google-Extended)
- ✅ Per-route unique `<title>`, meta description, OG + Twitter cards
- ✅ Semantic HTML · single H1 · alt text everywhere

---

## 📁 Project Structure

```
src/
├── routes/                  # file-based routing
│   ├── __root.tsx           # app shell (head + providers)
│   ├── index.tsx            # dashboard
│   ├── wards.tsx            # PMC ward schedules
│   ├── sitemap[.]xml.ts     # dynamic sitemap
│   └── api/chat.ts          # AI assistant endpoint
├── components/
│   ├── WaterPlatform.tsx    # the dashboard megacomponent
│   ├── ReservoirMapClient.tsx
│   ├── PersonalCalc.tsx
│   └── AssistantChat.tsx
├── lib/
│   ├── water-data.ts        # single source of truth (reservoirs, talukas)
│   ├── ward-supply.ts       # PMC ward schedules
│   ├── dams.functions.ts    # server functions
│   ├── weather.functions.ts # Open-Meteo integration
│   ├── news.functions.ts    # Firecrawl aggregator
│   └── ai-gateway.server.ts # Gemini via Lovable AI
└── styles.css               # Tailwind v4 tokens
```

---

## 🏃 Run Locally

```bash
bun install
bun dev
# → http://localhost:8080
```

---

## 🌐 Live

<div align="center">

### 👉 [pune-water-insight.lovable.app](https://pune-water-insight.lovable.app) 👈

*Built with ❤ for Pune, on [Lovable](https://lovable.dev).*

</div>
