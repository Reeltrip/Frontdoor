import { fetchRoute, routeKeys } from '../api/plans';
import type { Place } from '@/features/place/model/place.types';

/** 경로는 오전 10시 출발 기준으로 찾아요 (계획에 시각이 없어서) */
const DEPART_TIME = 'T10:00:00+09:00';

/**
 * 두 장소 사이 경로 조회 설정이에요. 타임라인(소요시간)과 지도(길 모양)가 같은 설정을 써서
 * 한 구간을 한 번만 불러요.
 */
export const getDayRouteQuery = (from: Place, to: Place, date: string, canFetchRoutes: boolean) => ({
  queryKey: routeKeys.between(from.id, to.id, date),
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchRoute(from.id, to.id, `${date}${DEPART_TIME}`, signal),
  enabled: canFetchRoutes && Boolean(from.location && to.location),
  staleTime: Infinity,
  // 경로가 없는 구간은 다시 불러도 같아서 한 번만 물어봐요
  retry: false,
});
