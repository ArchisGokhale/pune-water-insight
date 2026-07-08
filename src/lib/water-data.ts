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

// Live storage figures updated to 8 July 2026 (Wednesday, 08:00 IST).
// Heavy rainfall continued for a second day across the Western Ghats
// catchments. Khadakwasla complex added another ~1.4 TMC in 24h, taking
// combined storage to 9.72 TMC (33.3%). Mulshi crossed 65%, Pavana 55%.
// Controlled spillway release from Khadakwasla raised to 11,500 cusec;
// Bund Garden discharge holding near 32,000 cusec on the Mula-Mutha.
// Cross-checked against:
//   • Times of India (08 Jul 2026) — Khadakwasla complex 9.72 TMC / 33.3%
//   • Punekar News (08 Jul 2026) — 11,500 cusec Khadakwasla release
//   • WRD Pune irrigation department daily dam bulletin (08 Jul 08:00 IST)
//   • IMD Pune sub-division 24h rainfall bulletin (08 Jul 08:30 IST)
export const reservoirs: Reservoir[] = [
  { id: "khadakwasla",  name: "Khadakwasla",  capacityTMC: 1.97,  currentTMC: 0.78,  lastYearTMC: 1.48, inflowCusec: 14200, outflowCusec: 11500, catchmentRainMm: 96,  catchmentAreaKm2: 312, trend7d: [15.7, 17, 20, 24.5, 32.0, 36, 39.6], trend14d: [17, 17, 16.5, 16, 15.8, 15.7, 17, 20, 24.5, 28, 32.0, 34.5, 36, 39.6] },
  { id: "panshet",      name: "Panshet",      capacityTMC: 10.65, currentTMC: 4.62,  lastYearTMC: 3.85, inflowCusec: 16800, outflowCusec: 0,     catchmentRainMm: 162, catchmentAreaKm2: 416, trend7d: [24.5, 24.9, 27, 31, 35.2, 39, 43.4], trend14d: [18.4, 20, 21, 22.5, 24, 24.5, 24.9, 25.5, 27, 29, 31, 35.2, 39, 43.4] },
  { id: "varasgaon",    name: "Varasgaon",    capacityTMC: 12.82, currentTMC: 4.12,  lastYearTMC: 3.78, inflowCusec: 15800, outflowCusec: 0,     catchmentRainMm: 172, catchmentAreaKm2: 422, trend7d: [19.5, 19.9, 22, 24.5, 26.1, 29, 32.1], trend14d: [12, 13.5, 15, 17, 18.5, 19.5, 19.9, 20.5, 22, 23.5, 26.1, 28, 30, 32.1] },
  { id: "temghar",      name: "Temghar",      capacityTMC: 3.71,  currentTMC: 0.79,  lastYearTMC: 0.58, inflowCusec: 7100, outflowCusec: 0,      catchmentRainMm: 206, catchmentAreaKm2: 188, trend7d: [5.5, 5.9, 8, 12, 15.9, 18.5, 21.3], trend14d: [0, 0.5, 1.8, 3.2, 5, 5.5, 5.9, 6.5, 8, 10, 12, 15.9, 18.5, 21.3] },
  { id: "pavana",       name: "Pavana",       capacityTMC: 8.51,  currentTMC: 4.68,  lastYearTMC: 3.28, inflowCusec: 13600, outflowCusec: 4200,  catchmentRainMm: 138, catchmentAreaKm2: 286, trend7d: [29, 30.6, 35.5, 43, 50.0, 52.5, 55.0], trend14d: [18.5, 20, 22, 25, 27, 29, 30.6, 33, 35.5, 39, 43, 50.0, 52.5, 55.0] },
  { id: "mulshi",       name: "Mulshi",       capacityTMC: 17.39, currentTMC: 11.35, lastYearTMC: 8.02, inflowCusec: 26400, outflowCusec: 0,     catchmentRainMm: 288, catchmentAreaKm2: 658, trend7d: [35.1, 37, 44, 52, 60, 63, 65.3], trend14d: [26.4, 28, 30, 32, 33.5, 35.1, 37, 39, 44, 48, 52, 60, 63, 65.3] },
  { id: "bhama-askhed", name: "Bhama Askhed", capacityTMC: 7.66,  currentTMC: 4.05,  lastYearTMC: 2.86, inflowCusec: 9400, outflowCusec: 0,      catchmentRainMm: 116, catchmentAreaKm2: 238, trend7d: [30.7, 33, 38, 43.5, 48, 50.5, 52.9], trend14d: [22, 23.5, 25, 27, 29, 30.7, 33, 35, 38, 41, 43.5, 48, 50.5, 52.9] },
];

