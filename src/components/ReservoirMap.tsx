import { useEffect, useState } from "react";
import { reservoirs } from "@/lib/water-data";

// Real lat/lng for the Pune reservoir cluster.
const COORDS: Record<string, { lat: number; lng: number }> = {
  "khadakwasla":  { lat: 18.4396, lng: 73.7689 },
  "panshet":      { lat: 18.3878, lng: 73.6097 },
  "varasgaon":    { lat: 18.3826, lng: 73.5163 },
  "temghar":      { lat: 18.4356, lng: 73.4661 },
  "pavana":       { lat: 18.7397, lng: 73.5167 },
  "mulshi":       { lat: 18.5044, lng: 73.5083 },
  "bhama-askhed": { lat: 18.8500, lng: 73.8050 },
};

function fillColor(pct: number) {
  if (pct >= 60) return "#22c55e";
  if (pct >= 30) return "#0ea5e9";
  if (pct >= 15) return "#f59e0b";
  return "#ef4444";
}

export default function ReservoirMap() {
  const [mounted, setMounted] = useState(false);
  const [RL, setRL] = useState<typeof import("react-leaflet") | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Leaflet touches `window`, so import only on the client.
      await import("leaflet/dist/leaflet.css");
      const mod = await import("react-leaflet");
      if (!cancelled) {
        setRL(mod);
        setMounted(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!mounted || !RL) {
    return (
      <div className="glass flex h-[480px] items-center justify-center rounded-3xl text-sm text-muted-foreground">
        Loading interactive map…
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, Circle } = RL;

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="border-b border-border/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-base font-semibold">Reservoir & Rainfall Map</div>
            <div className="text-[10px] text-muted-foreground">Live storage · 24h catchment rainfall · OpenStreetMap base</div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px]">
            {[
              { c: "#22c55e", l: "≥60%" },
              { c: "#0ea5e9", l: "30–60%" },
              { c: "#f59e0b", l: "15–30%" },
              { c: "#ef4444", l: "<15%" },
            ].map((s) => (
              <span key={s.l} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} />
                {s.l}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[480px] w-full">
        <MapContainer
          center={[18.55, 73.65]}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "#0b1220" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {reservoirs.map((r) => {
            const coord = COORDS[r.id];
            if (!coord) return null;
            const pct = (r.currentTMC / r.capacityTMC) * 100;
            const color = fillColor(pct);
            return (
              <CircleMarker
                key={r.id}
                center={[coord.lat, coord.lng]}
                radius={8 + Math.sqrt(r.capacityTMC) * 2.5}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.55, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <strong>{r.name}</strong> · {pct.toFixed(1)}%
                </Tooltip>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      <strong>{pct.toFixed(1)}%</strong> · {r.currentTMC.toFixed(2)} / {r.capacityTMC.toFixed(2)} TMC
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                      Inflow: {r.inflowCusec.toLocaleString()} cusec<br />
                      Outflow: {r.outflowCusec.toLocaleString()} cusec<br />
                      Catchment rain (24h): {r.catchmentRainMm} mm<br />
                      Catchment area: {r.catchmentAreaKm2} km²
                    </div>
                  </div>
                </Popup>
                {r.catchmentRainMm > 0 && (
                  <Circle
                    center={[coord.lat, coord.lng]}
                    radius={r.catchmentRainMm * 600}
                    pathOptions={{ color: "#60a5fa", fillColor: "#60a5fa", fillOpacity: 0.08, weight: 1, dashArray: "4 4" }}
                  />
                )}
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
