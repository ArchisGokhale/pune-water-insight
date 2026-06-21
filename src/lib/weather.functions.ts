import { createServerFn } from "@tanstack/react-start";
import { talukaPoints, reservoirPoints, type GeoPoint } from "./locations";

export type TalukaLive = {
  name: string;
  rainNow: number;     // mm/h current
  rain24h: number;     // last 24h mm
  rain7d: number;      // last 7d mm
  seasonTotal: number; // sum since Jun 1 (approx via past_days cap)
  departure: number;   // % vs reference (placeholder LPA)
  forecast: number[];  // next 15 daily mm
};

export type ForecastDay = {
  date: string;
  rainfall: number;
  storagePct: number;
};

export type LiveWeather = {
  fetchedAt: string;
  talukas: TalukaLive[];
  reservoirCatchmentRain: Record<string, number>; // last 24h mm
  forecast: ForecastDay[];
  districtAverages: {
    rainNow: number;
    rain24h: number;
    rain7d: number;
    seasonTotal: number;
    departure: number;
  };
  source: "open-meteo" | "fallback";
};

// LPA (long period average) approximations for departure % calculation.
// These are rough monsoon-season norms per taluka (mm to date). Tuned coarsely.
const LPA_REFERENCE: Record<string, number> = {
  Haveli: 540, Mulshi: 1520, Maval: 1110, Bhor: 780, Velhe: 1640,
  Purandar: 400, Baramati: 280, Indapur: 240, Shirur: 340, Ambegaon: 700,
  Junnar: 550, Khed: 570, Daund: 320,
};

async function fetchOpenMeteo(points: GeoPoint[]) {
  const lat = points.map((p) => p.lat).join(",");
  const lon = points.map((p) => p.lon).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=precipitation` +
    `&hourly=precipitation` +
    `&daily=precipitation_sum` +
    `&past_days=92` +
    `&forecast_days=15` +
    `&timezone=Asia%2FKolkata`;

  const res = await fetch(url, {
    headers: { "User-Agent": "pune-water-intel/1.0" },
  });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const json = await res.json();
  // Open-Meteo returns an array when multiple coordinates are passed,
  // and a single object for one coordinate.
  return Array.isArray(json) ? json : [json];
}

function sumLast(arr: number[], n: number): number {
  const slice = arr.slice(Math.max(0, arr.length - n));
  return +slice.reduce((s, v) => s + (Number(v) || 0), 0).toFixed(1);
}

export const getLiveWeather = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveWeather> => {
    try {
      const allPoints = [...talukaPoints, ...reservoirPoints];
      const data = await fetchOpenMeteo(allPoints);

      const talukas: TalukaLive[] = talukaPoints.map((p, i) => {
        const d = data[i];
        const dailyAll: number[] = d?.daily?.precipitation_sum ?? [];
        // past_days = 92 means index 0..91 are past, 92 is today, 93..107 forecast
        const past = dailyAll.slice(0, 92);
        const today = dailyAll[92] ?? 0;
        const forecast = dailyAll.slice(93, 108);
        const rain24h = +(today + (past[past.length - 1] ?? 0) * 0).toFixed(1);
        const rain7d = sumLast([...past, today], 7);
        const seasonTotal = sumLast([...past, today], 92);
        const lpa = LPA_REFERENCE[p.name] ?? 500;
        const departure = +(((seasonTotal - lpa) / lpa) * 100).toFixed(1);
        const rainNow = Number(d?.current?.precipitation ?? 0);

        return {
          name: p.name,
          rainNow: +rainNow.toFixed(1),
          rain24h: +today.toFixed(1),
          rain7d,
          seasonTotal,
          departure,
          forecast: forecast.map((v: number) => +Number(v).toFixed(1)),
        };
      });

      const resCatch: Record<string, number> = {};
      reservoirPoints.forEach((p, i) => {
        const d = data[talukaPoints.length + i];
        const dailyAll: number[] = d?.daily?.precipitation_sum ?? [];
        const today = dailyAll[92] ?? 0;
        resCatch[p.name] = +Number(today).toFixed(1);
      });

      // District-wide forecast averaged across all taluka points
      const forecastDays = talukas[0]?.forecast.length ?? 15;
      const today = new Date();
      const forecast: ForecastDay[] = Array.from({ length: forecastDays }, (_, i) => {
        const avg =
          talukas.reduce((s, t) => s + (t.forecast[i] ?? 0), 0) / talukas.length;
        const date = new Date(today.getTime() + i * 86400000);
        return {
          date: date.toISOString().slice(0, 10),
          rainfall: +avg.toFixed(1),
          storagePct: 0, // filled in client with current baseline
        };
      });

      const districtAverages = {
        rainNow: +(talukas.reduce((s, t) => s + t.rainNow, 0) / talukas.length).toFixed(1),
        rain24h: +(talukas.reduce((s, t) => s + t.rain24h, 0) / talukas.length).toFixed(1),
        rain7d: +(talukas.reduce((s, t) => s + t.rain7d, 0) / talukas.length).toFixed(1),
        seasonTotal: +(talukas.reduce((s, t) => s + t.seasonTotal, 0) / talukas.length).toFixed(0),
        departure: +(talukas.reduce((s, t) => s + t.departure, 0) / talukas.length).toFixed(1),
      };

      return {
        fetchedAt: new Date().toISOString(),
        talukas,
        reservoirCatchmentRain: resCatch,
        forecast,
        districtAverages,
        source: "open-meteo",
      };
    } catch (err) {
      console.error("[live-weather] open-meteo failed:", err);
      return {
        fetchedAt: new Date().toISOString(),
        talukas: [],
        reservoirCatchmentRain: {},
        forecast: [],
        districtAverages: { rainNow: 0, rain24h: 0, rain7d: 0, seasonTotal: 0, departure: 0 },
        source: "fallback",
      };
    }
  },
);
