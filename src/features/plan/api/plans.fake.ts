// 가짜 응답: GET /plans/{id}, PUT /plans/{id}가 정해지기 전까지 쓰는 메모리 저장소.
// - fake-plan-1: 후쿠오카 2일 계획 / fake-plan-empty: 노드가 하나도 없는 계획 / 그 외 id: 404
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import type { Plan, UpdatePlanRequest } from '../model/plan.types';

const fakePlans = new Map<string, Plan>([
  [
    'fake-plan-1',
    {
      id: 'fake-plan-1',
      title: '후쿠오카 1박 2일',
      startDate: '2026-11-21',
      endDate: '2026-11-22',
      accommodationPlaceId: 'fake-place-2',
      isDraft: false,
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
      isDraft: true,
      days: [{ date: '2026-12-01', nodes: [] }],
    },
  ],
]);

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
