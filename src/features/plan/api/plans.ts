import { apiRequest } from '@/shared/api/client';
import { isFakeApiEnabled } from '@/shared/lib/env';
import type { CreatePlanRequest, Plan, PlanSummary, UpdatePlanRequest } from '../model/plan.types';
import { fakePlansApi } from './plans.fake';

// 여행계획 쿼리·뮤테이션 키는 여기서만 만들어요
export const planKeys = {
  all: ['plans'] as const,
  list: () => [...planKeys.all, 'list'] as const,
  detail: (id: string) => [...planKeys.all, id] as const,
  update: (id: string) => [...planKeys.all, id, 'update'] as const,
};

/** 내 계획 목록. 최근에 만든 계획이 위에 와요 (가짜 형식: GET /plans) */
export function fetchPlans(signal?: AbortSignal): Promise<PlanSummary[]> {
  if (isFakeApiEnabled) return fakePlansApi.list(signal);
  return apiRequest<PlanSummary[]>('/plans', { signal });
}

export function fetchPlan(id: string, signal?: AbortSignal): Promise<Plan> {
  if (isFakeApiEnabled) return fakePlansApi.get(id, signal);
  return apiRequest<Plan>(`/plans/${encodeURIComponent(id)}`, { signal });
}

export function updatePlan(id: string, request: UpdatePlanRequest): Promise<Plan> {
  if (isFakeApiEnabled) return fakePlansApi.update(id, request);
  return apiRequest<Plan>(`/plans/${encodeURIComponent(id)}`, { method: 'PUT', body: request });
}

/** 계획 만들기. 같은 기간에 다른 계획이 있으면 409 PLAN_PERIOD_OVERLAP (isForced면 통과) */
export function createPlan(request: CreatePlanRequest): Promise<Plan> {
  if (isFakeApiEnabled) return fakePlansApi.create(request);
  return apiRequest<Plan>('/plans', { method: 'POST', body: request });
}
