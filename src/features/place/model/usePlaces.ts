import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getViewStatus } from '@/shared/api/viewStatus';
import {
  deletePlace,
  fetchDeletedPlaces,
  fetchPlaces,
  placeKeys,
  purgePlaces,
  restorePlaces,
  updatePlace,
} from '../api/places';
import type { Place, PlaceListParams, UpdatePlaceRequest } from './place.types';

const NO_PLACES: Place[] = [];

/** 보관함 카드 목록. viewStatus로 로딩·실패·빈 화면을 고르면 돼요 */
export function usePlaces(params: PlaceListParams = {}, { isEnabled = true }: { isEnabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: placeKeys.list(params),
    queryFn: ({ signal }) => fetchPlaces(params, signal),
    // 로그인 없이 보는 공유 계획에서는 보관함을 부르지 않아요
    enabled: isEnabled,
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

/** 휴지통 카드 목록 */
export function useDeletedPlaces() {
  const query = useQuery({
    queryKey: placeKeys.deleted(),
    queryFn: ({ signal }) => fetchDeletedPlaces(signal),
  });

  return {
    places: query.data ?? NO_PLACES,
    viewStatus: getViewStatus(query, (places) => places.length === 0),
    error: query.error,
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

/** 카드 삭제. 서버가 휴지통으로 옮기고, 그 카드를 쓰던 계획의 노드·플랜B·숙소에서도 빼요 */
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
    mutationFn: (placeIds: string[]) => restorePlaces(placeIds),
    // 일부만 복구돼도 목록을 맞추려고 실패했을 때도 다시 불러옴
    onSettled: () => queryClient.invalidateQueries({ queryKey: placeKeys.all }),
  });
}

/** 휴지통에서 여러 개를 완전히 삭제. 일부만 지워져도 목록을 맞추려고 끝나면 다시 불러와요 */
export function usePurgePlaces() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeIds: string[]) => purgePlaces(placeIds),
    onSettled: () => queryClient.invalidateQueries({ queryKey: placeKeys.all }),
  });
}
