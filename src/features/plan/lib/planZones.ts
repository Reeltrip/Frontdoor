import type { MapPosition } from '@/shared/components/Map';
import type { Place } from '@/features/place/model/place.types';
import type { PlanDay } from '../model/plan.types';

// 구역은 장소 검색(GET /place-search)으로 찾은 이름과 좌표예요.
// 카드에 구역 필드가 없어서, 구역 중심 주변에 있는 카드를 그 구역 카드로 봐요
export type PlanZone = {
  name: string;
  center: MapPosition;
};

/** 구역 중심에서 이 거리(km) 안에 있으면 그 구역 카드로 봐요 */
const ZONE_RADIUS_KM = 2;

const EARTH_RADIUS_KM = 6371;
const toRadian = (degree: number) => (degree * Math.PI) / 180;

/** 두 좌표 사이 거리(km). 짧은 거리라 구면 거리 공식으로 충분해요 */
export function getDistanceKm(from: MapPosition, to: MapPosition): number {
  const dLat = toRadian(to.lat - from.lat);
  const dLng = toRadian(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadian(from.lat)) * Math.cos(toRadian(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** 그 일차에 고른 구역. 아직 고르지 않았으면 undefined */
export function getDayZone(day: PlanDay | undefined): PlanZone | undefined {
  return day?.zone && day.zoneCenter ? { name: day.zone, center: day.zoneCenter } : undefined;
}

export function isPlaceInZone(place: Place, zone: PlanZone): boolean {
  return place.location ? getDistanceKm(place.location, zone.center) <= ZONE_RADIUS_KM : false;
}
