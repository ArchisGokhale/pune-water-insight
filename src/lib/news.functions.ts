import { createServerFn } from "@tanstack/react-start";
import Firecrawl from "@mendable/firecrawl-js";

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  snippet: string;
  publishedAt?: string;
  category: "rainfall" | "reservoir" | "supply" | "alert" | "general";
};

export type LiveNews = {
  items: NewsItem[];
  fetchedAt: string;
  source: "firecrawl" | "fallback";
  error?: string;
};

const QUERIES: { q: string; category: NewsItem["category"] }[] = [
  { q: "Pune rainfall today monsoon", category: "rainfall" },
  { q: "Khadakwasla Panshet Varasgaon dam water storage today", category: "reservoir" },
  { q: "Pune water supply cut PMC today", category: "supply" },
  { q: "Maharashtra IMD weather warning Pune today", category: "alert" },
  { q: "Pune district flood reservoir release today", category: "general" },
];

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export const getLiveNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveNews> => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return {
        items: [],
        fetchedAt: new Date().toISOString(),
        source: "fallback",
        error: "FIRECRAWL_API_KEY not configured",
      };
    }

    try {
      const firecrawl = new Firecrawl({ apiKey });
      const results = await Promise.allSettled(
        QUERIES.map((q) =>
          firecrawl.search(q.q, { limit: 5, tbs: "qdr:d" } as any)
        )
      );

      const seen = new Set<string>();
      const items: NewsItem[] = [];

      results.forEach((r, idx) => {
        if (r.status !== "fulfilled") return;
        const cat = QUERIES[idx].category;
        // SDK v2: results may be on `web` or top-level array
        const raw: any = r.value;
        const list: any[] =
          raw?.web ?? raw?.data?.web ?? raw?.data ?? raw?.results ?? [];
        for (const it of list) {
          const url: string | undefined = it?.url ?? it?.link;
          const title: string | undefined = it?.title ?? it?.metadata?.title;
          if (!url || !title || seen.has(url)) continue;
          seen.add(url);
          items.push({
            title: String(title).slice(0, 200),
            url,
            source: hostFromUrl(url),
            snippet: String(it?.description ?? it?.snippet ?? it?.markdown ?? "").slice(0, 280),
            publishedAt: it?.publishedDate ?? it?.published_at ?? it?.date,
            category: cat,
          });
        }
      });

      // Sort: alerts first, then reservoir, supply, rainfall, general
      const order: Record<NewsItem["category"], number> = {
        alert: 0,
        reservoir: 1,
        supply: 2,
        rainfall: 3,
        general: 4,
      };
      items.sort((a, b) => order[a.category] - order[b.category]);

      return {
        items: items.slice(0, 24),
        fetchedAt: new Date().toISOString(),
        source: "firecrawl",
      };
    } catch (err) {
      return {
        items: [],
        fetchedAt: new Date().toISOString(),
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }
);
