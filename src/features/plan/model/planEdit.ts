import type { Place } from '@/features/place/model/place.types';
import type { MapRouteStop } from '@/shared/components/Map';
import type { PlanZone } from '../lib/planZones';
import type { Plan, PlanDay, PlanNode } from './plan.types';
import { withDraftIfEmptyDay } from './planDays';

// 여행계획 편집(기능명세서 4-3)에서 계획을 바꾸는 순수 함수들. 원본은 그대로 두고 새 계획을 돌려줘요

const updateDay = (plan: Plan, dayIndex: number, update: (day: PlanDay) => PlanDay): Plan => ({
  ...plan,
  days: plan.days.map((day, index) => (index === dayIndex ? update(day) : day)),
});

const createNodeId = () => `node-${crypto.randomUUID()}`;

export function setAccommodation(plan: Plan, placeId: string | undefined): Plan {
  return { ...plan, accommodationPlaceId: placeId };
}

export function setDayZone(plan: Plan, dayIndex: number, zone: PlanZone): Plan {
  return updateDay(plan, dayIndex, (day) => ({ ...day, zone: zone.name, zoneCenter: zone.center }));
}

/** 확정한 순서대로 뒤에 붙여요. 이미 이 일차의 노드나 플랜B로 있으면 그대로 */
export function addNodeToDay(plan: Plan, dayIndex: number, placeId: string): Plan {
  return updateDay(plan, dayIndex, (day) =>
    day.nodes.some((node) => node.placeId === placeId || node.planB?.placeId === placeId)
      ? day
      : { ...day, nodes: [...day.nodes, { id: createNodeId(), placeId }] },
  );
}

/** 노드를 빼면 앞뒤 노드끼리 다시 이어져요 */
export function removeNodeFromDay(plan: Plan, dayIndex: number, placeId: string): Plan {
  return withDraftIfEmptyDay(
    updateDay(plan, dayIndex, (day) => ({
      ...day,
      nodes: day.nodes.filter((node) => node.placeId !== placeId),
    })),
  );
}

/** 노드는 카드 id로 찾아요. 저장 뒤 서버가 노드 id를 새로 매겨도 같은 노드를 가리켜요 */
export function setPlanB(plan: Plan, dayIndex: number, nodePlaceId: string, planBPlaceId: string): Plan {
  return updateDay(plan, dayIndex, (day) => ({
    ...day,
    nodes: day.nodes.map((node): PlanNode =>
      node.placeId === nodePlaceId ? { ...node, planB: { placeId: planBPlaceId } } : node,
    ),
  }));
}

/**
 * 다른 일차에 있던 카드를 이 일차로 옮겨요. 같은 카드는 한 계획에 한 번만 넣을 수 있어서(서버 규칙)
 * 다른 일차의 노드·플랜B에서 빼고 이 일차 뒤에 붙여요.
 */
export function moveNodeToDay(plan: Plan, dayIndex: number, placeId: string): Plan {
  const removed: Plan = {
    ...plan,
    days: plan.days.map((day, index) =>
      index === dayIndex
        ? day
        : {
            ...day,
            nodes: day.nodes
              .filter((node) => node.placeId !== placeId)
              .map((node): PlanNode =>
                node.planB?.placeId === placeId ? { id: node.id, placeId: node.placeId } : node,
              ),
          },
    ),
  };
  return addNodeToDay(removed, dayIndex, placeId);
}

/** 이 장소가 들어간 다른 일차 번호(1부터). 없으면 undefined. 지도에서 회색으로 보여요 */
export function findOtherDayNumber(plan: Plan, dayIndex: number, placeId: string): number | undefined {
  const index = plan.days.findIndex(
    (day, i) =>
      i !== dayIndex &&
      day.nodes.some((node) => node.placeId === placeId || node.planB?.placeId === placeId),
  );
  return index < 0 ? undefined : index + 1;
}

/** 일차 동선: 숙소에서 출발해 확정한 순서대로 돌고 숙소로 돌아와요 (기능명세서 4-3 숙소 선택) */
export function buildDayRoute(plan: Plan, dayIndex: number): MapRouteStop[] {
  return buildPlanningRoute(plan, dayIndex, { isClosed: true });
}

export function canSetPlanB(plan: Plan, dayIndex: number, target: Place, candidate: Place): boolean {
  // 플랜 B는 다른 카테고리 장소도 고를 수 있어요 (예: 맛집 대신 카페)
  return candidate.id !== target.id &&
    candidate.id !== plan.accommodationPlaceId &&
    !plan.days[dayIndex]?.nodes.some((node) => node.placeId === candidate.id || node.planB?.placeId === candidate.id) &&
    findOtherDayNumber(plan, dayIndex, candidate.id) === undefined;
}

type PlanningRouteOptions = {
  previewPlaceId?: string;
  previewPlanB?: { targetPlaceId: string; placeId: string };
  isClosed?: boolean;
};

/** 편집 중엔 마지막으로 고른 장소까지, 완성 화면에선 숙소로 돌아오는 선까지 그려요. */
export function buildPlanningRoute(
  plan: Plan,
  dayIndex: number,
  { previewPlaceId, previewPlanB, isClosed }: PlanningRouteOptions = {},
): MapRouteStop[] {
  const stops: MapRouteStop[] = (plan.days[dayIndex]?.nodes ?? []).map((node) => {
    if (previewPlanB && node.placeId === previewPlanB.targetPlaceId) {
      return { nodeId: node.placeId, planBNodeId: previewPlanB.placeId, isPlanBPreview: true };
    }
    return { nodeId: node.placeId, planBNodeId: node.planB?.placeId };
  });
  if (previewPlaceId) stops.push({ nodeId: previewPlaceId });
  if (plan.accommodationPlaceId && stops.length > 0) {
    const lodging = { nodeId: plan.accommodationPlaceId };
    stops.unshift(lodging);
    if (isClosed) stops.push(lodging);
  }
  return stops;
}
