import type { MapPosition } from '@/shared/components/Map/map.types';

// 여행주소(서버의 city)는 이름만 저장돼서 좌표가 없어요.
// 생성·수정 화면에서 검색 결과를 고를 때 좌표를 여기 적어 두고, 없으면 장소 검색으로 한 번 찾아 적어요
const STORAGE_KEY = 'reeltrip:destination-centers';

type CenterCache = Record<string, MapPosition>;

const toKey = (destination: string) => destination.trim();

const isPosition = (value: unknown): value is MapPosition =>
  typeof value === 'object' &&
  value !== null &&
  Number.isFinite((value as MapPosition).lat) &&
  Number.isFinite((value as MapPosition).lng);

// 시크릿 창이나 저장소가 막힌 브라우저에서는 읽기·쓰기가 실패할 수 있어서, 실패하면 캐시 없이 지나가요
function readCache(): CenterCache {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? (parsed as CenterCache) : {};
  } catch {
    return {};
  }
}

export function readDestinationCenter(destination: string | undefined): MapPosition | undefined {
  if (!destination?.trim()) return undefined;
  const saved = readCache()[toKey(destination)];
  return isPosition(saved) ? { lat: saved.lat, lng: saved.lng } : undefined;
}

export function rememberDestinationCenter(destination: string | undefined, center: MapPosition): void {
  if (!destination?.trim() || !isPosition(center)) return;
  try {
    const cache = { ...readCache(), [toKey(destination)]: { lat: center.lat, lng: center.lng } };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // 저장하지 못해도 다음에 다시 찾으면 돼요
  }
}

export type PlanMapCenterInput = {
  /** 숙소 검색에서 지금 보고 있는 결과 */
  lodgingPreview?: MapPosition;
  /** 그 일차 구역(구역 고르는 중이면 고른 구역) */
  zone?: MapPosition;
  /** 계획에 정한 숙소 */
  lodging?: MapPosition;
  /** 그 일차에 넣은 장소 (보관함 전체가 아니라 이 계획의 장소) */
  planPlace?: MapPosition;
  /** 여행주소 좌표 */
  destination?: MapPosition;
  /** 여행주소 좌표를 찾는 중인지. 찾는 동안은 다른 도시 카드로 옮겨 가지 않아요 */
  isDestinationPending?: boolean;
  /** 여행주소가 없는 예전 계획에서만 쓰는 보관함 첫 카드 */
  library?: MapPosition;
};

/** 지도를 처음 열 위치. 숙소·구역 → 계획 장소 → 여행주소 → (여행주소가 없을 때만) 보관함 카드 → 기본 위치 순서예요 */
export function pickPlanMapCenter(input: PlanMapCenterInput, fallback: MapPosition): MapPosition {
  return (
    input.lodgingPreview ??
    input.zone ??
    input.lodging ??
    input.planPlace ??
    input.destination ??
    (input.isDestinationPending ? undefined : input.library) ??
    fallback
  );
}
