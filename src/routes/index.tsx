import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import WaterPlatform from "@/components/WaterPlatform";
import { getLiveWeather } from "@/lib/weather.functions";

export const liveWeatherQuery = queryOptions({
  queryKey: ["live-weather"],
  queryFn: () => getLiveWeather(),
  staleTime: 5 * 60 * 1000, // 5 min
  refetchInterval: 10 * 60 * 1000, // 10 min
});

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
