import type { MapPosition } from '@/shared/components/Map';
import type { Place } from '@/features/place/model/place.types';

// 가짜 형식: 장소 카드에 구역 필드가 없어서, 후쿠오카 주요 구역의 중심 좌표를 두고
// 그 주변에 있는 카드를 그 구역 카드로 봐요. BE가 구역을 주면 이 목록과 거리 계산을 바꾸기
export type PlanZone = {
  name: string;
  center: MapPosition;
};

export const PLAN_ZONES: PlanZone[] = [
  { name: '하카타', center: { lat: 33.5902, lng: 130.4207 } },
  { name: '텐진', center: { lat: 33.5913, lng: 130.3989 } },
  { name: '나카스', center: { lat: 33.5935, lng: 130.4058 } },
  { name: '오호리 공원', center: { lat: 33.586, lng: 130.3765 } },
  { name: '모모치 해변', center: { lat: 33.5933, lng: 130.3515 } },
  { name: '다자이후', center: { lat: 33.5196, lng: 130.5354 } },
];

/** 구역 중심에서 이 거리(km) 안에 있으면 그 구역 카드로 봐요 */
const ZONE_RADIUS_KM = 1.5;

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

export function findZone(name: string | undefined): PlanZone | undefined {
  return PLAN_ZONES.find((zone) => zone.name === name);
}

export function searchZones(query: string): PlanZone[] {
  const keyword = query.trim();
  if (!keyword) return PLAN_ZONES;
  return PLAN_ZONES.filter((zone) => zone.name.includes(keyword));
}

export function isPlaceInZone(place: Place, zone: PlanZone): boolean {
  return place.location ? getDistanceKm(place.location, zone.center) <= ZONE_RADIUS_KM : false;
}
