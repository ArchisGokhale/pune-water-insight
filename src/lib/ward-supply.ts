// Ward-level water supply schedule for PMC + PCMC.
// Compiled from June 2026 PMC press notes (alternate-day supply imposed 20 Jun 2026)
// and PCMC water-supply department schedule. This is the publicly available
// schedule at a ward-area resolution — exact street-level timings can vary
// by ±30 min depending on tail-end pressure.

export type WardSchedule = {
  ward: string;
  zone: "PMC" | "PCMC";
  region: string;
  days: string;          // e.g. "Alternate (Odd dates)"
  morningSlot?: string;  // "06:30 – 08:30"
  eveningSlot?: string;  // "18:30 – 20:00"
  feeder: string;        // source reservoir / WTP
  notes?: string;
};

export const wards: WardSchedule[] = [
  // ---------------- PMC (alternate-day from 20 Jun 2026) ----------------
  { ward: "Aundh",            zone: "PMC", region: "North-West", days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Holkar WTP / Khadakwasla", notes: "Tail-end areas (Sutarwadi) get water 30 min late" },
  { ward: "Baner",             zone: "PMC", region: "North-West", days: "Alternate (Odd dates)",  morningSlot: "06:00 – 08:00", eveningSlot: "18:00 – 19:30", feeder: "Holkar WTP" },
  { ward: "Balewadi",          zone: "PMC", region: "North-West", days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", feeder: "Holkar WTP", notes: "Evening supply suspended in June" },
  { ward: "Pashan",            zone: "PMC", region: "West",       days: "Alternate (Even dates)", morningSlot: "07:00 – 09:00", eveningSlot: "19:00 – 20:30", feeder: "Holkar WTP" },
  { ward: "Bavdhan",           zone: "PMC", region: "West",       days: "Alternate (Even dates)", morningSlot: "07:00 – 09:00", feeder: "Holkar WTP" },
  { ward: "Kothrud",           zone: "PMC", region: "West",       days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Karve Nagar",       zone: "PMC", region: "West",       days: "Alternate (Odd dates)",  morningSlot: "07:00 – 09:00", eveningSlot: "19:00 – 20:30", feeder: "Parvati WTP" },
  { ward: "Erandwane / Deccan",zone: "PMC", region: "Central",    days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Shivajinagar",      zone: "PMC", region: "Central",    days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Kasba Peth",        zone: "PMC", region: "Old City",   days: "Alternate (Even dates)", morningSlot: "06:00 – 08:00", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP", notes: "Heritage core — supply via gravity main" },
  { ward: "Sadashiv Peth",     zone: "PMC", region: "Old City",   days: "Alternate (Even dates)", morningSlot: "06:00 – 08:00", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Camp / Cantonment", zone: "PMC", region: "East",       days: "Daily (cantonment)",     morningSlot: "06:00 – 09:00", eveningSlot: "18:00 – 20:00", feeder: "Cantonment Board mains", notes: "PCB schedule, not affected by PMC cut" },
  { ward: "Koregaon Park",     zone: "PMC", region: "East",       days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Kalyani Nagar",     zone: "PMC", region: "East",       days: "Alternate (Odd dates)",  morningSlot: "07:00 – 09:00", feeder: "Bhama Askhed", notes: "Evening tankers in shortfall" },
  { ward: "Viman Nagar",       zone: "PMC", region: "East",       days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", feeder: "Bhama Askhed" },
  { ward: "Kharadi",           zone: "PMC", region: "East",       days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", feeder: "Bhama Askhed", notes: "Tail-end — pressure low" },
  { ward: "Wagholi",           zone: "PMC", region: "East",       days: "Tanker rotation",        feeder: "Bhama Askhed", notes: "Newly merged — pipeline being commissioned" },
  { ward: "Hadapsar",          zone: "PMC", region: "South-East", days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Cantonment / Parvati" },
  { ward: "Magarpatta",        zone: "PMC", region: "South-East", days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", feeder: "Cantonment" },
  { ward: "Wanowrie",          zone: "PMC", region: "South-East", days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Cantonment" },
  { ward: "Bibwewadi",         zone: "PMC", region: "South",      days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Katraj",            zone: "PMC", region: "South",      days: "Alternate (Odd dates)",  morningSlot: "07:00 – 09:00", feeder: "Parvati WTP", notes: "Tail-end — supply often 30-45 min late" },
  { ward: "Dhankawadi",        zone: "PMC", region: "South",      days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Parvati WTP" },
  { ward: "Warje",             zone: "PMC", region: "South-West", days: "Alternate (Even dates)", morningSlot: "07:00 – 09:00", feeder: "Holkar WTP" },
  { ward: "Sinhagad Road",     zone: "PMC", region: "South-West", days: "Alternate (Even dates)", morningSlot: "07:00 – 09:00", feeder: "Parvati WTP" },
  { ward: "Yerawada",          zone: "PMC", region: "North-East", days: "Alternate (Odd dates)",  morningSlot: "06:30 – 08:30", eveningSlot: "18:30 – 20:00", feeder: "Bhama Askhed" },
  { ward: "Vishrantwadi",      zone: "PMC", region: "North-East", days: "Alternate (Even dates)", morningSlot: "06:30 – 08:30", feeder: "Bhama Askhed" },
  { ward: "Dhanori / Lohegaon",zone: "PMC", region: "North-East", days: "Tanker rotation",         feeder: "Bhama Askhed", notes: "Pipeline pressure inadequate, tankers daily" },

  // ---------------- PCMC ----------------
  { ward: "Pimpri",            zone: "PCMC", region: "Central",   days: "Daily (1x)",             morningSlot: "06:30 – 08:30", feeder: "Pavana WTP" },
  { ward: "Chinchwad",         zone: "PCMC", region: "Central",   days: "Daily (1x)",             morningSlot: "06:30 – 08:30", feeder: "Pavana WTP" },
  { ward: "Akurdi",            zone: "PCMC", region: "West",      days: "Daily (1x)",             morningSlot: "06:00 – 08:00", feeder: "Pavana WTP" },
  { ward: "Nigdi",             zone: "PCMC", region: "West",      days: "Daily (1x)",             morningSlot: "06:00 – 08:00", feeder: "Pavana WTP", notes: "Pradhikaran sectors — gravity feed" },
  { ward: "Bhosari",           zone: "PCMC", region: "East",      days: "Daily (1x)",             morningSlot: "07:00 – 09:00", feeder: "Pavana / MIDC", notes: "Industrial belt — supply staggered with MIDC" },
  { ward: "Sangvi",            zone: "PCMC", region: "South",     days: "Daily (1x)",             morningSlot: "06:30 – 08:30", feeder: "Pavana WTP" },
  { ward: "Pimple Saudagar",   zone: "PCMC", region: "South",     days: "Daily (1x)",             morningSlot: "06:30 – 08:30", feeder: "Pavana WTP" },
  { ward: "Pimple Gurav",      zone: "PCMC", region: "South",     days: "Daily (1x)",             morningSlot: "06:30 – 08:30", feeder: "Pavana WTP" },
  { ward: "Wakad",             zone: "PCMC", region: "South-West",days: "Daily (1x)",             morningSlot: "07:00 – 09:00", feeder: "Pavana WTP", notes: "Tail-end — low pressure in high-rises" },
  { ward: "Hinjawadi",         zone: "PCMC", region: "South-West",days: "Daily (1x)",             morningSlot: "07:00 – 09:00", feeder: "Pavana WTP", notes: "IT belt — augmented via tankers" },
];

export const lastUpdated = "20 June 2026";
export const sourceUrl = "https://www.pmc.gov.in/en/water-supply-department";

export function findWardSchedule(query: string): WardSchedule | undefined {
  const q = query.toLowerCase().trim();
  return wards.find((w) => w.ward.toLowerCase().includes(q));
}
