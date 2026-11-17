import type { MapRouteStop } from '@/shared/components/Map';
import type { PlanZone } from '../lib/planZones';
import type { Plan, PlanDay, PlanNode } from './plan.types';

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

/** 확정한 순서대로 뒤에 붙여요. 이미 이 일차에 있으면 그대로 */
export function addNodeToDay(plan: Plan, dayIndex: number, placeId: string): Plan {
  return updateDay(plan, dayIndex, (day) =>
    day.nodes.some((node) => node.placeId === placeId)
      ? day
      : { ...day, nodes: [...day.nodes, { id: createNodeId(), placeId }] },
  );
}

/** 노드를 빼면 앞뒤 노드끼리 다시 이어져요 */
export function removeNodeFromDay(plan: Plan, dayIndex: number, placeId: string): Plan {
  return updateDay(plan, dayIndex, (day) => ({
    ...day,
    nodes: day.nodes.filter((node) => node.placeId !== placeId),
  }));
}

export function setPlanB(plan: Plan, dayIndex: number, nodeId: string, planBPlaceId: string): Plan {
  return updateDay(plan, dayIndex, (day) => ({
    ...day,
    nodes: day.nodes.map((node): PlanNode =>
      node.id === nodeId ? { ...node, planB: { placeId: planBPlaceId } } : node,
    ),
  }));
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
  const day = plan.days[dayIndex];
  if (!day) return [];
  const stops: MapRouteStop[] = day.nodes.map((node) => ({
    nodeId: node.placeId,
    planBNodeId: node.planB?.placeId,
  }));
  const lodgingId = plan.accommodationPlaceId;
  if (!lodgingId || stops.length === 0) return stops;
  return [{ nodeId: lodgingId }, ...stops, { nodeId: lodgingId }];
}
