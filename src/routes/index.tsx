import { createFileRoute } from "@tanstack/react-router";
import WaterPlatform from "@/components/WaterPlatform";
import { liveWeatherQuery } from "@/lib/weather-query";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pune Water Intelligence Platform · Live Rainfall & Reservoir Tracker" },
      { name: "description", content: "Real-time rainfall, reservoir storage and water security forecasts for Pune district. Track 7 dams and 13 talukas with live data and AI-powered projections." },
      { property: "og:title", content: "Pune Water Intelligence Platform" },
      { property: "og:description", content: "Live rainfall, reservoir storage and water security index for Pune." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(liveWeatherQuery);
  },
  component: () => <WaterPlatform />,
});
