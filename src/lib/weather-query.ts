import { queryOptions } from "@tanstack/react-query";
import { getLiveWeather } from "./weather.functions";

export const liveWeatherQuery = queryOptions({
  queryKey: ["live-weather"],
  queryFn: () => getLiveWeather(),
  staleTime: 5 * 60 * 1000,
  refetchInterval: 10 * 60 * 1000,
});