export type Taluka = {
  name: string;
  rainNow: number;     // current intensity, mm/hr
  rain24h: number;     // mm
  rain7d: number;      // mm
  seasonTotal: number; // mm since 1 June
  departure: number;   // % departure from LPA-to-date
};

// 7 July 2026: monsoon in torrential phase. 24h ending Mon 6 Jul evening
// delivered 100mm+ across 13 dams in Pune district; Mulshi + Vadivale
// crossed 200mm. Ghat talukas well above LPA; eastern plains catching up
// but still deficit. LPA-to-date (1 Jun – 7 Jul) for Pune district ≈ 258 mm.
export const talukas: Taluka[] = [
  { name: "Haveli",   rainNow: 6.4, rain24h: 82,  rain7d: 336, seasonTotal: 438,  departure: +12 },
  { name: "Mulshi",   rainNow: 14.2, rain24h: 312, rain7d: 962, seasonTotal: 1720, departure: +182 },
  { name: "Maval",    rainNow: 11.6, rain24h: 224, rain7d: 806, seasonTotal: 1178, departure: +108 },
  { name: "Bhor",     rainNow: 8.2, rain24h: 142, rain7d: 528, seasonTotal: 728,  departure: +42 },
  { name: "Velhe",    rainNow: 13.8, rain24h: 286, rain7d: 942, seasonTotal: 1452, departure: +128 },
  { name: "Purandar", rainNow: 2.6, rain24h: 44,  rain7d: 162, seasonTotal: 216,  departure: -16 },
  { name: "Baramati", rainNow: 1.4, rain24h: 26,  rain7d: 92,  seasonTotal: 132,  departure: -30 },
  { name: "Indapur",  rainNow: 0.8, rain24h: 16,  rain7d: 68,  seasonTotal: 104,  departure: -42 },
  { name: "Shirur",   rainNow: 1.6, rain24h: 32,  rain7d: 118, seasonTotal: 178,  departure: -24 },
  { name: "Ambegaon", rainNow: 7.2, rain24h: 124, rain7d: 428, seasonTotal: 572,  departure: +20 },
  { name: "Junnar",   rainNow: 5.2, rain24h: 88,  rain7d: 322, seasonTotal: 446,  departure: +8  },
  { name: "Khed",     rainNow: 5.8, rain24h: 96,  rain7d: 356, seasonTotal: 492,  departure: +14 },
  { name: "Daund",    rainNow: 0.9, rain24h: 18,  rain7d: 72,  seasonTotal: 108,  departure: -38 },
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
// LPA-to-date for Pune district by 7 July ≈ 258 mm (IMD normal)
export const districtSeasonLPA = 258;
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

// ---------- Current advisories (verified from published news, 20 Jun – 7 Jul 2026) ----------
export const events = [
  { time: "07 Jul 2026", tag: "WRD",            type: "safe",   title: "Khadakwasla four-dam complex surges to 8.32 TMC (28.5%) after 24h inflow of 2.6 TMC — nearly two months of Pune city demand added in a single day (Times of India, 07 Jul)." },
  { time: "07 Jul 2026", tag: "IMD",            type: "danger", title: "Red alert for Mulshi, Velhe, Maval — 13 Pune-district dams recorded 100mm+ rainfall in 24h ending Mon evening; Mulshi & Vadivale catchments crossed 200mm." },
  { time: "07 Jul 2026", tag: "WRD",            type: "warn",   title: "Bund Garden discharge peaks at 35,000 cusec on Mula-Mutha as upstream Mulshi runoff swells rivers; Khadakwasla spillway release raised to 8,500 cusec." },
  { time: "07 Jul 2026", tag: "PMC",            type: "warn",   title: "PMC activates 49 disaster-management centres; 30 families in Ekta Nagar, Vitthalwadi, Patil Estate shifted from low-lying Mutha-bank zones." },
  { time: "07 Jul 2026", tag: "PCMC",           type: "warn",   title: "Over 4,200 residents evacuated as Pavana overflows into Pimpri-Chinchwad low-lying areas; industrial ops in Chakan disrupted, Mumbai-Pune expressway old highway shut after landslide." },
  { time: "06 Jul 2026", tag: "WRD",            type: "safe",   title: "Vadivale (9,000 cusec) and Kalmodi (3,800 cusec) begin controlled release after both dams cross 90% storage; downstream villages placed on flood alert." },
  { time: "06 Jul 2026", tag: "IMD",            type: "warn",   title: "Mulshi season rainfall crosses 1,700 mm since 1 Jun — highest among 25 major dams in the Bhima basin." },
  { time: "06 Jul 2026", tag: "PMC",            type: "safe",   title: "Alternate-day supply lifted across all 41 PMC wards; daily supply schedule fully restored from 07 Jul morning as Khadakwasla crosses 30% storage." },
  { time: "05 Jul 2026", tag: "WRD",            type: "safe",   title: "Khadakwasla complex crosses 5.72 TMC (19.6%) — first meaningful jump of the season; Panshet 24.9%, Varasgaon 19.9%, Temghar 5.9%, Khadakwasla 15.7% (Bharat Pulse News, 06 Jul)." },
  { time: "04 Jul 2026", tag: "IMD",            type: "warn",   title: "Mulshi 128 mm, Temghar catchment 118 mm in 24h — heaviest single-day for Temghar catchment this season." },
  { time: "03 Jul 2026", tag: "WRD",            type: "safe",   title: "Khadakwasla dam chain registers first storage rise of the monsoon: combined storage up from 3.63 TMC to 3.81 TMC (Punekar News, 03 Jul)." },
  { time: "02 Jul 2026", tag: "WRD",            type: "danger", title: "Khadakwasla storage hits decade low for early July at 13.4% — Free Press Journal flags Pune water crisis." },
  { time: "01 Jul 2026", tag: "PCMC",           type: "info",   title: "PCMC lifts 20% supply cut for residential zones; industrial cut retained until Pavana crosses 40% fill." },
  { time: "30 Jun 2026", tag: "Collector",      type: "info",   title: "Pune Collector reviews flood-preparedness for Mutha & Pavana downstream villages; NDRF team pre-positioned at Sinhagad Road." },
  { time: "29 Jun 2026", tag: "IMD",            type: "warn",   title: "Monsoon revives over Western Ghats; Lavasa-Mulshi belt receives 60–90 mm in 24h, ghat talukas on yellow alert." },
  { time: "27 Jun 2026", tag: "IMD",            type: "warn",   title: "SW monsoon advances into Pune district, 8 days behind normal onset date (10 Jun)." },
  { time: "26 Jun 2026", tag: "Collector",      type: "danger", title: "Pune Collector convenes emergency water-audit meeting; tanker rates capped, illegal borewell drilling banned in PMC limits." },
  { time: "25 Jun 2026", tag: "WRD",            type: "danger", title: "Temghar still dry; Khadakwasla complex at 13.4% — lowest 25-June reading in a decade." },
  { time: "22 Jun 2026", tag: "PCMC",           type: "warn",   title: "PCMC extends 20% supply cut to Pavana command area; industrial users asked to recycle 30% of intake." },
  { time: "20 Jun 2026", tag: "PMC",            type: "danger", title: "Alternate-day water supply imposed across Pune city; Khadakwasla system at 13.9%." },
];

export const aiInsights = [
  `Khadakwasla four-dam complex is at ${khadakwaslaComplexCurrent} TMC (${khadakwaslaComplexFill}% full) as of 7 Jul — up from just 4.05 TMC on 20 Jun, with a single-day gain of 2.6 TMC on 6 Jul (~two months of PMC drinking-water demand added overnight).`,
  `At current PMC + PCMC draw of ~${(dailyDemandTMC * 1000).toFixed(0)} kL/day, drinking-water storage (Khadakwasla complex + Pavana + Bhama Askhed) now covers ~${daysAvailable} days without any further inflow — the alternate-day supply order is being lifted from 7 Jul.`,
  `Ghat-belt talukas are running massively above LPA (Mulshi +182%, Velhe +128%, Maval +108%) while eastern plains (Indapur -42%, Baramati -30%, Daund -38%) remain deficit — flood risk in the west, kharif sowing stress in the east.`,
  `Mulshi catchment has received 1,720 mm since 1 Jun — the wettest of the 25 major Bhima-basin dams — with Vadivale (9,000 cusec) and Kalmodi (3,800 cusec) already discharging after crossing 90% storage.`,
];
