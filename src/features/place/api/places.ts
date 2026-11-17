import { apiRequest, apiUpload } from '@/shared/api/client';
import type { Place, PlaceCategory, PlaceListParams, UpdatePlaceRequest } from '../model/place.types';

// 장소 쿼리 키는 여기서만 만들어요. 무효화할 때 placeKeys.all을 쓰면 목록 전체가 다시 불러와져요
export const placeKeys = {
  all: ['places'] as const,
  list: (params: PlaceListParams = {}) => [...placeKeys.all, 'list', params] as const,
  deleted: () => [...placeKeys.all, 'deleted'] as const,
  search: (query: string) => ['place-search', query] as const,
};

// ── BE 형식 (docs/api-spec.md 요약카드) ──

export type ApiCategory = 'FOOD' | 'CAFE' | 'STAY' | 'SIGHTSEEING' | 'ACTIVITY' | 'SHOPPING' | 'TRANSPORT' | 'TIP';

const TO_API_CATEGORY: Record<PlaceCategory, ApiCategory> = {
  food: 'FOOD',
  cafe: 'CAFE',
  accommodation: 'STAY',
  attraction: 'SIGHTSEEING',
  activity: 'ACTIVITY',
  shopping: 'SHOPPING',
  transportation: 'TRANSPORT',
  tip: 'TIP',
};

const FROM_API_CATEGORY = Object.fromEntries(
  Object.entries(TO_API_CATEGORY).map(([category, apiCategory]) => [apiCategory, category]),
) as Record<ApiCategory, PlaceCategory>;

export const toApiCategory = (category: PlaceCategory): ApiCategory => TO_API_CATEGORY[category];
export const fromApiCategory = (category: ApiCategory): PlaceCategory => FROM_API_CATEGORY[category] ?? 'tip';

/** 목록·상세·분석 초안이 같이 쓰는 카드 항목. 응답마다 없는 항목이 있어서 모두 선택이에요 */
export type ApiPlace = {
  placeId?: number;
  sourceLinkId?: number | null;
  category: ApiCategory;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  city?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  keyPoints?: string[] | null;
  priceText?: string | null;
  reviewCount?: number | null;
  openingHours?: string | null;
  accessText?: string | null;
  memo?: string | null;
  // 교통·팁 카드
  subType?: string | null;
  applicableRegion?: string | null;
  cost?: string | null;
  benefit?: string | null;
  method?: string | null;
  placeText?: string | null;
  caution?: string | null;
  deletedAt?: string | null;
};

type ApiPlaceList = { places: ApiPlace[]; totalCount?: number };

const hasText = (value: string | null | undefined): value is string => Boolean(value?.trim());

/** BE 카드를 화면에서 쓰는 Place로 바꿔요. id가 없는 카드(분석 초안)는 fallbackId를 써요 */
export function toPlace(item: ApiPlace, fallbackId = ''): Place {
  const isOffMap = item.category === 'TRANSPORT' || item.category === 'TIP';
  const summary = isOffMap
    ? [item.subType, item.applicableRegion].filter(hasText)
    : [item.accessText, item.openingHours].filter(hasText);
  const hasLocation = typeof item.latitude === 'number' && typeof item.longitude === 'number';
  return {
    id: item.placeId !== undefined ? String(item.placeId) : fallbackId,
    category: fromApiCategory(item.category),
    name: item.name,
    imageUrl: item.imageUrl ?? '',
    ...(hasLocation ? { location: { lat: item.latitude as number, lng: item.longitude as number } } : {}),
    summary,
    ...(hasText(item.address) ? { address: item.address } : {}),
    ...(hasText(item.priceText ?? item.cost) ? { tag: (item.priceText ?? item.cost) as string } : {}),
    ...(typeof item.reviewCount === 'number' ? { reviewCount: item.reviewCount } : {}),
  };
}

const PAGE_SIZE = 100;

/** 보관함 카드 전체. 서버가 100장씩 나눠 줘서 끝까지 이어 받아요 */
export async function fetchPlaces(params: PlaceListParams = {}, signal?: AbortSignal): Promise<Place[]> {
  const places: Place[] = [];
  for (let page = 0; ; page += 1) {
    const response = await apiRequest<ApiPlaceList>('/places', {
      query: { category: params.category && toApiCategory(params.category), page, size: PAGE_SIZE },
      signal,
    });
    places.push(...response.places.map((item) => toPlace(item)));
    if (response.places.length < PAGE_SIZE || places.length >= (response.totalCount ?? 0)) return places;
  }
}

/** 화면의 수정 항목을 BE 필드로 옮겨요. summary[0]은 가는 길, summary[1]은 영업시간이에요 */
export function updatePlace(id: string, changes: UpdatePlaceRequest): Promise<Place> {
  const body: Record<string, unknown> = {};
  if (changes.name !== undefined) body.name = changes.name;
  if (changes.category !== undefined) body.category = toApiCategory(changes.category);
  if (changes.address !== undefined) body.address = changes.address;
  if ('tag' in changes) body.priceText = changes.tag ?? null;
  if (changes.summary !== undefined) {
    body.accessText = changes.summary[0] ?? null;
    if (changes.summary.length > 1) body.openingHours = changes.summary[1];
  }
  return apiRequest<ApiPlace>(`/places/${encodeURIComponent(id)}`, { method: 'PATCH', body }).then((item) =>
    toPlace(item),
  );
}

/** 카드 삭제. 서버는 휴지통으로 옮겨요 */
export function deletePlace(id: string): Promise<void> {
  return apiRequest<void>(`/places/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** 휴지통 카드 여러 장을 보관함으로 되돌려요 */
export function restorePlaces(ids: string[]): Promise<void> {
  return apiRequest<void>('/places/trash/restore', { method: 'POST', body: { placeIds: ids.map(Number) } });
}

/** 휴지통 목록 */
export function fetchDeletedPlaces(signal?: AbortSignal): Promise<Place[]> {
  return apiRequest<ApiPlaceList>('/places/trash', { signal }).then((response) =>
    response.places.map((item) => ({ ...toPlace(item), summary: item.keyPoints?.filter(hasText) ?? [] })),
  );
}

/** 휴지통에서 완전히 삭제. 되돌릴 수 없어요 */
export function purgePlaces(ids: string[]): Promise<void> {
  return apiRequest<void>('/places/trash', { method: 'DELETE', query: { placeIds: ids.join(',') } });
}

export type SkippedPlace = { index: number; name: string; missingFields: string[] };
export type CreatePlacesResult = { placeIds: string[]; skipped: SkippedPlace[] };

/** 카드 여러 장 저장 (분석 결과 저장, 직접 추가). 필수 항목이 빈 AI 카드는 skipped로 돌아와요 */
export function createPlaces(places: ApiPlace[]): Promise<CreatePlacesResult> {
  return apiRequest<{ places: { placeId: number }[]; skipped?: SkippedPlace[] }>('/places', {
    method: 'POST',
    body: { places },
  }).then((response) => ({
    placeIds: response.places.map((place) => String(place.placeId)),
    skipped: response.skipped ?? [],
  }));
}

export type PlaceSearchResult = {
  googlePlaceId: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

/** 장소·구역 이름으로 주소와 좌표를 찾아요 (Google 키는 BE에만 있어요) */
export function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceSearchResult[]> {
  return apiRequest<{ places: PlaceSearchResult[] }>('/place-search', { query: { query }, signal }).then(
    (response) => response.places,
  );
}

/** 사진 올리기. PNG·JPEG, 5MB 이하만 받아요 */
export function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  return apiUpload<{ imageUrl: string }>('/images', form).then((response) => response.imageUrl);
}
