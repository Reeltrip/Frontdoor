import { useQuery } from "@tanstack/react-query";
import { fetchRecentSources, sourceKeys } from "../api/sources";
import type { RecentCollection } from "./recentCollection.types";

const NO_COLLECTIONS: RecentCollection[] = [];

/** 홈의 '최근 수집 내역' (최근 10개) */
export function useRecentCollections(): RecentCollection[] {
  const query = useQuery({
    queryKey: sourceKeys.recent(),
    queryFn: ({ signal }) => fetchRecentSources(signal),
  });
  return query.data ?? NO_COLLECTIONS;
}
