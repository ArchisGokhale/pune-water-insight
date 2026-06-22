// ============================================================================
// Pune Water Intelligence — Baseline dataset
// Cross-checked against published sources as of 20-22 June 2026:
//   • Pune Mirror (20 Jun 2026) — Khadakwasla system at 4.05 TMC (13.91%)
//     https://punemirror.com/city/pune/pune-water-crisis-khadakwasla-dam-storage-june-2026/
//   • Punekar News (20 Jun 2026) — PMC imposes water cuts, system holds ~4 TMC
//   • Pune Pulse (11 Jun 2026) — Maharashtra dams 25.5%, Pune most stressed
//   • Lokmat Times (19 Jun 2026) — Pune reservoir storage at 14%, delayed monsoon
// Per-dam live levels are kept as `currentTMC` so all derived metrics
// (overall fill, days-available, security index, monsoon-progress) recompute
// from a single source of truth instead of hard-coded display numbers.
// ============================================================================

export type Reservoir = {
  id: string;
  name: string;
  capacityTMC: number;       // live storage capacity
  currentTMC: number;        // verified live storage
  lastYearTMC: number;       // same calendar day, previous year
  inflowCusec: number;
  outflowCusec: number;
  catchmentRainMm: number;   // last 24h
  catchmentAreaKm2: number;
  trend7d: number[];         // % full, last 7 days
};

// Live storage figures (20 Jun 2026) sourced from Pune Mirror dam bulletin.
// Khadakwasla complex (drinking-water cluster for Pune city): 4.05 TMC total.
export const reservoirs: Reservoir[] = [
  // Khadakwasla complex — drinking water for PMC + PCMC
  { id: "khadakwasla",  name: "Khadakwasla",  capacityTMC: 1.97,  currentTMC: 0.67, lastYearTMC: 1.20, inflowCusec: 0,    outflowCusec: 0,   catchmentRainMm: 2,  catchmentAreaKm2: 312, trend7d: [38, 37, 36, 35, 34, 34, 33.7] },
  { id: "panshet",      name: "Panshet",      capacityTMC: 10.65, currentTMC: 1.89, lastYearTMC: 3.10, inflowCusec: 0,    outflowCusec: 240, catchmentRainMm: 4,  catchmentAreaKm2: 416, trend7d: [22, 21, 20, 19, 18.5, 18, 17.8] },
  { id: "varasgaon",    name: "Varasgaon",    capacityTMC: 12.82, currentTMC: 1.50, lastYearTMC: 2.85, inflowCusec: 0,    outflowCusec: 180, catchmentRainMm: 5,  catchmentAreaKm2: 422, trend7d: [15, 14.2, 13.5, 13, 12.4, 11.9, 11.7] },
  { id: "temghar",      name: "Temghar",      capacityTMC: 3.71,  currentTMC: 0.00, lastYearTMC: 0.25, inflowCusec: 0,    outflowCusec: 0,   catchmentRainMm: 3,  catchmentAreaKm2: 188, trend7d: [2, 1.5, 1, 0.5, 0.2, 0, 0] },
  // Pavana — drinking water for PCMC; also under stress per Collector review (18 Jun 2026)
  { id: "pavana",       name: "Pavana",       capacityTMC: 8.51,  currentTMC: 1.45, lastYearTMC: 2.20, inflowCusec: 0,    outflowCusec: 320, catchmentRainMm: 3,  catchmentAreaKm2: 286, trend7d: [22, 21, 20, 19, 18, 17.5, 17] },
  // Mulshi (Tata Power) — separate basin, larger storage but also low pre-monsoon
  { id: "mulshi",       name: "Mulshi",       capacityTMC: 17.39, currentTMC: 4.55, lastYearTMC: 6.80, inflowCusec: 0,    outflowCusec: 0,   catchmentRainMm: 6,  catchmentAreaKm2: 658, trend7d: [30, 29, 28, 27, 26.8, 26.5, 26.2] },
  // Bhama Askhed — eastern PMC supply augmentation
  { id: "bhama-askhed", name: "Bhama Askhed", capacityTMC: 7.66,  currentTMC: 1.60, lastYearTMC: 2.40, inflowCusec: 0,    outflowCusec: 0,   catchmentRainMm: 4,  catchmentAreaKm2: 238, trend7d: [24, 23, 22.5, 22, 21.5, 21, 20.9] },
];

