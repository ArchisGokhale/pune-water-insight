## Goal
Add two feature bundles to Pune Water Intelligence: (1) Personal water tools + ward supply alerts, (2) Interactive reservoir map + AI assistant grounded on live data.

## 1. Personal Water Calculator (no backend)
New section `#calculator` on home page.

Inputs: household size, bathing (bucket/shower), washing machine loads/wk, garden (yes/no), car wash (yes/no).
Outputs:
- Estimated litres/day (uses CPHEEO/BIS norms: 135 LPCD baseline + add-ons).
- "Your share vs Pune avg" bar (Pune avg ~150 LPCD per PMC).
- "Days of supply if everyone used like you" — derived from current cluster storage ÷ (your-LPCD × Pune pop 7.4M).
- 3 contextual conservation tips based on biggest contributor.

All client-side; no persistence. Reuses tokens + Card primitives already in `WaterPlatform.tsx`.

## 2. Ward Supply Schedule + Email Alerts
New route `/wards` plus a compact widget on home page.

- Static seed dataset `src/lib/ward-supply.ts`: ~30 PMC + 10 PCMC wards with `{ ward, zone, days, timing, source, lastUpdated }` from latest June 2026 PMC bulletins.
- `/wards` page: search box + filter by zone, table of timings, "alternate-day" badge, source link per row.
- Subscribe form (email + ward multi-select) → Lovable Cloud table `ward_alerts`.
- Daily cron (pg_cron → `/api/public/ward-alert-check`) re-scrapes PMC press notes via Firecrawl, diffs against last snapshot in `ward_supply_snapshots`, and emails subscribers via Lovable Email when their ward's schedule changes.

Requires enabling Lovable Cloud + Lovable Email.

## 3. Interactive Reservoir Map
New section `#map` (replaces the placeholder "Live Map" nav target).

- Add `react-leaflet` + `leaflet`; load CSS via root route `<link>`.
- Markers for the 4 Khadakwasla-complex dams (Khadakwasla, Panshet, Varasgaon, Temghar) using real lat/lng; marker color = fill % (safe/aqua/warn/danger tokens).
- Popup: name, current TMC / capacity TMC, % fill, 24h inflow, today's catchment rainfall (from existing `liveWeatherQuery` or per-dam Open-Meteo points).
- Toggle layer: rainfall heat circles sized by today's mm.
- Click marker → scrolls/opens existing reservoir detail card.

SSR-safe wrapper: dynamic import + `typeof window` guard since Leaflet touches `window`.

## 4. AI Water Assistant (grounded chat)
New route `/assistant` + floating chat button on home.

- Lovable AI Gateway via TanStack server route `src/routes/api/chat.ts` using `streamText` + `google/gemini-3-flash-preview`.
- System prompt receives a compact JSON snapshot of: today's reservoir storage, district rainfall, monsoon %, security index, top 5 live news headlines (from existing Firecrawl `getLiveNews`). Snapshot built per-request inside the handler so data is always fresh.
- Tool: `getWardSchedule({ ward })` returns supply timing from the dataset in feature 2.
- One conversation, localStorage persistence (per `chat-agent-ui-contract` — defaulted because this is a utility assistant, not a thread-based product; will confirm if user prefers threads).
- UI built with AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`, `tool`); custom water-drop avatar, not Sparkles.
- Floating "Ask about Pune water" button in bottom-right on `/`.

## Technical notes
- New files: `src/lib/water-calculator.ts`, `src/lib/ward-supply.ts`, `src/lib/ward-alerts.functions.ts`, `src/lib/ai-gateway.server.ts`, `src/routes/wards.tsx`, `src/routes/assistant.tsx`, `src/routes/api/chat.ts`, `src/routes/api/public/ward-alert-check.ts`, `src/components/ReservoirMap.tsx`, `src/components/WaterCalculator.tsx`, `src/components/AssistantLauncher.tsx`.
- Cloud tables: `ward_alerts(id, email, wards[], created_at, confirmed)`, `ward_supply_snapshots(id, ward, schedule_hash, payload jsonb, captured_at)` — both with explicit GRANTs + RLS (anon insert for subscribe, service_role for cron).
- Nav: add "Wards", "Map", "Assistant" entries; keep existing anchor links working.
- Author credit + live-data bits added previously stay untouched.

## Order of build
1. Calculator (pure UI, fastest visible win)
2. Reservoir map
3. Wards page + subscribe (enable Cloud)
4. AI assistant (needs map+wards data already shaped)
5. Cron-driven email alerts (enable Email, schedule pg_cron)

## Open questions before build
- Assistant chat: one conversation in localStorage (proposed) or full threaded history saved in Cloud?
- Email alerts: OK to enable Lovable Cloud + Lovable Email now? (required for features 2 & 5)
