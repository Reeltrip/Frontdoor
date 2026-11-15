import { apiRequest } from '@/shared/api/client';
import { isFakeApiEnabled } from '@/shared/lib/env';
import type { Place, PlaceListParams, UpdatePlaceRequest } from '../model/place.types';
import { fakePlacesApi } from './places.fake';

// 장소 쿼리 키는 여기서만 만들어요. 무효화할 때 placeKeys.all을 쓰면 목록 전체가 다시 불러와져요
export const placeKeys = {
  all: ['places'] as const,
  list: (params: PlaceListParams = {}) => [...placeKeys.all, 'list', params] as const,
};

export function fetchPlaces(params: PlaceListParams = {}, signal?: AbortSignal): Promise<Place[]> {
  if (isFakeApiEnabled) return fakePlacesApi.list(params, signal);
  return apiRequest<Place[]>('/places', { query: { category: params.category }, signal });
}

export function updatePlace(id: string, changes: UpdatePlaceRequest): Promise<Place> {
  if (isFakeApiEnabled) return fakePlacesApi.update(id, changes);
  return apiRequest<Place>(`/places/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });
}

// 아래 세 개는 가짜 형식: 예외 상황(기능명세서 5-2, 5-3)용으로 FE가 가정한 엔드포인트. BE와 정해지면 맞추기

/** 카드 삭제. 서버는 삭제 표시만 하고 남겨 둔다고 가정해요 (계획에서 복구할 수 있게) */
export function deletePlace(id: string): Promise<void> {
  if (isFakeApiEnabled) return fakePlacesApi.remove(id);
  return apiRequest<void>(`/places/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** 삭제한 카드 복구 (5-3 계획에 넣은 카드를 삭제한 경우에서 '아니요, 복구할래요') */
export function restorePlace(id: string): Promise<Place> {
  if (isFakeApiEnabled) return fakePlacesApi.restore(id);
  return apiRequest<Place>(`/places/${encodeURIComponent(id)}/restore`, { method: 'POST' });
}

/** 이전 카드를 새 카드 내용으로 대체 (5-2 보관함에 이미 있는 장소에서 '네'). 이전 카드 id가 남아요 */
export function replacePlace(existingPlaceId: string, newPlaceId: string): Promise<Place> {
  if (isFakeApiEnabled) return fakePlacesApi.replace(existingPlaceId, newPlaceId);
  return apiRequest<Place>(`/places/${encodeURIComponent(existingPlaceId)}/replace`, {
    method: 'POST',
    body: { newPlaceId },
  });
}
