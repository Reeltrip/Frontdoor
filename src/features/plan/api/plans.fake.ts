// 가짜 응답: GET /plans/{id}, PUT /plans/{id}가 정해지기 전까지 쓰는 메모리 저장소.
// - fake-plan-1: 후쿠오카 2일 계획 / fake-plan-empty: 노드가 하나도 없는 계획 / 그 외 id: 404
// - fake-plan-3days: 기간 변경(기능명세서 5-4)을 볼 때 쓰는 3일 계획
// - POST /plans: 기간이 다른 계획과 겹치면 409 PLAN_PERIOD_OVERLAP (isForced면 통과)
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import { listDates } from '../model/planDays';
import type { CreatePlanRequest, Plan, PlanPeriodOverlapDetails, UpdatePlanRequest } from '../model/plan.types';

const fakePlans = new Map<string, Plan>([
  [
    'fake-plan-1',
    {
      id: 'fake-plan-1',
      title: '후쿠오카 1박 2일',
      startDate: '2026-11-21',
      endDate: '2026-11-22',
      accommodationPlaceId: 'fake-place-2',
      status: 'complete',
      days: [
        {
          date: '2026-11-21',
          zone: '하카타',
          nodes: [
            { id: 'fake-node-1', placeId: 'fake-place-2' },
            { id: 'fake-node-2', placeId: 'fake-place-1', planB: { placeId: 'fake-place-3' } },
            { id: 'fake-node-3', placeId: 'fake-place-3' },
          ],
        },
        { date: '2026-11-22', zone: '텐진', nodes: [{ id: 'fake-node-4', placeId: 'fake-place-1' }] },
      ],
    },
  ],
  [
    'fake-plan-empty',
    {
      id: 'fake-plan-empty',
      title: '아직 비어 있는 계획',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      status: 'draft',
      days: [{ date: '2026-12-01', nodes: [] }],
    },
  ],
  [
    'fake-plan-3days',
    {
      id: 'fake-plan-3days',
      title: '후쿠오카 2박 3일',
      startDate: '2026-12-10',
      endDate: '2026-12-12',
      status: 'complete',
      days: [
        {
          date: '2026-12-10',
          zone: '하카타',
          nodes: [
            { id: 'fake-node-11', placeId: 'fake-place-2' },
            { id: 'fake-node-12', placeId: 'fake-place-1' },
          ],
        },
        { date: '2026-12-11', zone: '텐진', nodes: [{ id: 'fake-node-13', placeId: 'fake-place-3' }] },
        { date: '2026-12-12', zone: '다자이후', nodes: [{ id: 'fake-node-14', placeId: 'fake-place-1' }] },
      ],
    },
  ],
]);

let nextPlanNumber = 1;

let shouldFailNextSave = false;

/** 다음 저장 한 번을 500으로 실패시켜요. 낙관적 업데이트가 되돌아가는지 볼 때 씀 */
export function failNextFakePlanSave() {
  shouldFailNextSave = true;
}

const findPlan = (id: string) => {
  const plan = fakePlans.get(id);
  if (!plan) throw new ApiError({ status: 404, code: 'NOT_FOUND', message: '여행계획을 찾을 수 없어요.' });
  return plan;
};

export const fakePlansApi = {
  create: ({ title, startDate, endDate, isForced = false }: CreatePlanRequest) =>
    fakeResponse(() => {
      const dates = listDates(startDate, endDate);
      if (dates.length === 0) {
        throw new ApiError({ status: 400, code: 'BAD_REQUEST', message: '여행 기간을 다시 확인해 주세요.' });
      }

      // 날짜가 YYYY-MM-DD라서 글자 비교로 앞뒤를 알 수 있음
      const overlappingPlans = [...fakePlans.values()].filter(
        (plan) => plan.startDate <= endDate && plan.endDate >= startDate,
      );
      if (overlappingPlans.length > 0 && !isForced) {
        const details: PlanPeriodOverlapDetails = {
          overlappingPlans: overlappingPlans.map((plan) => ({
            id: plan.id,
            title: plan.title,
            startDate: plan.startDate,
            endDate: plan.endDate,
          })),
        };
        throw new ApiError({
          status: 409,
          code: 'PLAN_PERIOD_OVERLAP',
          message: '선택한 기간 내에 다른 계획이 존재해요.',
          details,
        });
      }

      const id = `fake-plan-new-${nextPlanNumber}`;
      nextPlanNumber += 1;
      // 날짜만 있는 빈 일차로 시작해서 작성 중인 계획
      const created: Plan = {
        id,
        title,
        startDate,
        endDate,
        status: 'draft',
        days: dates.map((date) => ({ date, nodes: [] })),
      };
      fakePlans.set(id, created);
      return created;
    }),

  get: (id: string, signal?: AbortSignal) => fakeResponse(() => findPlan(id), { signal }),

  update: (id: string, request: UpdatePlanRequest) =>
    fakeResponse(() => {
      findPlan(id);
      if (shouldFailNextSave) {
        shouldFailNextSave = false;
        throw new ApiError({ status: 500, code: 'SERVER_ERROR', message: '저장하지 못했어요.' });
      }
      const saved: Plan = { ...request, id };
      fakePlans.set(id, saved);
      return saved;
    }),
};
