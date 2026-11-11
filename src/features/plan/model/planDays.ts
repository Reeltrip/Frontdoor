// 일차·기간·상태를 다루는 계산 함수. 모두 원본 계획은 그대로 두고 새 계획을 돌려줘요.
import type { Plan, PlanDay, PlanNode } from './plan.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 시간대에 따라 날짜가 밀리지 않게 UTC 자정으로 계산
const toTime = (date: string) => Date.parse(`${date}T00:00:00Z`);

/** 시작일부터 종료일까지의 날짜(YYYY-MM-DD). 날짜가 잘못됐거나 종료일이 더 빠르면 빈 배열 */
export function listDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  for (let time = toTime(startDate); time <= toTime(endDate); time += DAY_MS) {
    dates.push(new Date(time).toISOString().slice(0, 10));
  }
  return dates;
}

/** '2026-11-21' → '11.21 (토)' */
export function formatDayDate(date: string): string {
  const day = new Date(toTime(date));
  return `${day.getUTCMonth() + 1}.${day.getUTCDate()} (${WEEKDAYS[day.getUTCDay()]})`;
}

export function hasEmptyDay(plan: Pick<Plan, 'days'>): boolean {
  return plan.days.some((day) => day.nodes.length === 0);
}

/**
 * 빈 일차가 있으면 '작성 중'으로 바꿔요 (기능명세서 5-3, 5-4).
 * 빈 일차가 없다고 '완성'으로 올리지는 않아요. 완성은 finishPlan에서만 해요.
 */
export function withDraftIfEmptyDay(plan: Plan): Plan {
  return hasEmptyDay(plan) ? { ...plan, status: 'draft' } : plan;
}

/** 노드 선택을 마쳤을 때. 건너뛴(빈) 일차가 하나라도 있으면 다른 일차가 완성됐어도 '작성 중'이에요 (5-3) */
export function finishPlan(plan: Plan): Plan {
  return { ...plan, status: hasEmptyDay(plan) ? 'draft' : 'complete' };
}

/** 한 일차의 노드를 정해요. 카드 0개로 건너뛰면 날짜만 있는 빈 일차가 돼요 (5-3) */
export function setDayNodes(plan: Plan, dayIndex: number, nodes: PlanNode[]): Plan {
  return withDraftIfEmptyDay({
    ...plan,
    days: plan.days.map((day, index) => (index === dayIndex ? { ...day, nodes } : day)),
  });
}

/** none: 그대로 / move: 길이는 같고 날짜만 이동 / extend: 늘어남 / shrink: 줄어듦 */
export type PeriodChange = 'none' | 'move' | 'extend' | 'shrink';

export function getPeriodChange(plan: Plan, startDate: string, endDate: string): PeriodChange {
  if (plan.startDate === startDate && plan.endDate === endDate) return 'none';
  const dayCount = listDates(startDate, endDate).length;
  if (dayCount < plan.days.length) return 'shrink';
  if (dayCount > plan.days.length) return 'extend';
  return 'move';
}

/**
 * 계획 기간을 바꿔요 (기능명세서 5-4).
 * - 줄일 때: keptDayIndexes로 고른 일차만 남겨요 (KeepDaysModal에서 고른 값)
 * - 늘릴 때: 늘어난 날짜는 빈 일차로 추가되고 계획은 '작성 중'이 돼요
 * 남는 일차의 날짜가 모두 새 기간 안에 있으면 그 날짜에 그대로 두고, 아니면 첫날부터 순서대로 다시 배치해요.
 */
export function changePlanPeriod(plan: Plan, startDate: string, endDate: string, keptDayIndexes?: number[]): Plan {
  const dates = listDates(startDate, endDate);
  if (dates.length === 0) return plan;

  const isShrinking = dates.length < plan.days.length;
  const keptDays: PlanDay[] = isShrinking
    ? [...new Set(keptDayIndexes ?? [])]
        .sort((a, b) => a - b)
        .flatMap((index) => plan.days[index] ?? [])
        .slice(0, dates.length)
    : plan.days;

  const canKeepDates = keptDays.every((day) => dates.includes(day.date));
  const days = dates.map((date, index): PlanDay => {
    const keptDay = canKeepDates ? keptDays.find((day) => day.date === date) : keptDays[index];
    return keptDay ? { ...keptDay, date } : { date, nodes: [] };
  });

  return withDraftIfEmptyDay({ ...plan, startDate, endDate, days });
}

/** 계획에서 쓰는 카드 중 보관함 목록에 없는(삭제된) 카드 id (5-3 계획에 넣은 카드를 삭제한 경우) */
export function findMissingPlaceIds(plan: Plan, places: { id: string }[]): string[] {
  const libraryIds = new Set(places.map((place) => place.id));
  const usedIds = plan.days.flatMap((day) =>
    day.nodes.flatMap((node) => (node.planB ? [node.placeId, node.planB.placeId] : [node.placeId])),
  );
  if (plan.accommodationPlaceId) usedIds.push(plan.accommodationPlaceId);
  return [...new Set(usedIds)].filter((id) => !libraryIds.has(id));
}

/**
 * 삭제된 카드의 노드를 빼요. 동선은 배열 순서대로 그리니까 빼기만 해도 앞뒤 노드가 이어져요.
 * 플랜B만 삭제됐으면 플랜B만 떼고, 숙소가 삭제됐으면 숙소를 비워요. 일차가 비면 '작성 중'이 돼요.
 */
export function removePlacesFromPlan(plan: Plan, placeIds: string[]): Plan {
  const removedIds = new Set(placeIds);
  const { accommodationPlaceId, ...rest } = plan;

  return withDraftIfEmptyDay({
    ...rest,
    ...(accommodationPlaceId && !removedIds.has(accommodationPlaceId) ? { accommodationPlaceId } : {}),
    days: plan.days.map((day) => ({
      ...day,
      nodes: day.nodes
        .filter((node) => !removedIds.has(node.placeId))
        .map((node): PlanNode => {
          if (!node.planB || !removedIds.has(node.planB.placeId)) return node;
          const { planB: _planB, ...nodeWithoutPlanB } = node;
          return nodeWithoutPlanB;
        }),
    })),
  });
}
