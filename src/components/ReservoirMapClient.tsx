import { reservoirs } from "@/lib/water-data";

/**
 * Lightweight non-leaflet reservoir overview.
 *
 * The interactive leaflet map was pulling `react-leaflet` / `@react-leaflet/core`
 * into the SSR module graph, which touches `window` at import-time and crashed
 * every server-rendered page (HTTP 500). Until we move the map to a fully
 * client-only route, render a static visual summary instead.
 */
export default function ReservoirMapClient() {
  const total = reservoirs.reduce((a, r) => a + r.capacityTMC, 0);
  const filled = reservoirs.reduce((a, r) => a + r.currentTMC, 0);
  const fillPct = Math.round((filled / total) * 100);

  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold">Khadakwasla complex — live storage</h3>
          <p className="text-xs text-muted-foreground">
            {filled.toFixed(2)} / {total.toFixed(2)} TMC · {fillPct}% full
          </p>
        </div>
        <span className="text-xs text-muted-foreground">7 reservoirs</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {reservoirs.map((r) => {
          const pct = Math.round((r.currentTMC / r.capacityTMC) * 100);
          const tone =
            pct >= 60 ? "bg-emerald-500" : pct >= 30 ? "bg-sky-500" : pct >= 15 ? "bg-amber-500" : "bg-rose-500";
          return (
            <div key={r.name} className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-medium capitalize">{r.name.replace(/-/g, " ")}</span>
                <span className="text-sm font-semibold">{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{r.currentTMC.toFixed(2)} / {r.capacityTMC.toFixed(2)} TMC</span>
                <span>Inflow {r.inflowCusec.toLocaleString()} cusec</span>
                <span>Outflow {r.outflowCusec.toLocaleString()} cusec</span>
                <span>Rain 24h {r.catchmentRainMm} mm</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
