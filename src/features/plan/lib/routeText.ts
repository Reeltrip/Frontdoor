import type { Place } from '@/features/place/model/place.types';
import type { PlaceRoute, RouteMode, RouteSegment } from '../api/plans';
import { getDistanceKm } from './planZones';

export const MODE_LABELS: Record<RouteMode, string> = {
  WALK: '도보',
  TAXI: '택시',
  SUBWAY: '지하철',
  BUS: '버스',
  TRAIN: '기차',
  TRAM: '트램',
  TRANSIT: '대중교통',
};

/** 버스·지하철처럼 타고 내리는 수단. 도보·택시는 아니에요 */
export const isRide = (mode: RouteMode) => mode !== 'WALK' && mode !== 'TAXI';

export const formatDistance = (from: Place, to: Place) => {
  if (!from.location || !to.location) return null;
  const km = getDistanceKm(from.location, to.location);
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
};

/** 초록 글자: 내리는 역 이름. 탈것이 없으면 이동 수단(택시·도보) */
export const getMoveLabel = (route: PlaceRoute) => {
  const rides = route.segments.filter((segment) => isRide(segment.mode));
  const lastStop = rides[rides.length - 1]?.stopName;
  if (lastStop) return lastStop;
  const longest = route.segments.reduce<RouteSegment | undefined>(
    (best, segment) => (!best || segment.minutes > best.minutes ? segment : best),
    undefined,
  );
  return longest ? (MODE_LABELS[longest.mode] ?? longest.mode) : '이동';
};

/** '대중교통, 최단시간 기준'. 탈것이 없으면 '최단시간 기준'만 */
export const getRouteBasis = (route: PlaceRoute) =>
  (route.segments.some((segment) => isRide(segment.mode)) ? '대중교통, ' : '') + '최단시간 기준';

/** '대중교통, 최단시간 기준 | 18분' */
export const getMoveText = (route: PlaceRoute) => `${getRouteBasis(route)} | ${route.totalMinutes}분`;

/** 자세한 길 안내는 지도 앱에 맡겨요 (기능명세서 4-4 경로 간단히 보기) */
export const getDirectionsUrl = (from: Place, to: Place) => {
  if (!from.location || !to.location) return null;
  const params = new URLSearchParams({
    api: '1',
    origin: `${from.location.lat},${from.location.lng}`,
    destination: `${to.location.lat},${to.location.lng}`,
    travelmode: 'transit',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};
