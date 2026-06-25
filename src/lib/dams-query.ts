import { queryOptions } from "@tanstack/react-query";
import { getLiveDamLevels } from "./dams.functions";

export const liveDamsQuery = queryOptions({
  queryKey: ["live-dams"],
  queryFn: () => getLiveDamLevels(),
  staleTime: 15 * 60 * 1000,
  refetchInterval: 30 * 60 * 1000,
  refetchOnWindowFocus: true,
});
