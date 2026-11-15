import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlace, placeKeys, replacePlace } from '@/features/place/api/places';
import { usePlaces } from '@/features/place/model/usePlaces';
import { sourceKeys } from '../api/sources';
import type { DuplicatePlacePair, Source } from './sourceStatus.types';

/**
 * 분석이 끝난 링크에서 보관함에 이미 있는 장소가 나왔을 때 (기능명세서 5-2).
 * duplicate가 있으면 EXCEPTION_MODALS.duplicatePlace 안내창을 띄워요.
 * - '네' replaceWithNew: 이전 카드를 새 카드 내용으로 대체해요
 * - '아니요' discardNew: 새 카드를 지워요
 * 겹친 장소가 여러 개면 하나씩 차례로 물어요.
 */
export function useDuplicatePlaces(source: Source | undefined) {
  const queryClient = useQueryClient();
  const { places } = usePlaces();
  const sourceId = source?.id;

  const resolve = useMutation({
    mutationFn: async ({ pair, isReplacing }: { pair: DuplicatePlacePair; isReplacing: boolean }) => {
      if (isReplacing) await replacePlace(pair.existingPlaceId, pair.newPlaceId);
      else await deletePlace(pair.newPlaceId);
    },
    onSuccess: (_data, { pair }) => {
      if (!sourceId) return;
      // 답한 쌍을 바로 빼서, 서버 값을 다시 받는 동안 같은 안내창이 또 뜨지 않게 함
      queryClient.setQueryData<Source>(sourceKeys.detail(sourceId), (current) =>
        current && {
          ...current,
          duplicatePlaces: current.duplicatePlaces?.filter((item) => item.newPlaceId !== pair.newPlaceId),
        },
      );
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: placeKeys.all }),
        sourceId ? queryClient.invalidateQueries({ queryKey: sourceKeys.detail(sourceId) }) : undefined,
      ]),
  });

  const pair = resolve.isPending ? undefined : source?.duplicatePlaces?.[0];

  return {
    /** 지금 물어볼 쌍. 없으면 undefined */
    duplicate: pair,
    /** 안내창에 이름을 보여줄 때 쓰는 카드. 목록을 아직 못 받았으면 undefined */
    existingPlace: pair && places.find((place) => place.id === pair.existingPlaceId),
    newPlace: pair && places.find((place) => place.id === pair.newPlaceId),
    replaceWithNew: () => pair && resolve.mutate({ pair, isReplacing: true }),
    discardNew: () => pair && resolve.mutate({ pair, isReplacing: false }),
    isResolving: resolve.isPending,
    error: resolve.error,
  };
}
