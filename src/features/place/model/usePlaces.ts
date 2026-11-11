import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getViewStatus } from '@/shared/api/viewStatus';
import { fetchPlaces, placeKeys, updatePlace } from '../api/places';
import type { Place, PlaceListParams, UpdatePlaceRequest } from './place.types';

const NO_PLACES: Place[] = [];

/** 보관함 카드 목록. viewStatus로 로딩·실패·빈 화면을 고르면 돼요 */
export function usePlaces(params: PlaceListParams = {}) {
  const query = useQuery({
    queryKey: placeKeys.list(params),
    queryFn: ({ signal }) => fetchPlaces(params, signal),
  });

  return {
    places: query.data ?? NO_PLACES,
    viewStatus: getViewStatus(query, (places) => places.length === 0),
    error: query.error,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

/** 카드 수정. 성공하면 모든 카테고리 목록을 다시 불러와요 (카테고리가 바뀌면 다른 목록으로 옮겨가서) */
export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdatePlaceRequest }) => updatePlace(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: placeKeys.all }),
  });
}
