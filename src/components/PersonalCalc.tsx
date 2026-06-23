import { useMemo, useState } from "react";
import { User, Droplets, Sparkles, ShowerHead } from "lucide-react";

// LPCD norms — CPHEEO Manual on Water Supply (2024 rev) + BIS IS:1172
// Baseline 135 LPCD for piped supply, plus per-activity add-ons.
const PUNE_AVG_LPCD = 150;
const PUNE_POPULATION = 7_400_000; // PMC + PCMC + fringe
const DAILY_DEMAND_TMC = 0.0583;   // matches water-data.ts
const STORAGE_TMC_FOR_DRINKING = 4.05; // Khadakwasla cluster current

type Inputs = {
  people: number;
  bathing: "bucket" | "shower-short" | "shower-long";
  laundryLoads: number;          // per week
  garden: boolean;
  carWash: boolean;
  flushing: "single" | "dual";
};

function estimateLPCD(i: Inputs): { lpcd: number; breakdown: { label: string; litres: number }[] } {
  let total = 50; // drinking + cooking + cleaning baseline
  const bath = i.bathing === "bucket" ? 18 : i.bathing === "shower-short" ? 45 : 95;
  total += bath;
  const flush = i.flushing === "dual" ? 25 : 45;
  total += flush;
  const laundry = Math.round(((i.laundryLoads * 65) / 7) / Math.max(1, i.people));
  total += laundry;
  const garden = i.garden ? 25 : 0;
  total += garden;
  const car = i.carWash ? 12 : 0;
  total += car;
  return {
    lpcd: total,
    breakdown: [
      { label: "Drink + cook + clean", litres: 50 },
      { label: "Bathing", litres: bath },
      { label: "Toilet flushing", litres: flush },
      { label: "Laundry (per person)", litres: laundry },
      ...(i.garden ? [{ label: "Garden", litres: garden }] : []),
      ...(i.carWash ? [{ label: "Car wash", litres: car }] : []),
    ],
  };
}

function tips(i: Inputs, lpcd: number): string[] {
  const out: string[] = [];
  if (i.bathing === "shower-long") out.push("Cut shower time to 5 min — saves ~50 L/person/day.");
  if (i.flushing === "single") out.push("Retrofit a dual-flush cistern — saves ~20 L/person/day.");
  if (i.garden) out.push("Water plants after 6pm with a watering can — 40% less evaporation.");
  if (i.carWash) out.push("Use a bucket+sponge, not a hose — saves ~80 L per wash.");
  if (lpcd > PUNE_AVG_LPCD) out.push(`You're using ${lpcd - PUNE_AVG_LPCD} L above the Pune average — review the biggest bar above.`);
  if (out.length === 0) out.push("You're already below Pune's average. Nice work — push household awareness next.");
  return out.slice(0, 3);
}

export default function PersonalCalc() {
  const [i, setI] = useState<Inputs>({
    people: 4,
    bathing: "shower-short",
    laundryLoads: 4,
    garden: false,
    carWash: false,
    flushing: "dual",
  });

  const { lpcd, breakdown } = useMemo(() => estimateLPCD(i), [i]);
  const householdDaily = lpcd * i.people;
  const sharePct = Math.round((lpcd / PUNE_AVG_LPCD) * 100);
  const cityDailyTMC = (lpcd * PUNE_POPULATION) / 28.317e9;
  const daysIfEveryone = Math.round(STORAGE_TMC_FOR_DRINKING / Math.max(cityDailyTMC, DAILY_DEMAND_TMC * 0.5));
  const myTips = tips(i, lpcd);
  const maxBar = Math.max(...breakdown.map((b) => b.litres));

  return (
    <div className="glass rounded-3xl p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grad-aqua flex h-10 w-10 items-center justify-center rounded-xl glow">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold">Your Personal Water Footprint</h3>
          <p className="text-xs text-muted-foreground">CPHEEO + BIS norms · estimates household LPCD vs Pune average</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">People in household</label>
              <span className="font-mono text-sm tabular-nums">{i.people}</span>
            </div>
            <input type="range" min={1} max={10} value={i.people} onChange={(e) => setI({ ...i, people: +e.target.value })} className="w-full accent-aqua" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Bathing style</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { v: "bucket", l: "Bucket" },
                { v: "shower-short", l: "Shower (5 min)" },
                { v: "shower-long", l: "Shower (15 min)" },
              ].map((o) => (
                <button key={o.v}
                  onClick={() => setI({ ...i, bathing: o.v as Inputs["bathing"] })}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${i.bathing === o.v ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground hover:bg-card/60"}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Laundry loads / week</label>
              <span className="font-mono text-sm tabular-nums">{i.laundryLoads}</span>
            </div>
            <input type="range" min={0} max={14} value={i.laundryLoads} onChange={(e) => setI({ ...i, laundryLoads: +e.target.value })} className="w-full accent-aqua" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Toilet flush type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: "single", l: "Single flush" },
                { v: "dual", l: "Dual flush" },
              ].map((o) => (
                <button key={o.v}
                  onClick={() => setI({ ...i, flushing: o.v as Inputs["flushing"] })}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${i.flushing === o.v ? "border-aqua bg-aqua/15 text-aqua" : "border-border text-muted-foreground hover:bg-card/60"}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card/40 p-3 text-sm">
              <input type="checkbox" checked={i.garden} onChange={(e) => setI({ ...i, garden: e.target.checked })} className="accent-aqua" />
              Garden / plants
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card/40 p-3 text-sm">
              <input type="checkbox" checked={i.carWash} onChange={(e) => setI({ ...i, carWash: e.target.checked })} className="accent-aqua" />
              Car wash (weekly)
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="grad-storm relative overflow-hidden rounded-2xl p-6">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.2em] text-aqua">Your usage</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold tabular-nums text-white">{lpcd}</span>
              <span className="font-display text-lg text-aqua">L / person / day</span>
            </div>
            <div className="mt-1 text-sm text-white/70">≈ {householdDaily.toLocaleString("en-IN")} L/day for {i.people} {i.people === 1 ? "person" : "people"}</div>

            {/* Share vs Pune avg */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/70">
                <span>Your share vs Pune avg ({PUNE_AVG_LPCD} L)</span>
                <span className={`font-mono font-semibold ${sharePct > 100 ? "text-danger" : "text-safe"}`}>{sharePct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${sharePct > 100 ? "bg-danger" : "bg-safe"}`} style={{ width: `${Math.min(sharePct, 200) / 2}%` }} />
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-5 space-y-1.5">
              {breakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <span>{b.label}</span>
                    <span className="font-mono tabular-nums">{b.litres} L</span>
                  </div>
                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-aqua" style={{ width: `${(b.litres / maxBar) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
                <div className="text-[10px] uppercase tracking-wider text-white/60">If all of Pune used like you</div>
                <div className="mt-1 font-display text-2xl font-bold tabular-nums text-aqua">{daysIfEveryone}<span className="ml-1 text-xs text-white/60">days of water</span></div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
                <div className="text-[10px] uppercase tracking-wider text-white/60">Your household / year</div>
                <div className="mt-1 font-display text-2xl font-bold tabular-nums text-monsoon">{Math.round((householdDaily * 365) / 1000).toLocaleString("en-IN")}<span className="ml-1 text-xs text-white/60">kL</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {myTips.map((t, idx) => (
          <div key={idx} className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-aqua/15 text-aqua">
              {idx === 0 ? <ShowerHead className="h-4 w-4" /> : idx === 1 ? <Droplets className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <p className="text-sm leading-relaxed">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