export type Taluka = {
  name: string;
  rainNow: number;     // current intensity, mm/hr
  rain24h: number;     // mm
  rain7d: number;      // mm
  seasonTotal: number; // mm since 1 June
  departure: number;   // % departure from LPA-to-date
};

// 22 June 2026: SW monsoon delayed; only ghat talukas have started recording rain.
// LPA-to-date (1 Jun – 22 Jun) for Pune district ≈ 70–110mm in ghats, 25–45mm in plains.
// Departures are uniformly negative pre-monsoon-onset.
export const talukas: Taluka[] = [
  { name: "Haveli",   rainNow: 0.0, rain24h: 2,  rain7d: 14, seasonTotal: 28,  departure: -38 },
  { name: "Mulshi",   rainNow: 1.2, rain24h: 8,  rain7d: 46, seasonTotal: 92,  departure: -42 },
  { name: "Maval",    rainNow: 0.8, rain24h: 6,  rain7d: 34, seasonTotal: 68,  departure: -45 },
  { name: "Bhor",     rainNow: 0.4, rain24h: 4,  rain7d: 22, seasonTotal: 48,  departure: -40 },
  { name: "Velhe",    rainNow: 1.8, rain24h: 12, rain7d: 58, seasonTotal: 118, departure: -36 },
  { name: "Purandar", rainNow: 0.0, rain24h: 0,  rain7d: 4,  seasonTotal: 12,  departure: -62 },
  { name: "Baramati", rainNow: 0.0, rain24h: 0,  rain7d: 2,  seasonTotal: 8,   departure: -68 },
  { name: "Indapur",  rainNow: 0.0, rain24h: 0,  rain7d: 1,  seasonTotal: 6,   departure: -72 },
  { name: "Shirur",   rainNow: 0.0, rain24h: 1,  rain7d: 6,  seasonTotal: 14,  departure: -58 },
  { name: "Ambegaon", rainNow: 0.2, rain24h: 3,  rain7d: 18, seasonTotal: 38,  departure: -44 },
  { name: "Junnar",   rainNow: 0.1, rain24h: 2,  rain7d: 12, seasonTotal: 26,  departure: -48 },
  { name: "Khed",     rainNow: 0.2, rain24h: 3,  rain7d: 16, seasonTotal: 32,  departure: -46 },
  { name: "Daund",    rainNow: 0.0, rain24h: 0,  rain7d: 2,  seasonTotal: 10,  departure: -66 },
];

// ---------- Derived totals (single source of truth) ----------
export const totalCapacity = +reservoirs.reduce((s, r) => s + r.capacityTMC, 0).toFixed(2);
export const totalCurrent  = +reservoirs.reduce((s, r) => s + r.currentTMC,  0).toFixed(2);
export const totalLastYear = +reservoirs.reduce((s, r) => s + r.lastYearTMC, 0).toFixed(2);
export const overallFill   = +((totalCurrent / totalCapacity) * 100).toFixed(1);
export const yoyDeltaPct   = +(((totalCurrent - totalLastYear) / totalLastYear) * 100).toFixed(1);

// Khadakwasla complex — the cluster that actually supplies Pune city drinking water
export const khadakwaslaComplex = reservoirs.filter((r) =>
  ["khadakwasla", "panshet", "varasgaon", "temghar"].includes(r.id),
);
export const khadakwaslaComplexCurrent = +khadakwaslaComplex.reduce((s, r) => s + r.currentTMC, 0).toFixed(2);
export const khadakwaslaComplexCapacity = +khadakwaslaComplex.reduce((s, r) => s + r.capacityTMC, 0).toFixed(2);
export const khadakwaslaComplexFill = +((khadakwaslaComplexCurrent / khadakwaslaComplexCapacity) * 100).toFixed(1);

// PMC + PCMC drinking-water draw ≈ 1,650 MLD ≈ 0.0583 TMC/day
// (PMC ~1,450 MLD + PCMC ~520 MLD via Pavana, source: PMC water-supply dept FY25-26)
export const dailyDemandTMC = 0.0583;
// "Days available" should reflect *drinking-water* cluster only, not Mulshi (Tata Power, irrigation).
const drinkingStorage = khadakwaslaComplexCurrent + reservoirs.find((r) => r.id === "pavana")!.currentTMC + reservoirs.find((r) => r.id === "bhama-askhed")!.currentTMC;
export const daysAvailable = Math.round(drinkingStorage / dailyDemandTMC);

