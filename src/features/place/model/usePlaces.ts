import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getViewStatus } from '@/shared/api/viewStatus';
import { deletePlace, fetchPlaces, placeKeys, restorePlace, updatePlace } from '../api/places';
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
    /** 목록을 한 번이라도 받았는지. 받기 전에는 "목록에 없는 카드"를 판단하면 안 돼요 */
    isLoaded: query.data !== undefined,
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

/** 카드 삭제. 서버에는 삭제 표시로 남아서, 계획에 들어 있던 카드는 계획 화면에서 복구할 수 있어요 (기능명세서 5-3) */
export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlace,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: placeKeys.all }),
  });
}

/** 삭제한 카드 여러 개를 복구. 목록을 다시 받을 때까지 isPending이 유지돼요 */
export function useRestorePlaces() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeIds: string[]) => Promise.all(placeIds.map((id) => restorePlace(id))),
    // 일부만 복구돼도 목록을 맞추려고 실패했을 때도 다시 불러옴
    onSettled: () => queryClient.invalidateQueries({ queryKey: placeKeys.all }),
  });
}
