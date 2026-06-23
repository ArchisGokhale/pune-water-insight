import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Droplets, ExternalLink, Clock } from "lucide-react";
import { wards, lastUpdated, sourceUrl } from "@/lib/ward-supply";

export const Route = createFileRoute("/wards")({
  head: () => ({
    meta: [
      { title: "Pune Ward Water Supply Schedule · PMC + PCMC Timings" },
      { name: "description", content: "Searchable PMC and PCMC ward-level water supply timings, alternate-day cut calendar and feeder reservoir for every Pune ward." },
      { property: "og:title", content: "Pune Ward Water Supply Schedule" },
      { property: "og:description", content: "Live PMC + PCMC ward-level supply timings during the 2026 water cut." },
    ],
  }),
  component: WardsPage,
});

function WardsPage() {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState<"All" | "PMC" | "PCMC">("All");

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return wards.filter((w) => {
      if (zone !== "All" && w.zone !== zone) return false;
      if (!needle) return true;
      return (
        w.ward.toLowerCase().includes(needle) ||
        w.region.toLowerCase().includes(needle) ||
        w.feeder.toLowerCase().includes(needle)
      );
    });
  }, [q, zone]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="text-[11px] text-muted-foreground">Updated {lastUpdated}</div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-6 pb-16 pt-10">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.2em] text-aqua font-semibold">Ward-level Supply</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight lg:text-5xl">When does your area get water?</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            PMC has imposed alternate-day water supply since 20 June 2026. Search your ward or
            zone below for the latest timing, feeder reservoir, and special notes.
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-aqua hover:underline">PMC source <ExternalLink className="inline h-3 w-3" /></a>
          </p>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ward, region or feeder (e.g. Kothrud, Pavana)"
              className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-aqua/60"
            />
          </div>
          <div className="flex gap-1.5 rounded-xl border border-border bg-card/60 p-1">
            {(["All", "PMC", "PCMC"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZone(z)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                  zone === z ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {wards.length} wards
        </div>

        {/* Table / cards */}
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((w) => (
            <div key={w.ward} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                      w.zone === "PMC" ? "bg-aqua/15 text-aqua" : "bg-monsoon/15 text-monsoon"
                    }`}>{w.zone}</span>
                    <span className="text-[11px] text-muted-foreground">{w.region}</span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold">{w.ward}</h3>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  w.days.toLowerCase().includes("alternate") ? "bg-warn/15 text-warn"
                  : w.days.toLowerCase().includes("tanker") ? "bg-danger/15 text-danger"
                  : "bg-safe/15 text-safe"
                }`}>
                  {w.days}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Morning</div>
                  <div className="mt-0.5 font-mono tabular-nums">{w.morningSlot ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Evening</div>
                  <div className="mt-0.5 font-mono tabular-nums">{w.eveningSlot ?? "—"}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <Droplets className="h-3.5 w-3.5 text-aqua" />
                Feeder: <span className="text-foreground">{w.feeder}</span>
              </div>
              {w.notes && (
                <div className="mt-2 flex items-start gap-2 text-[11px] text-muted-foreground">
                  <Clock className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{w.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No wards match "{q}". Try a broader term or change the zone filter.
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-5 text-xs text-muted-foreground">
          Schedules compiled from PMC and PCMC water-supply department press notes (June 2026).
          Street-level timing can vary by ±30 min in tail-end areas. Report discrepancies on the PMC complaint portal.
        </div>
      </section>
    </div>
  );
}
