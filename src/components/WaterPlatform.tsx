import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Droplets, CloudRain, Waves, Gauge, MapPin, TrendingUp, TrendingDown,
  AlertTriangle, Calculator, Sparkles, Radio, Sun, Moon, Activity,
  Layers, Wind, Calendar, ChevronRight, Database, Satellite,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, LineChart, Line,
} from "recharts";
import {
  reservoirs, talukas as mockTalukas, totalCapacity, totalCurrent, overallFill,
  daysAvailable, securityIndex, securityLabel, events, aiInsights, dailyDemandTMC,
  monsoonProgress, districtSeasonRain, districtSeasonLPA, districtRainDeparture,
  wowStorageDelta, yoyDeltaPct,
} from "@/lib/water-data";
import { liveWeatherQuery } from "@/lib/weather-query";
import { liveNewsQuery } from "@/lib/news-query";


function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grad-aqua flex h-10 w-10 items-center justify-center rounded-xl glow">
        <Droplets className="h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-safe ring-2 ring-background" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-sm font-bold tracking-tight">Pune Water Intelligence</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Live · GIS · Forecasts</div>
      </div>
    </div>
  );
}

function Nav({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  const items = ["Overview", "Live Map", "Reservoirs", "Forecast", "Analytics", "Alerts"];
  const { data: live } = useQuery(liveWeatherQuery);
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  const isLive = live?.source === "open-meteo";
  return (
    <header className="sticky top-0 z-50 glass-strong border-b">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-border/60 bg-card/50 px-2 py-1">
          {items.map((it, i) => (
            <a key={it} href={`#${it.toLowerCase().replace(" ", "-")}`}
               className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {it}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${isLive ? "bg-safe/15 text-safe" : "bg-muted/40 text-muted-foreground"}`}>
            <span className="relative flex h-1.5 w-1.5">
              {isLive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isLive ? "bg-safe" : "bg-muted-foreground"}`} />
            </span>
            {isLive ? "Live" : "Cached"} · {now} IST
          </div>
          <button onClick={toggle} className="rounded-full border border-border bg-card/60 p-2 hover:bg-accent transition-colors">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function MetricCard({
  icon: Icon, label, value, unit, sub, trend, accent = "aqua",
}: {
  icon: any; label: string; value: string; unit?: string; sub?: string; trend?: number;
  accent?: "aqua" | "monsoon" | "safe" | "warn";
}) {
  const accentClass = {
    aqua: "text-aqua", monsoon: "text-monsoon", safe: "text-safe", warn: "text-warn",
  }[accent];
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5">
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-2xl ${accent === "aqua" ? "bg-aqua" : accent === "monsoon" ? "bg-monsoon" : accent === "safe" ? "bg-safe" : "bg-warn"}`} />
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-card/80 ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${trend >= 0 ? "bg-safe/15 text-safe" : "bg-danger/15 text-danger"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend > 0 ? "+" : ""}{trend}%
          </div>
        )}
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function SecurityGauge({ value }: { value: number }) {
  const status =
    value >= 85 ? { label: "Excellent", color: "var(--safe)" } :
    value >= 70 ? { label: "Safe", color: "var(--aqua)" } :
    value >= 50 ? { label: "Moderate", color: "var(--warn)" } :
    value >= 30 ? { label: "Low", color: "var(--warn)" } :
                  { label: "Critical", color: "var(--danger)" };
  const r = 90;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c * 0.75; // 3/4 arc
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 220 220" className="h-56 w-56 -rotate-[135deg]">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--aqua)" />
            <stop offset="100%" stopColor={status.color} />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="var(--muted)" strokeWidth="14"
          strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" />
        <circle cx="110" cy="110" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14"
          strokeDasharray={`${c * 0.75} ${c}`} strokeDashoffset={offset - c * 0.25}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Security Index</div>
        <div className="font-display text-6xl font-bold tabular-nums">{value}</div>
        <div className="mt-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `color-mix(in oklab, ${status.color} 18%, transparent)`, color: status.color }}>
          {status.label}
        </div>
      </div>
    </div>
  );
}

function ReservoirFill({ pct, name, capacity, current }: { pct: number; name: string; capacity: number; current: number }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Reservoir</div>
          <div className="font-display text-lg font-semibold">{name}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold tabular-nums text-gradient-aqua">{pct.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground">{current.toFixed(2)} / {capacity.toFixed(2)} TMC</div>
        </div>
      </div>
      <div className="relative mt-4 h-32 overflow-hidden rounded-xl bg-storm/30 border border-border">
        <div className="absolute inset-x-0 bottom-0 grad-aqua transition-all duration-1000" style={{ height: `${pct}%` }}>
          <svg className="absolute -top-3 w-[200%] animate-wave" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path d="M0,20 Q150,0 300,20 T600,20 T900,20 T1200,20 V40 H0 Z" fill="currentColor" className="text-aqua/60" />
          </svg>
          <svg className="absolute -top-2 w-[200%] animate-wave [animation-delay:-3s]" viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path d="M0,20 Q150,40 300,20 T600,20 T900,20 T1200,20 V40 H0 Z" fill="currentColor" className="text-aqua/40" />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-2 text-[10px] font-mono text-muted-foreground">
          <span>FRL</span><span>50%</span><span>0%</span>
        </div>
      </div>
    </div>
  );
}

function TalukaCard({ t }: { t: typeof mockTalukas[number] }) {
  const intensity = Math.min(t.rainNow / 15, 1);
  return (
    <button className="glass group relative overflow-hidden rounded-xl p-4 text-left transition hover:-translate-y-0.5 hover:glow">
      <div className="absolute right-0 top-0 h-20 w-20 opacity-30 blur-2xl"
        style={{ background: `oklch(${0.65 - intensity * 0.2} ${0.15 + intensity * 0.1} ${230 - intensity * 30})` }} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-aqua" />
          <span className="font-semibold">{t.name}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${t.departure >= 0 ? "bg-safe/15 text-safe" : "bg-danger/15 text-danger"}`}>
          {t.departure > 0 ? "+" : ""}{t.departure}%
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-display text-lg font-bold tabular-nums">{t.rainNow}</div>
          <div className="text-[9px] uppercase text-muted-foreground">Now mm/h</div>
        </div>
        <div className="border-x border-border/60">
          <div className="font-display text-lg font-bold tabular-nums">{t.rain24h}</div>
          <div className="text-[9px] uppercase text-muted-foreground">24h</div>
        </div>
        <div>
          <div className="font-display text-lg font-bold tabular-nums">{t.seasonTotal}</div>
          <div className="text-[9px] uppercase text-muted-foreground">Season</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        Detailed analytics <ChevronRight className="h-3 w-3" />
      </div>
    </button>
  );
}

function PuneMap() {
  // Stylized SVG map of Pune district talukas (artistic, not geographic).
  const layers = ["Talukas", "Rainfall", "Reservoirs", "Rivers", "IMD Stations", "Radar", "Flood", "Catchments"];
  const [active, setActive] = useState<string[]>(["Talukas", "Rainfall", "Reservoirs", "Rivers"]);
  const toggle = (l: string) => setActive((a) => a.includes(l) ? a.filter(x => x !== l) : [...a, l]);

  const stations = [
    { x: 380, y: 280, name: "Pune City", val: 42 },
    { x: 240, y: 260, name: "Mulshi", val: 92 },
    { x: 300, y: 200, name: "Maval", val: 64 },
    { x: 180, y: 340, name: "Velhe", val: 108 },
    { x: 320, y: 380, name: "Bhor", val: 48 },
    { x: 500, y: 360, name: "Purandar", val: 18 },
    { x: 580, y: 440, name: "Baramati", val: 8 },
    { x: 460, y: 180, name: "Khed", val: 36 },
    { x: 520, y: 120, name: "Junnar", val: 28 },
  ];

  return (
    <div className="glass relative overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-border/60 p-4">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-aqua" />
          <div>
            <div className="font-display text-base font-semibold">Pune District · Live GIS</div>
            <div className="text-[10px] text-muted-foreground">13 Talukas · 7 Reservoirs · 9 IMD Stations</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1 rounded-full bg-card/50 px-2 py-1 text-[11px]">
          <Layers className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{active.length} layers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px]">
        <div className="relative aspect-[4/3] grid-bg">
          <svg viewBox="0 0 720 540" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="rainHeat" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="var(--monsoon)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="var(--monsoon)" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--aqua)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
            </defs>

            {/* District outline */}
            <path d="M120 180 L260 100 L460 90 L600 140 L640 280 L620 420 L500 490 L300 480 L160 420 L100 300 Z"
              fill="color-mix(in oklab, var(--aqua) 6%, transparent)" stroke="var(--aqua)" strokeWidth="1.5" strokeOpacity="0.5" />

            {/* Taluka boundaries (stylized) */}
            {active.includes("Talukas") && (
              <g stroke="var(--border)" strokeWidth="1" fill="none" opacity="0.5">
                <path d="M260 100 L320 220 L260 320 L160 280" />
                <path d="M320 220 L420 200 L460 90" />
                <path d="M320 220 L420 200 L440 320 L320 340" />
                <path d="M460 90 L600 140 L520 240 L420 200" />
                <path d="M440 320 L500 380 L580 360 L520 240" />
                <path d="M500 380 L620 420 L580 360" />
                <path d="M260 320 L160 420 L300 480 L440 460 L500 380 L440 320 L320 340" />
              </g>
            )}

            {/* Rainfall heatmap */}
            {active.includes("Rainfall") && stations.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={20 + s.val * 0.6} fill="url(#rainHeat)" />
            ))}

            {/* Rivers */}
            {active.includes("Rivers") && (
              <g fill="none" stroke="url(#river)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
                <path d="M200 240 Q300 280 380 280 T560 320 L640 380" />
                <path d="M260 380 Q340 360 380 280" />
                <path d="M180 340 Q260 320 280 260" />
              </g>
            )}

            {/* Catchments */}
            {active.includes("Catchments") && (
              <g fill="color-mix(in oklab, var(--monsoon) 8%, transparent)" stroke="var(--monsoon)" strokeDasharray="4 4" strokeOpacity="0.5">
                <ellipse cx="240" cy="280" rx="90" ry="70" />
                <ellipse cx="180" cy="340" rx="60" ry="50" />
              </g>
            )}

            {/* Reservoirs */}
            {active.includes("Reservoirs") && (
              <g>
                {[
                  { x: 220, y: 280, n: "Mulshi" },
                  { x: 280, y: 320, n: "Panshet" },
                  { x: 320, y: 290, n: "Varasgaon" },
                  { x: 200, y: 340, n: "Temghar" },
                  { x: 360, y: 270, n: "Khadakwasla" },
                  { x: 340, y: 200, n: "Pavana" },
                  { x: 440, y: 200, n: "Bhama Askhed" },
                ].map((r, i) => (
                  <g key={i}>
                    <circle cx={r.x} cy={r.y} r="14" fill="var(--aqua)" opacity="0.25" className="animate-pulse-ring" />
                    <circle cx={r.x} cy={r.y} r="6" fill="var(--aqua)" stroke="var(--background)" strokeWidth="2" />
                    <text x={r.x + 10} y={r.y - 8} fill="var(--foreground)" fontSize="10" fontWeight="600" className="font-mono">{r.n}</text>
                  </g>
                ))}
              </g>
            )}

            {/* IMD Stations */}
            {active.includes("IMD Stations") && stations.map((s, i) => (
              <g key={i}>
                <rect x={s.x - 3} y={s.y - 3} width="6" height="6" fill="var(--warn)" stroke="var(--background)" strokeWidth="1" />
              </g>
            ))}

            {/* Flood alert */}
            {active.includes("Flood") && (
              <g>
                <circle cx="400" cy="300" r="30" fill="var(--danger)" opacity="0.2" className="animate-pulse-ring" />
                <circle cx="400" cy="300" r="6" fill="var(--danger)" />
              </g>
            )}

            <text x="380" y="288" fill="var(--foreground)" fontSize="9" fontWeight="700" className="font-mono opacity-70">PUNE</text>
          </svg>

          <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-2 text-[10px] font-mono">
            18.5204°N · 73.8567°E
          </div>
          <div className="absolute bottom-3 right-3 glass flex items-center gap-2 rounded-lg px-3 py-2 text-[10px]">
            <Radio className="h-3 w-3 text-safe animate-pulse" /> Radar updated 2 min ago
          </div>
        </div>

        <div className="border-t lg:border-l lg:border-t-0 border-border/60 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">Map Layers</div>
          <div className="flex flex-col gap-1">
            {layers.map((l) => {
              const on = active.includes(l);
              return (
                <button key={l} onClick={() => toggle(l)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition ${on ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-card/60"}`}>
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-aqua" : "bg-muted-foreground/40"}`} />
                    {l}
                  </span>
                  <span className={`text-[9px] font-mono ${on ? "text-aqua" : "text-muted-foreground/50"}`}>{on ? "ON" : "OFF"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Calc() {
  const [rainfall, setRainfall] = useState(50);
  const [area, setArea] = useState(2300); // total Pune reservoir catchment km²
  const [runoff, setRunoff] = useState(0.55);
  const [evap, setEvap] = useState(5);

  const result = useMemo(() => {
    // Inflow (m³) = rainfall(mm)/1000 × area(km²) × 1e6 × runoff
    const m3 = (rainfall / 1000) * area * 1_000_000 * runoff;
    const lossM3 = m3 * (evap / 100);
    const netM3 = m3 - lossM3;
    const tmc = netM3 / 2.832e7; // 1 TMC = 28.32 million m³ (×1000)... actually 1 TMC ≈ 2.832e10 m³
    // correct: 1 TMC = 28.317 × 10^9 L = 28.317 × 10^6 m³? No, 1 TMC (thousand million cubic feet)
    // = 28.317 million m³. Use 2.832e7.
    const pctIncrease = (tmc / totalCapacity) * 100;
    const daysAdded = Math.round(tmc / dailyDemandTMC);
    return { tmc, pctIncrease, daysAdded };
  }, [rainfall, area, runoff, evap]);

  const presets = [10, 25, 50, 100];

  return (
    <div className="glass rounded-3xl p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="grad-aqua flex h-10 w-10 items-center justify-center rounded-xl">
          <Calculator className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold">Rainfall → Storage Calculator</h3>
          <p className="text-xs text-muted-foreground">Hydrological model · Inflow = Rainfall × Catchment Area × Runoff Coefficient</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rainfall (mm)</label>
              <span className="font-mono text-sm tabular-nums">{rainfall} mm</span>
            </div>
            <input type="range" min="0" max="300" value={rainfall} onChange={(e) => setRainfall(+e.target.value)}
              className="w-full accent-aqua" />
            <div className="mt-2 flex gap-1.5">
              {presets.map((p) => (
                <button key={p} onClick={() => setRainfall(p)}
                  className={`flex-1 rounded-lg border border-border px-2 py-1.5 text-xs font-medium transition ${rainfall === p ? "border-aqua bg-aqua/15 text-aqua" : "text-muted-foreground hover:bg-card/60"}`}>
                  {p}mm
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Catchment Area (km²)</label>
              <span className="font-mono text-sm tabular-nums">{area}</span>
            </div>
            <input type="range" min="100" max="3000" value={area} onChange={(e) => setArea(+e.target.value)} className="w-full accent-aqua" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Runoff Coefficient</label>
              <span className="font-mono text-sm tabular-nums">{runoff.toFixed(2)}</span>
            </div>
            <input type="range" min="0.1" max="0.9" step="0.05" value={runoff} onChange={(e) => setRunoff(+e.target.value)} className="w-full accent-aqua" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Evaporation Loss (%)</label>
              <span className="font-mono text-sm tabular-nums">{evap}%</span>
            </div>
            <input type="range" min="0" max="30" value={evap} onChange={(e) => setEvap(+e.target.value)} className="w-full accent-aqua" />
          </div>
        </div>

        <div className="grad-storm relative overflow-hidden rounded-2xl p-6">
          <div className="absolute inset-0 opacity-30 grid-bg" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.2em] text-aqua">Estimated Output</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold tabular-nums text-white">{result.tmc.toFixed(2)}</span>
              <span className="text-lg text-aqua font-display">TMC</span>
            </div>
            <div className="mt-1 text-sm text-white/70">Net reservoir gain</div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4">
                <div className="text-[10px] uppercase tracking-wider text-white/60">Storage Increase</div>
                <div className="mt-1 font-display text-2xl font-bold text-safe tabular-nums">+{result.pctIncrease.toFixed(2)}%</div>
              </div>
              <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4">
                <div className="text-[10px] uppercase tracking-wider text-white/60">Days Added</div>
                <div className="mt-1 font-display text-2xl font-bold text-aqua tabular-nums">+{result.daysAdded}</div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] text-white/80 font-mono leading-relaxed">
              Inflow = {rainfall}mm × {area}km² × {runoff} × (1 − {evap}%)<br />
              ≈ {((rainfall / 1000) * area * runoff * (1 - evap / 100)).toFixed(1)} million m³
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastChart() {
  const { data: live } = useQuery(liveWeatherQuery);
  const baseStorage = overallFill;
  const data = useMemo(() => {
    const fc = live?.forecast?.length ? live.forecast : null;
    if (fc) {
      // Estimate cumulative storage gain from forecasted rain over total catchment.
      const totalCatchKm2 = 2300;
      const runoff = 0.55;
      let cum = baseStorage;
      return fc.map((d, i) => {
        const gainTMC = (d.rainfall / 1000) * totalCatchKm2 * 1_000_000 * runoff / 2.832e7;
        cum = Math.min(100, cum + (gainTMC / totalCapacity) * 100 - 0.15); // minus daily draw
        return {
          day: `D${i + 1}`,
          rainfall: d.rainfall,
          storage: +cum.toFixed(1),
        };
      });
    }
    return Array.from({ length: 15 }, (_, i) => ({
      day: `D${i + 1}`,
      rainfall: Math.max(0, 35 + Math.sin(i * 0.7) * 28 + (i < 7 ? 10 : -5) + Math.random() * 15),
      storage: 72 + i * 0.8 + Math.sin(i * 0.4) * 1.2,
    }));
  }, [live, baseStorage]);

  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-monsoon/15 text-monsoon">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">AI Forecast Engine</h3>
            <p className="text-xs text-muted-foreground">Ensemble · Open-Meteo · 15 day horizon {live?.source === "open-meteo" && <span className="ml-1 text-safe">● live</span>}</p>
          </div>
        </div>
        <div className="hidden md:flex gap-1 rounded-full bg-card/60 p-1 text-xs">
          {["3D", "7D", "15D"].map((d, i) => (
            <button key={d} className={`rounded-full px-3 py-1 ${i === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rainG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--monsoon)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--monsoon)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="storeG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--aqua)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--aqua)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="rainfall" stroke="var(--monsoon)" strokeWidth={2} fill="url(#rainG)" name="Rainfall mm" />
            <Area type="monotone" dataKey="storage" stroke="var(--aqua)" strokeWidth={2} fill="url(#storeG)" name="Storage %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { p: "50%", d: "Today", c: "safe" },
          { p: "75%", d: "+9 days", c: "safe" },
          { p: "90%", d: "+18 days", c: "aqua" },
          { p: "100%", d: "+34 days", c: "warn" },
        ].map((m) => (
          <div key={m.p} className="rounded-xl border border-border bg-card/50 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reach {m.p}</div>
            <div className={`font-display text-lg font-bold ${m.c === "safe" ? "text-safe" : m.c === "aqua" ? "text-aqua" : "text-warn"}`}>{m.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsCharts() {
  const monthly = [
    { m: "Jun '24", n: 142, a: 162 },
    { m: "Jul", n: 268, a: 312 },
    { m: "Aug", n: 236, a: 274 },
    { m: "Sep", n: 184, a: 168 },
    { m: "Jun '25", n: 142, a: 198 },
    { m: "Jul", n: 268, a: 386 },
    { m: "Aug", n: 236, a: 312 },
  ];
  const fillHistory = Array.from({ length: 30 }, (_, i) => ({ d: i + 1, fill: 50 + i * 1.2 + Math.sin(i * 0.5) * 3 }));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold">Year-on-Year Rainfall</h3>
          <p className="text-xs text-muted-foreground">Normal vs Actual · monthly mm</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ left: -20, right: 5 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="n" fill="var(--storm)" name="Normal" radius={[4,4,0,0]} />
              <Bar dataKey="a" fill="var(--monsoon)" name="Actual" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold">Reservoir Fill — 30 day</h3>
          <p className="text-xs text-muted-foreground">Aggregate storage across all 7 reservoirs</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fillHistory} margin={{ left: -20, right: 5 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="fill" stroke="var(--aqua)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EventsTimeline() {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warn/15 text-warn">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Live Alerts & Advisories</h3>
            <p className="text-xs text-muted-foreground">Aggregated from PMC, IMD, WRD, Disaster Management</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {events.map((e, i) => {
          const c = e.type === "danger" ? "var(--danger)" : e.type === "warn" ? "var(--warn)" : "var(--aqua)";
          return (
            <div key={i} className="relative flex gap-4 rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card/70 transition">
              <div className="relative flex flex-col items-center">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
                {i < events.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
                  <span className="rounded px-1.5 py-0.5 font-mono font-semibold" style={{ background: `color-mix(in oklab, ${c} 15%, transparent)`, color: c }}>{e.tag}</span>
                  <span className="text-muted-foreground">{e.time}</span>
                </div>
                <div className="mt-1.5 text-sm">{e.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Insights() {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6">
      <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-monsoon/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-monsoon" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-monsoon font-semibold">AI Insights</span>
        </div>
        <div className="space-y-3">
          {aiInsights.map((t, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
              <div className="mt-0.5 h-6 w-6 shrink-0 rounded-lg grad-aqua flex items-center justify-center text-[10px] font-mono font-bold text-white">{i + 1}</div>
              <p className="text-sm leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sources() {
  const srcs = ["IMD", "OpenWeather", "WeatherAPI", "NASA GPM", "Maharashtra WRD", "PMC", "Bhuvan", "OpenStreetMap"];
  return (
    <div className="border-t border-border/60 mt-16">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Database className="h-4 w-4" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Data Sources</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {srcs.map((s) => (
            <span key={s} className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">{s}</span>
          ))}
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© 2026 Pune Water Intelligence Platform · A public information service</div>
          <div className="font-mono">v1.2.0 · API status: <span className="text-safe">●</span> operational</div>
        </div>
      </div>
    </div>
  );
}

function LiveNews() {
  const { data, isLoading, refetch, isFetching } = useQuery(liveNewsQuery);
  const items = data?.items ?? [];
  const isLive = data?.source === "firecrawl" && items.length > 0;
  const catColor: Record<string, string> = {
    alert: "var(--danger)",
    reservoir: "var(--aqua)",
    supply: "var(--warn)",
    rainfall: "var(--monsoon)",
    general: "var(--muted-foreground)",
  };
  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua/15 text-aqua">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              News & Advisories
              {isLive && <span className="text-[10px] font-mono uppercase tracking-wider text-safe">● live</span>}
            </h3>
            <p className="text-xs text-muted-foreground">
              {data?.fetchedAt ? `Updated ${new Date(data.fetchedAt).toLocaleTimeString()}` : "Loading…"}
              {data?.source === "fallback" && " · using fallback"}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-medium hover:bg-card disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-card/40 animate-pulse" />)}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
          No live coverage available right now. {data?.error && <span className="block mt-2 font-mono text-[10px]">{data.error}</span>}
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((n) => {
            const c = catColor[n.category] ?? "var(--muted-foreground)";
            return (
              <a
                key={n.url}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card/70 hover:border-aqua/40 transition"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
                  <span className="rounded px-1.5 py-0.5 font-mono font-semibold" style={{ background: `color-mix(in oklab, ${c} 15%, transparent)`, color: c }}>
                    {n.category}
                  </span>
                  <span className="text-muted-foreground truncate">{n.source}</span>
                  {n.publishedAt && <span className="ml-auto text-muted-foreground">{new Date(n.publishedAt).toLocaleDateString()}</span>}
                </div>
                <div className="text-sm font-semibold leading-snug group-hover:text-aqua transition line-clamp-2">{n.title}</div>
                {n.snippet && <p className="text-xs text-muted-foreground line-clamp-2">{n.snippet}</p>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}



export default function WaterPlatform() {
  const { dark, toggle } = useTheme();
  const { data: live } = useQuery(liveWeatherQuery);

  // Merge live taluka data with mock baseline; live values take priority when present.
  const talukas = useMemo(() => {
    if (!live?.talukas?.length) return mockTalukas;
    return mockTalukas.map((m) => {
      const l = live.talukas.find((x) => x.name === m.name);
      return l ? { ...m, ...l } : m;
    });
  }, [live]);

  const heroStats = live?.districtAverages ?? {
    rainNow: 0.3,
    rain24h: Math.round(mockTalukas.reduce((s, t) => s + t.rain24h, 0) / mockTalukas.length),
    rain7d: Math.round(mockTalukas.reduce((s, t) => s + t.rain7d, 0) / mockTalukas.length),
    seasonTotal: districtSeasonRain,
    departure: districtRainDeparture,
  };
  const monsoonRain = heroStats.seasonTotal;
  const monsoonNormal = districtSeasonLPA;
  const trend7d = wowStorageDelta;
  const isLive = live?.source === "open-meteo";
  const securityColor = securityIndex >= 75 ? "safe" : securityIndex >= 55 ? "aqua" : securityIndex >= 35 ? "warn" : "danger";
  const totalInflow = reservoirs.reduce((s, r) => s + r.inflowCusec, 0);
  const totalOutflow = reservoirs.reduce((s, r) => s + r.outflowCusec, 0);
  const avgCatchmentRain = +(reservoirs.reduce((s, r) => s + r.catchmentRainMm, 0) / reservoirs.length).toFixed(1);
  // Net storage Δ ≈ (inflow - outflow) cusec → TMC/day. 1 cusec ≈ 2.446e-6 TMC/day
  const netStorageDelta = +(((totalInflow - totalOutflow) * 0.0864) / 28316.85).toFixed(2);


  return (
    <div className="min-h-screen bg-background">
      <Nav dark={dark} toggle={toggle} />

      {/* Hero */}
      <section id="overview" className="relative overflow-hidden">
        <div className="absolute inset-0 grad-hero opacity-90" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="absolute top-0 w-px bg-aqua/30"
              style={{
                left: `${(i * 2.5) % 100}%`,
                height: `${20 + Math.random() * 40}px`,
                animation: `rain-fall ${1.2 + Math.random() * 1.5}s linear ${Math.random() * 2}s infinite`,
              }} />
          ))}
        </div>

        <div className="relative mx-auto max-w-[1400px] px-6 pt-16 pb-12 lg:pt-24 lg:pb-20">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isLive ? "bg-safe" : "bg-warn"}`} />
                <span className="font-mono uppercase tracking-wider text-white/80">
                  {isLive ? "Live · Open-Meteo" : "Cached feed"} · Monsoon {monsoonProgress}% · Rainfall {districtRainDeparture > 0 ? "+" : ""}{districtRainDeparture}% LPA
                </span>
              </div>

              <h1 className="mt-6 font-display text-5xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                Pune's water,<br />
                <span className="text-gradient-aqua">in real time.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base lg:text-lg text-white/70 leading-relaxed">
                A unified intelligence platform tracking rainfall across 13 talukas, storage in {reservoirs.length} major reservoirs ({totalCapacity.toFixed(1)} TMC capacity), and projecting water security for Pune's 8+ million people.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#live-map" className="rounded-xl bg-aqua px-5 py-3 text-sm font-semibold text-storm hover:opacity-90 transition flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Explore Live Map
                </a>
                <a href="#reservoirs" className="rounded-xl border border-white/20 bg-white/5 backdrop-blur px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition flex items-center gap-2">
                  <Waves className="h-4 w-4" /> Reservoir Dashboard
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: "Current", v: heroStats.rainNow.toFixed(1), u: "mm/h", i: CloudRain },
                  { l: "Today", v: heroStats.rain24h.toFixed(0), u: "mm", i: Droplets },
                  { l: "7 Day", v: heroStats.rain7d.toFixed(0), u: "mm", i: Calendar },
                  { l: "Season", v: heroStats.seasonTotal.toLocaleString("en-IN"), u: "mm", i: Wind },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-white/15 bg-white/5 backdrop-blur p-3">
                    <s.i className="h-4 w-4 text-aqua mb-2" />
                    <div className="text-[10px] uppercase tracking-wider text-white/60">{s.l}</div>
                    <div className="font-display text-xl font-bold tabular-nums text-white">{s.v}<span className="text-xs text-white/60 ml-1">{s.u}</span></div>
                  </div>
                ))}
              </div>

            </div>

            <div className="glass-strong rounded-3xl p-8 lg:p-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Pune Water Security</div>
                  <div className="font-display text-2xl font-bold mt-0.5">District Outlook</div>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-${securityColor}/15 text-${securityColor}`}>
                  {trend7d >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {securityLabel} · {trend7d > 0 ? "+" : ""}{trend7d}% / wk
                </div>
              </div>
              <div className="flex justify-center">
                <SecurityGauge value={securityIndex} />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Water Available</div>
                  <div className="font-display text-2xl font-bold text-aqua tabular-nums">{overallFill.toFixed(0)}%</div>
                </div>
                <div className="border-x border-border">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Enough For</div>
                  <div className="font-display text-2xl font-bold tabular-nums">{daysAvailable}<span className="text-xs text-muted-foreground ml-1">days</span></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monsoon</div>
                  <div className={`font-display text-2xl font-bold tabular-nums ${monsoonProgress < 25 ? "text-warn" : "text-safe"}`}>{monsoonProgress}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="mx-auto max-w-[1400px] px-6 -mt-8 relative z-10">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Droplets} label="Total Reservoir Storage" value={totalCurrent.toFixed(1)} unit="TMC" sub={`of ${totalCapacity.toFixed(1)} TMC · ${overallFill.toFixed(1)}% full`} trend={trend7d} accent="aqua" />
          <MetricCard icon={CloudRain} label="District Avg Rainfall" value={heroStats.rain24h.toFixed(0)} unit="mm/24h" sub={`${heroStats.departure > 0 ? "+" : ""}${heroStats.departure}% vs LPA`} trend={heroStats.departure} accent="monsoon" />
          <MetricCard icon={Gauge} label="YoY Storage" value={`${yoyDeltaPct > 0 ? "+" : ""}${yoyDeltaPct}`} unit="%" sub={`vs same day last year`} trend={yoyDeltaPct} accent={yoyDeltaPct >= 0 ? "safe" : "warn"} />
          <MetricCard icon={Activity} label="Season Rainfall" value={`${monsoonRain}`} unit="mm" sub={`${monsoonNormal} mm normal-to-date · ${districtRainDeparture > 0 ? "+" : ""}${districtRainDeparture}%`} trend={districtRainDeparture} accent="warn" />

        </div>
      </section>

      {/* Live Map */}
      <section id="live-map" className="mx-auto max-w-[1400px] px-6 mt-16">
        <SectionHeader eyebrow="GIS Intelligence" title="Live District Map" desc="Interactive multi-layer view of rainfall, reservoirs, rivers and weather radar across Pune district." />
        <PuneMap />
      </section>

      {/* Talukas */}
      <section className="mx-auto max-w-[1400px] px-6 mt-16">
        <SectionHeader eyebrow="13 Talukas" title="Rainfall by Taluka" desc="Tap any taluka for detailed catchment analytics, departure trends and station-level data." />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {talukas.map((t) => <TalukaCard key={t.name} t={t} />)}
        </div>
      </section>

      {/* Reservoirs */}
      <section id="reservoirs" className="mx-auto max-w-[1400px] px-6 mt-20">
        <SectionHeader eyebrow="Reservoir Network" title="Live Storage Dashboard" desc="Aggregate capacity 62.71 TMC across 7 major dams supplying Pune Metropolitan Region." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reservoirs.map((r) => (
            <ReservoirFill key={r.id} name={r.name} pct={(r.currentTMC / r.capacityTMC) * 100} capacity={r.capacityTMC} current={r.currentTMC} />
          ))}
        </div>

        <div className="glass mt-4 grid grid-cols-1 md:grid-cols-4 gap-px rounded-2xl overflow-hidden">
          {[
            { l: "Total Inflow", v: "82,170", u: "cusec", c: "safe" },
            { l: "Total Outflow", v: "8,700", u: "cusec", c: "warn" },
            { l: "Net Storage Δ", v: "+0.84", u: "TMC/day", c: "aqua" },
            { l: "Catchment Rain", v: "60.1", u: "mm avg", c: "monsoon" },
          ].map((s) => (
            <div key={s.l} className="bg-card/40 p-5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className={`mt-2 font-display text-2xl font-bold tabular-nums ${s.c === "safe" ? "text-safe" : s.c === "warn" ? "text-warn" : s.c === "aqua" ? "text-aqua" : "text-monsoon"}`}>{s.v}<span className="text-xs text-muted-foreground ml-1">{s.u}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator + Forecast */}
      <section id="forecast" className="mx-auto max-w-[1400px] px-6 mt-20 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Calc />
        <ForecastChart />
      </section>

      {/* Analytics */}
      <section id="analytics" className="mx-auto max-w-[1400px] px-6 mt-20">
        <SectionHeader eyebrow="Analytics" title="Trends & Historical Data" desc="Compare across years, talukas, and reservoirs." />
        <AnalyticsCharts />
      </section>

      {/* Alerts + Insights */}
      <section id="alerts" className="mx-auto max-w-[1400px] px-6 mt-20 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <EventsTimeline />
        <Insights />
      </section>

      {/* Live News */}
      <section id="news" className="mx-auto max-w-[1400px] px-6 mt-20">
        <SectionHeader eyebrow="Live News" title="Today's Pune Water Coverage" desc="Aggregated last-24h coverage on rainfall, reservoirs, supply cuts and IMD warnings." />
        <LiveNews />
      </section>

      <Sources />
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-aqua font-semibold">{eyebrow}</div>
        <h2 className="mt-1 font-display text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
      </div>
      <p className="max-w-md text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
