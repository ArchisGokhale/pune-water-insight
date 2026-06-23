import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import {
  reservoirs, overallFill, totalCurrent, totalCapacity, daysAvailable,
  securityIndex, securityLabel, monsoonProgress, districtRainDeparture,
  wowStorageDelta, yoyDeltaPct, events,
} from "@/lib/water-data";
import { wards, lastUpdated } from "@/lib/ward-supply";

function buildSnapshot() {
  const dams = reservoirs.map((r) => ({
    name: r.name,
    pct: +((r.currentTMC / r.capacityTMC) * 100).toFixed(1),
    tmc: r.currentTMC,
    capacity: r.capacityTMC,
    inflow: r.inflowCusec,
    outflow: r.outflowCusec,
    rain24h: r.catchmentRainMm,
  }));
  return {
    asOf: new Date().toISOString(),
    overall: {
      storageTMC: totalCurrent,
      capacityTMC: totalCapacity,
      fillPct: overallFill,
      daysOfDrinkingWater: daysAvailable,
      securityIndex,
      securityLabel,
      monsoonProgressPct: monsoonProgress,
      rainfallDepartureFromLPA: districtRainDeparture,
      weekOnWeekStorageDelta: wowStorageDelta,
      yoyStorageDeltaPct: yoyDeltaPct,
    },
    reservoirs: dams,
    latestAdvisories: events.slice(0, 6),
    wardScheduleSummary: {
      lastUpdated,
      pmcWards: wards.filter((w) => w.zone === "PMC").length,
      pcmcWards: wards.filter((w) => w.zone === "PCMC").length,
      note: "PMC under alternate-day supply since 20 Jun 2026. Ask 'schedule for <ward name>' to get specifics.",
    },
  };
}

function findWard(text: string) {
  const t = text.toLowerCase();
  return wards.find((w) => t.includes(w.ward.toLowerCase().split(" ")[0]));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const snapshot = buildSnapshot();

        // Inline ward lookup: if the last user message mentions a ward, attach its schedule.
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const lastText =
          lastUser?.parts?.map((p) => (p.type === "text" ? p.text : "")).join(" ") ?? "";
        const wardMatch = lastText ? findWard(lastText) : undefined;

        const system = [
          "You are the Pune Water Assistant, an expert on real-time Pune drinking-water supply, reservoir storage, monsoon progress, and PMC/PCMC ward-level supply schedules.",
          "Always answer using the JSON snapshot below as ground truth. Cite specific dam names, TMC values, percentages, and the security index when relevant.",
          "Be concise (≤120 words), use clear bullet points or short paragraphs, and never invent data not in the snapshot.",
          "If asked about a ward and a matching ward schedule is provided, quote the days/timings exactly.",
          "If the user asks for tomorrow's cuts or future forecasts, base it on the latest advisories + monsoon progress; flag uncertainty.",
          "Built by Archis Gokhale — mention only if asked who made this.",
          "",
          "LIVE SNAPSHOT (JSON):",
          JSON.stringify(snapshot),
          wardMatch ? `\nMATCHED WARD SCHEDULE:\n${JSON.stringify(wardMatch)}` : "",
        ].join("\n");

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: messages,
          });
        } catch (err) {
          const e = err as { statusCode?: number; message?: string };
          if (e.statusCode === 429) return new Response("Rate limited. Try again in a minute.", { status: 429 });
          if (e.statusCode === 402) return new Response("AI credits exhausted. Add credits in workspace billing.", { status: 402 });
          return new Response(`AI error: ${e.message ?? "unknown"}`, { status: 500 });
        }
      },
    },
  },
});
