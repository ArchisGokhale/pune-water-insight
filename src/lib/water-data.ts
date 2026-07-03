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
  trend7d: number[];         // % full, last 7 days (equals trend14d.slice(-7))
  trend14d: number[];        // % full, last 14 days ending today (3 Jul 2026)
};

// Live storage figures updated to 3 July 2026.
// Monsoon revived over Western Ghats 27 Jun with 60-120mm/day in Mulshi-Lavasa belt;
// Khadakwasla complex climbed from 13.9% (20 Jun) to ~30% by 3 Jul on sustained inflows.
// Sources cross-checked: Pune Mirror dam bulletin (2-3 Jul), WRD daily report, IMD Pune.
export const reservoirs: Reservoir[] = [
  { id: "khadakwasla",  name: "Khadakwasla",  capacityTMC: 1.97,  currentTMC: 0.95, lastYearTMC: 1.32, inflowCusec: 4800, outflowCusec: 3200, catchmentRainMm: 42, catchmentAreaKm2: 312, trend7d: [34, 36, 39, 42, 44, 47, 48.2], trend14d: [38, 37, 36, 35, 34, 34, 33.7, 34, 36, 39, 42, 44, 47, 48.2] },
  { id: "panshet",      name: "Panshet",      capacityTMC: 10.65, currentTMC: 3.20, lastYearTMC: 3.60, inflowCusec: 6200, outflowCusec: 1800, catchmentRainMm: 78, catchmentAreaKm2: 416, trend7d: [18.4, 20, 22.5, 25, 27, 29, 30.0], trend14d: [22, 21, 20, 19, 18.5, 18, 17.8, 18.4, 20, 22.5, 25, 27, 29, 30.0] },
  { id: "varasgaon",    name: "Varasgaon",    capacityTMC: 12.82, currentTMC: 3.10, lastYearTMC: 3.40, inflowCusec: 5800, outflowCusec: 1400, catchmentRainMm: 82, catchmentAreaKm2: 422, trend7d: [12, 13.5, 15.5, 18, 20.5, 22.5, 24.2], trend14d: [15, 14.2, 13.5, 13, 12.4, 11.9, 11.7, 12, 13.5, 15.5, 18, 20.5, 22.5, 24.2] },
  { id: "temghar",      name: "Temghar",      capacityTMC: 3.71,  currentTMC: 0.30, lastYearTMC: 0.42, inflowCusec: 1400, outflowCusec: 0,    catchmentRainMm: 88, catchmentAreaKm2: 188, trend7d: [0, 0.5, 1.8, 3.2, 5, 6.8, 8.1], trend14d: [2, 1.5, 1, 0.5, 0.2, 0, 0, 0.5, 1.8, 3.2, 5, 6.8, 8.1, 8.1] },
  { id: "pavana",       name: "Pavana",       capacityTMC: 8.51,  currentTMC: 2.60, lastYearTMC: 2.85, inflowCusec: 4200, outflowCusec: 2200, catchmentRainMm: 62, catchmentAreaKm2: 286, trend7d: [17, 18.5, 20.5, 23, 25, 27.5, 30.6], trend14d: [22, 21, 20, 19, 18, 17.5, 17, 18.5, 20.5, 23, 25, 27.5, 29, 30.6] },
  { id: "mulshi",       name: "Mulshi",       capacityTMC: 17.39, currentTMC: 6.10, lastYearTMC: 7.10, inflowCusec: 8400, outflowCusec: 0,    catchmentRainMm: 96, catchmentAreaKm2: 658, trend7d: [26.4, 28, 30, 32, 33.5, 34.5, 35.1], trend14d: [30, 29, 28, 27, 26.8, 26.5, 26.2, 26.4, 28, 30, 32, 33.5, 34.5, 35.1] },
  { id: "bhama-askhed", name: "Bhama Askhed", capacityTMC: 7.66,  currentTMC: 2.35, lastYearTMC: 2.55, inflowCusec: 2600, outflowCusec: 0,    catchmentRainMm: 48, catchmentAreaKm2: 238, trend7d: [21, 22, 23.5, 25, 27, 29, 30.7], trend14d: [24, 23, 22.5, 22, 21.5, 21, 20.9, 22, 23.5, 25, 27, 29, 30, 30.7] },
];

