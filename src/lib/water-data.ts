export type Reservoir = {
  id: string;
  name: string;
  capacityTMC: number;
  currentTMC: number;
  inflowCusec: number;
  outflowCusec: number;
  catchmentRainMm: number;
  catchmentAreaKm2: number;
  trend7d: number[];
};

export const reservoirs: Reservoir[] = [
  { id: "khadakwasla", name: "Khadakwasla", capacityTMC: 1.97, currentTMC: 1.78, inflowCusec: 8420, outflowCusec: 2100, catchmentRainMm: 38, catchmentAreaKm2: 312, trend7d: [62, 65, 68, 74, 81, 86, 90] },
  { id: "panshet", name: "Panshet", capacityTMC: 10.65, currentTMC: 8.92, inflowCusec: 12450, outflowCusec: 0, catchmentRainMm: 52, catchmentAreaKm2: 416, trend7d: [70, 72, 75, 78, 81, 83, 84] },
  { id: "varasgaon", name: "Varasgaon", capacityTMC: 12.82, currentTMC: 10.45, inflowCusec: 14800, outflowCusec: 0, catchmentRainMm: 64, catchmentAreaKm2: 422, trend7d: [68, 70, 73, 76, 78, 80, 81] },
  { id: "temghar", name: "Temghar", capacityTMC: 3.71, currentTMC: 2.45, inflowCusec: 6200, outflowCusec: 0, catchmentRainMm: 78, catchmentAreaKm2: 188, trend7d: [55, 58, 60, 62, 64, 65, 66] },
  { id: "pavana", name: "Pavana", capacityTMC: 8.51, currentTMC: 7.12, inflowCusec: 9800, outflowCusec: 1200, catchmentRainMm: 41, catchmentAreaKm2: 286, trend7d: [72, 74, 76, 78, 81, 83, 84] },
  { id: "mulshi", name: "Mulshi", capacityTMC: 17.39, currentTMC: 14.62, inflowCusec: 22400, outflowCusec: 5400, catchmentRainMm: 92, catchmentAreaKm2: 658, trend7d: [70, 73, 76, 79, 82, 83, 84] },
  { id: "bhama-askhed", name: "Bhama Askhed", capacityTMC: 7.66, currentTMC: 6.21, inflowCusec: 8100, outflowCusec: 0, catchmentRainMm: 56, catchmentAreaKm2: 238, trend7d: [68, 70, 73, 75, 78, 80, 81] },
];

export type Taluka = {
  name: string;
  rainNow: number;
  rain24h: number;
  rain7d: number;
  seasonTotal: number;
  departure: number;
};

export const talukas: Taluka[] = [
  { name: "Haveli", rainNow: 4.2, rain24h: 38, rain7d: 142, seasonTotal: 612, departure: 8.4 },
  { name: "Mulshi", rainNow: 12.8, rain24h: 92, rain7d: 386, seasonTotal: 1842, departure: 24.1 },
  { name: "Maval", rainNow: 9.4, rain24h: 64, rain7d: 268, seasonTotal: 1320, departure: 18.6 },
  { name: "Bhor", rainNow: 6.1, rain24h: 48, rain7d: 196, seasonTotal: 884, departure: 12.3 },
  { name: "Velhe", rainNow: 14.2, rain24h: 108, rain7d: 412, seasonTotal: 2104, departure: 28.7 },
  { name: "Purandar", rainNow: 1.8, rain24h: 18, rain7d: 72, seasonTotal: 384, departure: -4.2 },
  { name: "Baramati", rainNow: 0.4, rain24h: 8, rain7d: 38, seasonTotal: 246, departure: -12.8 },
  { name: "Indapur", rainNow: 0.2, rain24h: 6, rain7d: 28, seasonTotal: 198, departure: -18.4 },
  { name: "Shirur", rainNow: 1.2, rain24h: 14, rain7d: 58, seasonTotal: 312, departure: -8.2 },
  { name: "Ambegaon", rainNow: 5.8, rain24h: 42, rain7d: 172, seasonTotal: 742, departure: 6.4 },
  { name: "Junnar", rainNow: 3.4, rain24h: 28, rain7d: 118, seasonTotal: 564, departure: 2.1 },
  { name: "Khed", rainNow: 4.6, rain24h: 36, rain7d: 138, seasonTotal: 598, departure: 4.8 },
  { name: "Daund", rainNow: 0.8, rain24h: 12, rain7d: 48, seasonTotal: 282, departure: -10.6 },
];

export const totalCapacity = reservoirs.reduce((s, r) => s + r.capacityTMC, 0);
export const totalCurrent = reservoirs.reduce((s, r) => s + r.currentTMC, 0);
export const overallFill = (totalCurrent / totalCapacity) * 100;

// Pune daily water demand ~1450 MLD ≈ 0.0512 TMC/day
export const dailyDemandTMC = 0.0512;
export const daysAvailable = Math.round(totalCurrent / dailyDemandTMC);

export const securityIndex = Math.round(
  0.4 * overallFill +
  0.2 * 78 + // rainfall trend score
  0.2 * 82 + // forecast score
  0.2 * 74   // consumption efficiency
);

export const events = [
  { time: "2h ago", tag: "IMD", type: "warn", title: "Heavy rainfall warning issued for Mulshi & Velhe ghats over next 24 hours." },
  { time: "5h ago", tag: "WRD", type: "info", title: "Khadakwasla gates opened — 2,100 cusec discharge to Mutha river." },
  { time: "8h ago", tag: "PMC", type: "info", title: "No water cuts scheduled this week; supply at full pressure across all wards." },
  { time: "1d ago", tag: "Disaster Mgmt", type: "danger", title: "Flood alert for low-lying areas along Mula-Mutha confluence." },
  { time: "1d ago", tag: "IMD", type: "info", title: "Monsoon onset over Pune district confirmed; 12% above LPA so far." },
  { time: "2d ago", tag: "WRD", type: "info", title: "Temghar dam catchment received 78mm rainfall — storage up 4.2%." },
];

export const aiInsights = [
  "Heavy rainfall in Mulshi catchment may increase Temghar storage by 3% over next 48 hours.",
  "Current inflow trend suggests Pune has sufficient water for 270 days at present consumption.",
  "Reservoir cluster (Khadakwasla, Panshet, Varasgaon, Temghar) likely to hit 95% by August 20.",
  "Eastern talukas (Indapur, Baramati) trailing LPA by 12-18% — consider supply augmentation plan.",
];