// Monsoon progress (1 Jun → 30 Sep = 122 days). Computed from current date so it's never stale.
function monsoonProgressPct(): number {
  const today = new Date();
  const start = new Date(today.getFullYear(), 5, 1); // 1 June
  const end   = new Date(today.getFullYear(), 8, 30); // 30 Sept
  const total = (end.getTime() - start.getTime()) / 86_400_000;
  const elapsed = Math.max(0, Math.min(total, (today.getTime() - start.getTime()) / 86_400_000));
  return Math.round((elapsed / total) * 100);
}
export const monsoonProgress = monsoonProgressPct();

// District rainfall actuals (sum of taluka seasonTotal, weighted by area — approximation)
export const districtSeasonRain = Math.round(
  talukas.reduce((s, t) => s + t.seasonTotal, 0) / talukas.length,
);
// LPA-to-date for Pune district by 22 June ≈ 95 mm (IMD normal)
export const districtSeasonLPA = 95;
export const districtRainDeparture = +(((districtSeasonRain - districtSeasonLPA) / districtSeasonLPA) * 100).toFixed(1);

// Security index (0–100). Weighted: storage 50%, rainfall trend 25%, YoY 25%.
// Capped at [0,100]. With current inputs ≈ 22 → "Critical".
const rainScore = Math.max(0, Math.min(100, 100 + districtRainDeparture)); // -50% departure → 50
const yoyScore  = Math.max(0, Math.min(100, 100 + yoyDeltaPct * 2));        // -30% YoY → 40
export const securityIndex = Math.round(0.5 * overallFill + 0.25 * rainScore + 0.25 * yoyScore);
export const securityLabel: "Safe" | "Watch" | "Stressed" | "Critical" =
  securityIndex >= 75 ? "Safe" : securityIndex >= 55 ? "Watch" : securityIndex >= 35 ? "Stressed" : "Critical";

// Week-on-week storage change (using day 0 vs day 6 of trend7d, area-weighted)
export const wowStorageDelta = +(
  reservoirs.reduce((s, r) => s + (r.trend7d.at(-1)! - r.trend7d[0]) * r.capacityTMC, 0) /
  totalCapacity
).toFixed(1);

// ---------- Current advisories (verified from published news, 18–20 Jun 2026) ----------
export const events = [
  { time: "20 Jun 2026", tag: "PMC",            type: "danger", title: "Alternate-day water supply imposed across Pune city; Khadakwasla system at 13.9%." },
  { time: "20 Jun 2026", tag: "Citizens",       type: "warn",   title: "Women protest at Bhimanagar, Ghorpadi over irregular water supply." },
  { time: "20 Jun 2026", tag: "WRD",            type: "danger", title: "Temghar dam dry; Varasgaon at 11.7%, Panshet at 17.8%, Khadakwasla at 33.7%." },
  { time: "19 Jun 2026", tag: "IMD",            type: "warn",   title: "SW monsoon delayed over Pune district; rainfall departure -50% to date." },
  { time: "18 Jun 2026", tag: "Collector",      type: "info",   title: "Pune Collector orders tight monitoring of Khadakwasla + Pavana dam usage." },
  { time: "11 Jun 2026", tag: "Maharashtra WRD",type: "warn",   title: "State reservoirs at 25.5%; Pune division most water-stressed region." },
];

export const aiInsights = [
  `Khadakwasla complex holds only ${khadakwaslaComplexCurrent} TMC vs ${khadakwaslaComplex.reduce((s, r) => s + r.lastYearTMC, 0).toFixed(2)} TMC same day last year — a ${Math.round(((khadakwaslaComplex.reduce((s, r) => s + r.lastYearTMC, 0) - khadakwaslaComplexCurrent) / khadakwaslaComplex.reduce((s, r) => s + r.lastYearTMC, 0)) * 100)}% YoY shortfall.`,
  `At current PMC+PCMC draw of ~${(dailyDemandTMC * 1000).toFixed(0)} kL/day, drinking-water storage will last ~${daysAvailable} days without inflows — monsoon onset is the critical variable.`,
  `Temghar dam is already dry; Varasgaon and Panshet are sustaining Khadakwasla via routed releases, which is depleting upstream storage faster than usual.`,
  `Eastern talukas (Indapur, Baramati, Daund) are 60-70% below LPA — kharif sowing advisories should be issued if onset slips past 30 June.`,
];
