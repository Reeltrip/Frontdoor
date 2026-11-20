import { skipToken, useIsMutating, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { getViewStatus } from '@/shared/api/viewStatus';
import { createAiDraft, createPlan, createShareLink, deletePlan, fetchPlan, fetchPlans, planKeys, updatePlan } from '../api/plans';
import type { Plan, PlanListParams, PlanSummary, ShareType } from './plan.types';

type SaveBatch = { pending: number; confirmed: Plan | undefined };
const saveBatches = new WeakMap<QueryClient, Map<string, SaveBatch>>();
const saveScope = (planId: string) => ({ id: planKeys.update(planId).join(':') });

/** 계획 목록. 조건이 없으면 내 계획과 공유받은 계획을 모두 줘요 */
export function usePlans(params: PlanListParams = {}) {
  const query = useQuery({
    queryKey: planKeys.list(params),
    queryFn: ({ signal }) => fetchPlans(params, signal),
  });

  return {
    plans: query.data ?? [],
    viewStatus: getViewStatus(query, (plans) => plans.length === 0),
    error: query.error,
    refetch: query.refetch,
  };
}

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

/** 계획 만들기. 성공하면 응답을 바로 캐시에 넣어서 편집 화면이 다시 불러오지 않아요. */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlan,
    onSuccess: (plan) => {
      queryClient.setQueryData(planKeys.detail(plan.id), plan);
      return queryClient.invalidateQueries({ queryKey: [...planKeys.all, 'list'] });
    },
  });
}

/** AI 초안 응답을 상세 캐시에 반영하고 여행목록을 갱신해요. */
export function useCreateAiDraft(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    scope: saveScope(planId),
    mutationFn: () => createAiDraft(planId),
    onSuccess: (plan) => {
      queryClient.setQueryData(planKeys.detail(planId), plan);
      void queryClient.invalidateQueries({ queryKey: [...planKeys.all, 'list'] });
    },
  });
}

/** 계획 삭제. 성공하면 목록 캐시에서 바로 빼고, 서버 목록으로 다시 맞춰요 */
export function useDeletePlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planIds: string[]) => {
      const results = await Promise.allSettled(planIds.map(deletePlan));
      const deletedIds = new Set<string>();
      const failures: { id: string; error: unknown }[] = [];
      results.forEach((result, index) => {
        const id = planIds[index];
        if (result.status === 'fulfilled') deletedIds.add(id);
        else failures.push({ id, error: result.reason });
      });
      return { deletedIds, failures };
    },
    onSuccess: ({ deletedIds }) => {
      if (!deletedIds.size) return;
      queryClient.setQueriesData<PlanSummary[]>({ queryKey: [...planKeys.all, 'list'] }, (plans) =>
        plans?.filter((plan) => !deletedIds.has(plan.id)),
      );
      deletedIds.forEach((id) => queryClient.removeQueries({ queryKey: planKeys.detail(id) }));
      return queryClient.invalidateQueries({ queryKey: [...planKeys.all, 'list'] });
    },
  });
}

/** 공유 링크 만들기 */
export function useCreateShareLink(planId: string) {
  return useMutation({ mutationFn: (shareType: ShareType) => createShareLink(planId, shareType) });
}

/** 여러 저장이 겹쳐도 마지막 편집을 보여주고, 실패하면 마지막 성공 값으로 복구해요. */
export function useUpdatePlan(planId: string) {
  const queryClient = useQueryClient();
  const planKey = planKeys.detail(planId);
  const mutationKey = planKeys.update(planId);
  const isSaving = useIsMutating({ mutationKey, exact: true }) > 0;

  const mutation = useMutation({
    mutationKey,
    scope: saveScope(planId),
    mutationFn: ({ id: _id, ...request }: Plan) => updatePlan(planId, request),
    onMutate: async (nextPlan) => {
      await queryClient.cancelQueries({ queryKey: planKey, exact: true });
      let batches = saveBatches.get(queryClient);
      if (!batches) {
        batches = new Map();
        saveBatches.set(queryClient, batches);
      }
      let batch = batches.get(planId);
      if (!batch) {
        batch = { pending: 0, confirmed: queryClient.getQueryData<Plan>(planKey) };
        batches.set(planId, batch);
      }
      batch.pending += 1;
      queryClient.setQueryData(planKey, nextPlan);
      return { batch };
    },
    onSuccess: (saved, _nextPlan, context) => {
      context.batch.confirmed = saved;
    },
    onSettled: (_data, _error, _nextPlan, context) => {
      if (!context) return;
      context.batch.pending -= 1;
      if (context.batch.pending > 0) return;
      // 이전 낙관적 값에는 실패한 편집이 섞여 있을 수 있어 마지막 성공 값만 써요.
      if (context.batch.confirmed) queryClient.setQueryData(planKey, context.batch.confirmed);
      saveBatches.get(queryClient)?.delete(planId);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [...planKeys.all, 'list'] }),
        queryClient.invalidateQueries({ queryKey: planKey, exact: true }),
      ]);
    },
  });
  return { ...mutation, isSaving };
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
