import { queryOptions } from "@tanstack/react-query";
import { getLiveNews } from "./news.functions";

export const liveNewsQuery = queryOptions({
  queryKey: ["live-news"],
  queryFn: () => getLiveNews(),
  staleTime: 15 * 60 * 1000,
  refetchInterval: 30 * 60 * 1000,
});