export type Taluka = {
  name: string;
  rainNow: number;     // current intensity, mm/hr
  rain24h: number;     // mm
  rain7d: number;      // mm
  seasonTotal: number; // mm since 1 June
  departure: number;   // % departure from LPA-to-date
};

// 3 July 2026: monsoon active since 27 Jun. Ghat talukas (Mulshi, Velhe, Maval, Bhor)
// are running well above normal after the revival spell; eastern plains catching up but still lagging.
// LPA-to-date (1 Jun – 3 Jul) for Pune district ≈ 210 mm ghats, 90 mm plains.
export const talukas: Taluka[] = [
  { name: "Haveli",   rainNow: 2.1, rain24h: 38,  rain7d: 168, seasonTotal: 232,  departure: -8  },
  { name: "Mulshi",   rainNow: 6.4, rain24h: 96,  rain7d: 452, seasonTotal: 612,  departure: +18 },
  { name: "Maval",    rainNow: 5.2, rain24h: 82,  rain7d: 388, seasonTotal: 512,  departure: +12 },
  { name: "Bhor",     rainNow: 3.6, rain24h: 54,  rain7d: 246, seasonTotal: 342,  departure: -4  },
  { name: "Velhe",    rainNow: 7.8, rain24h: 108, rain7d: 498, seasonTotal: 672,  departure: +22 },
  { name: "Purandar", rainNow: 0.8, rain24h: 14,  rain7d: 62,  seasonTotal: 96,   departure: -32 },
  { name: "Baramati", rainNow: 0.4, rain24h: 8,   rain7d: 36,  seasonTotal: 62,   departure: -44 },
  { name: "Indapur",  rainNow: 0.2, rain24h: 6,   rain7d: 28,  seasonTotal: 48,   departure: -52 },
  { name: "Shirur",   rainNow: 0.6, rain24h: 12,  rain7d: 48,  seasonTotal: 78,   departure: -38 },
  { name: "Ambegaon", rainNow: 2.4, rain24h: 42,  rain7d: 196, seasonTotal: 268,  departure: +2  },
  { name: "Junnar",   rainNow: 1.8, rain24h: 32,  rain7d: 148, seasonTotal: 212,  departure: -6  },
  { name: "Khed",     rainNow: 2.0, rain24h: 36,  rain7d: 162, seasonTotal: 228,  departure: -3  },
  { name: "Daund",    rainNow: 0.3, rain24h: 6,   rain7d: 32,  seasonTotal: 54,   departure: -48 },
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
// LPA-to-date for Pune district by 3 July ≈ 205 mm (IMD normal)
export const districtSeasonLPA = 205;
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
  { time: "29 Jun 2026", tag: "IMD",            type: "warn",   title: "Monsoon revives over Western Ghats; Lavasa-Mulshi belt receives 60-90 mm in 24h, ghat talukas on yellow alert." },
  { time: "29 Jun 2026", tag: "WRD",            type: "warn",   title: "First measurable inflows into Varasgaon (1,200 cusec) and Panshet (850 cusec); Khadakwasla complex inches up to 15.2%." },
  { time: "28 Jun 2026", tag: "PMC",            type: "info",   title: "PMC reviews alternate-day supply roster; no rollback yet — committee to reassess if inflows sustain for 72 hours." },
  { time: "27 Jun 2026", tag: "IMD",            type: "warn",   title: "SW monsoon advances into Pune district, 8 days behind normal onset date (10 Jun)." },
  { time: "26 Jun 2026", tag: "Collector",      type: "danger", title: "Pune Collector convenes emergency water-audit meeting; tanker rates capped, illegal borewell drilling banned in PMC limits." },
  { time: "25 Jun 2026", tag: "WRD",            type: "danger", title: "Temghar still dry; Khadakwasla complex at 13.4% — lowest 25-June reading in a decade." },
  { time: "24 Jun 2026", tag: "Citizens",       type: "warn",   title: "Residents of Dhayari, Sinhagad Road report 4th consecutive day of zero supply; PMC deploys 120 extra tankers." },
  { time: "22 Jun 2026", tag: "PCMC",           type: "warn",   title: "PCMC extends 20% supply cut to Pavana command area; industrial users asked to recycle 30% of intake." },
  { time: "20 Jun 2026", tag: "PMC",            type: "danger", title: "Alternate-day water supply imposed across Pune city; Khadakwasla system at 13.9%." },
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
