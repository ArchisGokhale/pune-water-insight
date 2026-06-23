import { queryOptions } from "@tanstack/react-query";
import { getLiveNews } from "./news.functions";

export const liveNewsQuery = queryOptions({
  queryKey: ["live-news"],
  queryFn: () => getLiveNews(),
  staleTime: 5 * 60 * 1000,
  refetchInterval: 10 * 60 * 1000,
  refetchOnWindowFocus: true,
});
