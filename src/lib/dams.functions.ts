import { createServerFn } from "@tanstack/react-start";
import Firecrawl from "@mendable/firecrawl-js";

export type LiveDam = {
  id: string;
  name: string;
  currentTMC?: number;
  fillPct?: number;
  inflowCusec?: number;
  outflowCusec?: number;
  catchmentRainMm?: number;
};

export type LiveDams = {
  dams: LiveDam[];
  asOf?: string;
  fetchedAt: string;
  source: "firecrawl" | "fallback";
  sourceUrl?: string;
  error?: string;
};

// Stable lookup keys. Keep ids in sync with src/lib/water-data.ts reservoirs.
const DAM_KEYS: Record<string, string[]> = {
  "khadakwasla":  ["khadakwasla"],
  "panshet":      ["panshet"],
  "varasgaon":    ["varasgaon", "warasgaon"],
  "temghar":      ["temghar"],
  "pavana":       ["pavana", "pawana"],
  "mulshi":       ["mulshi"],
  "bhama-askhed": ["bhama", "askhed", "bhama askhed", "bhama-askhed"],
};

function pickId(rawName: string): string | undefined {
  const t = rawName.toLowerCase();
  for (const [id, keys] of Object.entries(DAM_KEYS)) {
    if (keys.some((k) => t.includes(k))) return id;
  }
  return undefined;
}

const SCHEMA = {
  type: "object",
  properties: {
    asOf: { type: "string", description: "Date the dam levels were measured (e.g. '24 June 2026')." },
    dams: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Dam name (Khadakwasla, Panshet, Varasgaon, Temghar, Pavana, Mulshi, Bhama Askhed)." },
          currentTMC: { type: "number", description: "Current live storage in TMC." },
          fillPct: { type: "number", description: "Percent of live capacity filled (0-100)." },
          inflowCusec: { type: "number" },
          outflowCusec: { type: "number" },
          catchmentRainMm: { type: "number", description: "Last 24h catchment rainfall in mm." },
        },
        required: ["name"],
      },
    },
  },
  required: ["dams"],
} as const;

const EXTRACT_PROMPT =
  "Extract the most recent Pune-area dam storage table. Include only these dams: Khadakwasla, Panshet, Varasgaon, Temghar, Pavana, Mulshi, Bhama Askhed. For each dam, return current live storage in TMC, percent full (0-100), and if listed, 24h inflow/outflow in cusecs and catchment rainfall in mm. Also return the reading date as 'asOf'. Only use numbers that are explicitly stated in the page. Skip dams that aren't in the page.";

// Candidate sources, tried in order. First page that yields >= 3 dams wins.
const SOURCES = [
  "https://punemirror.com/pune/civic/water-storage-in-khadakwasla-dam-rises-to-2068-on-back-of-rains-in-catchment-area/cid87654321.htm",
  "https://punekarnews.in/category/pune/water/",
  "https://pune.news/category/water-storage/",
];

export const getLiveDamLevels = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveDams> => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { dams: [], fetchedAt: new Date().toISOString(), source: "fallback", error: "FIRECRAWL_API_KEY not configured" };
    }

    try {
      const firecrawl = new Firecrawl({ apiKey });

      // Use search-with-extraction: more resilient than a single fragile URL.
      const monthYear = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const search: any = await firecrawl.search(
        `Pune dam water storage today ${monthYear} Khadakwasla Panshet Varasgaon Temghar Pavana Mulshi Bhama Askhed TMC percent`,
        {
          limit: 8,
          tbs: "qdr:d",
          scrapeOptions: {
            formats: [{ type: "json", schema: SCHEMA as any, prompt: EXTRACT_PROMPT }],
            onlyMainContent: true,
          },
        } as any
      );

      const results: any[] =
        search?.web ?? search?.data?.web ?? search?.data ?? search?.results ?? [];

      let best: { dams: LiveDam[]; asOf?: string; url?: string } | undefined;

      for (const r of results) {
        const json = r?.json ?? r?.extract ?? r?.data?.json;
        const list: any[] = Array.isArray(json?.dams) ? json.dams : [];
        const dams: LiveDam[] = [];
        for (const d of list) {
          const id = pickId(String(d?.name ?? ""));
          if (!id) continue;
          const fillPct =
            typeof d?.fillPct === "number" ? d.fillPct
            : typeof d?.fill_percent === "number" ? d.fill_percent
            : undefined;
          dams.push({
            id,
            name: String(d.name),
            currentTMC: typeof d?.currentTMC === "number" ? d.currentTMC : undefined,
            fillPct: typeof fillPct === "number" ? Math.max(0, Math.min(100, fillPct)) : undefined,
            inflowCusec: typeof d?.inflowCusec === "number" ? d.inflowCusec : undefined,
            outflowCusec: typeof d?.outflowCusec === "number" ? d.outflowCusec : undefined,
            catchmentRainMm: typeof d?.catchmentRainMm === "number" ? d.catchmentRainMm : undefined,
          });
        }
        // Deduplicate by id, keep first occurrence
        const seen = new Set<string>();
        const unique = dams.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)));
        if (unique.length >= (best?.dams.length ?? 0)) {
          best = { dams: unique, asOf: json?.asOf, url: r?.url };
        }
        if (unique.length >= 5) break;
      }

      if (!best || best.dams.length === 0) {
        return {
          dams: [],
          fetchedAt: new Date().toISOString(),
          source: "fallback",
          error: "No dam table extracted from search results",
        };
      }

      return {
        dams: best.dams,
        asOf: best.asOf,
        sourceUrl: best.url,
        fetchedAt: new Date().toISOString(),
        source: "firecrawl",
      };
    } catch (err) {
      return {
        dams: [],
        fetchedAt: new Date().toISOString(),
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }
);

// Avoid unused-source warning while keeping SOURCES list for future direct-scrape fallback.
export const _DAM_SOURCE_HINTS = SOURCES;
