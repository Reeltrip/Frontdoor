import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getViewStatus } from '@/shared/api/viewStatus';
import { fetchPlan, planKeys, updatePlan } from '../api/plans';
import type { Plan } from './plan.types';

/** 여행계획 하나. 모든 일차에 노드가 없으면 빈 화면(empty)이에요 */
export function usePlan(planId: string | undefined) {
  const query = useQuery({
    queryKey: planKeys.detail(planId ?? ''),
    queryFn: planId ? ({ signal }) => fetchPlan(planId, signal) : skipToken,
  });

  return {
    plan: query.data,
    viewStatus: getViewStatus(query, (plan) => plan.days.every((day) => day.nodes.length === 0)),
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * 계획 저장 (PUT). 화면을 먼저 바꾸고 저장해요. 실패하면 바꾸기 전으로 되돌려요.
 * 노드 순서를 빠르게 여러 번 바꿔도 마지막 저장이 끝난 뒤에만 서버 값을 다시 불러와요.
 */
export function useUpdatePlan(planId: string) {
  const queryClient = useQueryClient();
  const planKey = planKeys.detail(planId);
  const mutationKey = planKeys.update(planId);

  return useMutation({
    mutationKey,
    mutationFn: ({ id: _id, ...request }: Plan) => updatePlan(planId, request),
    onMutate: async (nextPlan) => {
      await queryClient.cancelQueries({ queryKey: planKey });
      const previousPlan = queryClient.getQueryData<Plan>(planKey);
      queryClient.setQueryData(planKey, nextPlan);
      return { previousPlan };
    },
    onError: (_error, _nextPlan, result) => {
      if (result?.previousPlan) queryClient.setQueryData(planKey, result.previousPlan);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey }) === 1) {
        return queryClient.invalidateQueries({ queryKey: planKey });
      }
    },
  });
}

/** 한 일차 안에서 노드 하나를 옮긴 새 계획을 돌려줘요 (원본은 그대로) */
export function moveNodeInDay(plan: Plan, dayIndex: number, fromIndex: number, toIndex: number): Plan {
  const day = plan.days[dayIndex];
  if (!day || toIndex < 0 || toIndex >= day.nodes.length) return plan;

  const nodes = [...day.nodes];
  const [moved] = nodes.splice(fromIndex, 1);
  nodes.splice(toIndex, 0, moved);

  return {
    ...plan,
    days: plan.days.map((item, index) => (index === dayIndex ? { ...item, nodes } : item)),
  };
}
