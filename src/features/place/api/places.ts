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
