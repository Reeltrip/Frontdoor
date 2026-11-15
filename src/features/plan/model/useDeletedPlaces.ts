import { usePlaces, useRestorePlaces } from '@/features/place/model/usePlaces';
import { findMissingPlaceIds, removePlacesFromPlan } from './planDays';
import { usePlan, useUpdatePlan } from './usePlan';

const NO_PLACE_IDS: string[] = [];

/**
 * 계획에 넣은 카드가 삭제됐는지 확인 (기능명세서 5-3). 계획 화면에 들어올 때 불러요.
 * hasDeletedPlaces가 true면 EXCEPTION_MODALS.deletedPlaceInPlan 안내창을 띄워요.
 * - '네' removeDeletedNodes: 그 노드를 빼고 저장해요 (남은 노드끼리 동선이 이어져요)
 * - '아니요, 복구할래요' restoreDeletedPlaces: 카드를 복구해요
 * 삭제 여부는 "계획의 카드 id가 보관함 목록에 없다"로 판단해요 (가정).
 */
export function useDeletedPlaces(planId: string | undefined) {
  const { plan } = usePlan(planId);
  const { places, isLoaded: isPlaceListLoaded } = usePlaces();
  const updatePlan = useUpdatePlan(planId ?? '');
  const restorePlaces = useRestorePlaces();

  // 목록을 받기 전에는 모든 카드가 없는 것처럼 보이니까 판단하지 않음
  const deletedPlaceIds = plan && isPlaceListLoaded ? findMissingPlaceIds(plan, places) : NO_PLACE_IDS;
  const isResolving = updatePlan.isPending || restorePlaces.isPending;

  return {
    deletedPlaceIds,
    /** 저장·복구 중에는 false라서 안내창이 닫혀 있어요. 실패하면 다시 true가 돼요 */
    hasDeletedPlaces: deletedPlaceIds.length > 0 && !isResolving,
    removeDeletedNodes: () => {
      if (plan) updatePlan.mutate(removePlacesFromPlan(plan, deletedPlaceIds));
    },
    restoreDeletedPlaces: () => restorePlaces.mutate(deletedPlaceIds),
    isResolving,
    error: updatePlan.error ?? restorePlaces.error,
  };
}
