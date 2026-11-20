import { ApiError, apiRequest } from '@/shared/api/client';
import { fromApiCategory, type ApiCategory } from '@/features/place/api/places';
import type { Place } from '@/features/place/model/place.types';
import {
  isDraftPlanStatus,
  type CreatePlanRequest,
  type Plan,
  type PlanDay,
  type PlanNode,
  type PlanListParams,
  type PlanRole,
  type PlanSummary,
  type ShareType,
  type UpdatePlanRequest,
} from '../model/plan.types';

// 여행계획 쿼리·뮤테이션 키는 여기서만 만들어요
export const planKeys = {
  all: ['plans'] as const,
  list: (params: PlanListParams = {}) => [...planKeys.all, 'list', params] as const,
  detail: (id: string) => [...planKeys.all, id] as const,
  update: (id: string) => [...planKeys.all, id, 'update'] as const,
};

// ── BE 형식 (docs/api-spec.md 여행계획) ──

type ApiPlanStatus = 'DRAFT' | 'COMPLETED';

type ApiPlanSummary = {
  planId: number;
  name: string;
  startDate: string;
  endDate: string;
  city: string | null;
  status: ApiPlanStatus;
  coverImageUrl?: string | null;
  /** 목록 응답에만 있어요 */
  placeCount?: number;
  createdAt?: string | null;
};

type ApiNode = {
  planNodeId: number;
  placeId: number;
  category: ApiCategory;
  name: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  /** 마커에 Google 장소 사진을 그릴 때 써요. 없는 카드는 null */
  googlePlaceId?: string | null;
  alternatives: { placeId: number; name: string }[];
};

type ApiDay = {
  dayNumber: number;
  date: string;
  isCompleted: boolean;
  areas: { name: string; latitude: number | null; longitude: number | null }[];
  nodes: ApiNode[];
};

type ApiPlan = ApiPlanSummary & {
  role: PlanRole | null;
  stays: { placeId: number; name: string; latitude: number | null; longitude: number | null; googlePlaceId?: string | null }[];
  days: ApiDay[];
};

const toLocation = (latitude: number | null, longitude: number | null) =>
  latitude !== null && longitude !== null ? { location: { lat: latitude, lng: longitude } } : {};

/** 계획 응답에 들어 있는 카드 정보. 로그인 없이 보는 공유 계획은 보관함이 없어서 이걸로 그려요 */
function toEmbeddedPlaces(plan: ApiPlan): Place[] {
  const stays: Place[] = plan.stays.map((stay) => ({
    id: String(stay.placeId),
    category: 'accommodation',
    name: stay.name,
    imageUrl: '',
    summary: [],
    ...toLocation(stay.latitude, stay.longitude),
    ...(stay.googlePlaceId ? { googlePlaceId: stay.googlePlaceId } : {}),
  }));
  const nodes: Place[] = plan.days.flatMap((day) =>
    day.nodes.flatMap((node) => [
      {
        id: String(node.placeId),
        category: fromApiCategory(node.category),
        name: node.name,
        imageUrl: node.imageUrl ?? '',
        summary: [],
        ...toLocation(node.latitude, node.longitude),
        ...(node.googlePlaceId ? { googlePlaceId: node.googlePlaceId } : {}),
      },
      // 플랜B는 대신할 노드와 같은 카테고리만 넣을 수 있어요 (서버 규칙)
      ...node.alternatives.map((alternative) => ({
        id: String(alternative.placeId),
        category: fromApiCategory(node.category),
        name: alternative.name,
        imageUrl: '',
        summary: [],
      })),
    ]),
  );
  return [...new Map([...stays, ...nodes].map((place) => [place.id, place])).values()];
}

function toPlan(plan: ApiPlan): Plan {
  return {
    id: String(plan.planId),
    title: plan.name,
    startDate: plan.startDate,
    endDate: plan.endDate,
    ...(plan.city ? { destination: plan.city } : {}),
    ...(plan.stays[0] ? { accommodationPlaceId: String(plan.stays[0].placeId) } : {}),
    status: plan.status,
    ...(plan.role ? { role: plan.role } : {}),
    embeddedPlaces: toEmbeddedPlaces(plan),
    days: plan.days.map((day): PlanDay => {
      const area = day.areas[0];
      return {
        date: day.date,
        isCompleted: day.isCompleted,
        ...(area ? { zone: area.name } : {}),
        ...(area && area.latitude !== null && area.longitude !== null
          ? { zoneCenter: { lat: area.latitude, lng: area.longitude } }
          : {}),
        nodes: day.nodes.map((node) => ({
          id: String(node.planNodeId),
          placeId: String(node.placeId),
          ...(node.alternatives[0] ? { planB: { placeId: String(node.alternatives[0].placeId) } } : {}),
          ...(node.alternatives.length > 1
            ? { extraPlanBIds: node.alternatives.slice(1).map((alternative) => String(alternative.placeId)) }
            : {}),
        })),
      };
    }),
  };
}

const toSummary = (plan: ApiPlanSummary): PlanSummary => ({
  id: String(plan.planId),
  title: plan.name,
  startDate: plan.startDate,
  endDate: plan.endDate,
  ...(plan.city ? { destination: plan.city } : {}),
  status: plan.status,
  ...(plan.coverImageUrl ? { coverImageUrl: plan.coverImageUrl } : {}),
  ...(typeof plan.placeCount === 'number' ? { placeCount: plan.placeCount } : {}),
  ...(plan.createdAt ? { createdAt: plan.createdAt } : {}),
});

const planPath = (id: string) => `/plans/${encodeURIComponent(id)}`;

/** 계획 목록. 최근에 만든 계획이 위에 와요. owner가 shared면 공유받은 계획만 */
export function fetchPlans(params: PlanListParams = {}, signal?: AbortSignal): Promise<PlanSummary[]> {
  return apiRequest<{ plans: ApiPlanSummary[] }>('/plans', {
    query: { owner: params.owner, page: 0, size: 100 },
    signal,
  }).then((response) => response.plans.map(toSummary));
}

/** 공유를 켠 계획은 로그인 없이도 열려요. 함께 편집 링크로 들어온 로그인 회원은 편집 멤버가 돼요 */
export function fetchPlan(id: string, signal?: AbortSignal): Promise<Plan> {
  return apiRequest<ApiPlan>(planPath(id), { signal }).then(toPlan);
}

/** AI가 기존 동선을 새 초안으로 덮어써요. 요청 본문은 보내지 않아요. */
export function createAiDraft(planId: string): Promise<Plan> {
  return apiRequest<ApiPlan>(`${planPath(planId)}/ai-drafts`, { method: 'POST' }).then(toPlan);
}

/** 계획 만들기. 서버가 기간에 맞춰 빈 일차를 만들어요 */
export async function createPlan(request: CreatePlanRequest): Promise<Plan> {
  const created = await apiRequest<{ planId: number }>('/plans', {
    method: 'POST',
    body: { name: request.title, startDate: request.startDate, endDate: request.endDate, city: request.destination },
  });
  return fetchPlan(String(created.planId));
}

/** 계획 삭제. 계획을 만든 사람(OWNER)만 할 수 있고 되돌릴 수 없어요 */
export function deletePlan(id: string): Promise<void> {
  return apiRequest<void>(planPath(id), { method: 'DELETE' });
}

/** 이 노드가 서버에 보낼 플랜B 카드 id. 화면이 쓰는 첫 플랜B 뒤에 추가 플랜B를 붙여요 */
const getAlternativeIds = (node: PlanNode) => (node.planB ? [node.planB.placeId, ...(node.extraPlanBIds ?? [])] : []);
const getNodePlaceIds = (node: PlanNode) => [node.placeId, ...getAlternativeIds(node)];

const dayNodeKey = (nodes: PlanNode[]) =>
  nodes.map((node) => `${node.placeId}:${getAlternativeIds(node).join('|')}`).join(',');

/**
 * 화면은 계획 전체를 한 번에 저장하지만 서버는 기본 정보·숙소·구역·일자별 노드를 따로 받아요.
 * 지금 서버 값과 비교해 바뀐 부분만 차례로 보내고, 끝나면 서버 값을 다시 받아 돌려줘요.
 */
export async function updatePlan(id: string, request: UpdatePlanRequest): Promise<Plan> {
  let current = await fetchPlan(id);

  const hasInfoChange =
    current.title !== request.title ||
    current.startDate !== request.startDate ||
    current.endDate !== request.endDate ||
    (request.destination !== undefined && current.destination !== request.destination);
  if (hasInfoChange) {
    // 기간이 바뀌면 서버가 일차 수를 맞춰요. 그 뒤에 일차 내용을 다시 넣어요
    current = toPlan(
      await apiRequest<ApiPlan>(planPath(id), {
        method: 'PATCH',
        body: {
          name: request.title,
          startDate: request.startDate,
          endDate: request.endDate,
          ...(request.destination ? { city: request.destination } : {}),
        },
      }),
    );
  }

  if (current.accommodationPlaceId !== request.accommodationPlaceId) {
    await apiRequest<unknown>(`${planPath(id)}/stays`, {
      method: 'PUT',
      body: { placeIds: request.accommodationPlaceId ? [Number(request.accommodationPlaceId)] : [] },
    });
  }

  const isDraft = isDraftPlanStatus(request.status);
  const requestDays = request.days.slice(0, current.days.length);

  // 같은 카드가 두 일차에 있으면 서버가 거절해요. 요청을 보내기 전에 막아서 앞선 저장만 반영되는 일을 없애요
  const allIds = requestDays.flatMap((day) => day.nodes.flatMap((node) => [node.placeId, ...(node.planB ? [node.planB.placeId] : [])]));
  if (new Set(allIds).size !== allIds.length) {
    throw new ApiError({ status: 409, code: 'DUPLICATE_PLAN_PLACE', message: '이미 다른 일자에 넣은 장소예요.' });
  }
  // 추가 플랜B는 화면이 모르는 카드예요. 그 카드를 계획의 다른 곳에 넣었거나 플랜B를 뗐으면 같이 빼요
  const days = requestDays.map((day): PlanDay => ({
    ...day,
    nodes: day.nodes.map((node): PlanNode => {
      const { extraPlanBIds, ...rest } = node;
      const keptIds = node.planB ? (extraPlanBIds ?? []).filter((placeId) => !allIds.includes(placeId)) : [];
      return keptIds.length > 0 ? { ...rest, extraPlanBIds: keptIds } : rest;
    }),
  }));
  const isCompletedDay = (day: PlanDay) => day.nodes.length > 0 && (day.isCompleted ?? !isDraft);
  const changedIndexes = days.flatMap((day, index) => {
    const before = current.days[index];
    const isSame =
      dayNodeKey(before.nodes) === dayNodeKey(day.nodes) &&
      isCompletedDay(before) === isCompletedDay(day);
    return isSame ? [] : [index];
  });

  for (const [index, day] of days.entries()) {
    const before = current.days[index];
    if (day.zone && day.zoneCenter && day.zone !== before.zone) {
      await apiRequest<unknown>(`${planPath(id)}/days/${index + 1}/areas`, {
        method: 'PUT',
        body: { areas: [{ name: day.zone, latitude: day.zoneCenter.lat, longitude: day.zoneCenter.lng }] },
      });
    }
  }

  const putDay = (index: number, day: PlanDay, isCompleted: boolean) =>
    apiRequest<unknown>(`${planPath(id)}/days/${index + 1}`, {
      method: 'PUT',
      body: {
        nodes: day.nodes.map((node) => ({
          placeId: Number(node.placeId),
          alternativePlaceIds: getAlternativeIds(node).map(Number),
        })),
        isCompleted,
      },
    });

  // 같은 카드는 한 계획에 한 번만 들어가요. 카드가 다른 일차로 옮겨 가면 원래 일차에서 먼저 빼야 서버가 받아요.
  // 그래서 카드가 빠져나가는 일차만, 새로 들어오는 카드 없이 "남는 노드"로 먼저 저장해요 (남는 노드는 지우지 않아요)
  const usedIds = (day: PlanDay) => day.nodes.flatMap(getNodePlaceIds);
  for (const index of changedIndexes) {
    const beforeIds = new Set(usedIds(current.days[index]));
    const leavingIds = [...beforeIds].filter(
      (placeId) => !usedIds(days[index]).includes(placeId) && days.some((day, dayIndex) => dayIndex !== index && usedIds(day).includes(placeId)),
    );
    if (leavingIds.length === 0) continue;
    const staying: PlanDay = {
      ...days[index],
      nodes: days[index].nodes
        .filter((node) => beforeIds.has(node.placeId))
        .map((node): PlanNode => {
          if (!node.planB || !beforeIds.has(node.planB.placeId)) return { id: node.id, placeId: node.placeId };
          const keptIds = (node.extraPlanBIds ?? []).filter((placeId) => beforeIds.has(placeId));
          return { id: node.id, placeId: node.placeId, planB: node.planB, ...(keptIds.length > 0 ? { extraPlanBIds: keptIds } : {}) };
        }),
    };
    await putDay(index, staying, false);
  }
  for (const index of changedIndexes) await putDay(index, days[index], isCompletedDay(days[index]));

  return fetchPlan(id);
}

/** 공유 링크 만들기. 읽기 전용은 로그인 없이 볼 수 있고, 함께 편집은 로그인한 사람이 편집 멤버가 돼요 */
export function createShareLink(planId: string, shareType: ShareType): Promise<{ shareUrl: string; shareType: ShareType }> {
  return apiRequest<{ shareUrl: string; shareType: ShareType }>(`${planPath(planId)}/share-links`, {
    method: 'POST',
    body: { shareType },
  });
}

// ── 경로 (docs/api-spec.md 경로) ──

export type RouteMode = 'WALK' | 'TAXI' | 'SUBWAY' | 'BUS' | 'TRAIN' | 'TRAM' | 'TRANSIT';

export type RouteSegment = { mode: RouteMode; minutes: number; lineName: string | null; stopName: string | null };

export type PlaceRoute = {
  totalMinutes: number;
  departAt: string;
  arriveAt: string;
  segments: RouteSegment[];
  /** 그 경로의 길 모양(Google encoded polyline). 서버가 받지 못했으면 null이에요 */
  polyline?: string | null;
};

export const routeKeys = {
  between: (fromPlaceId: string, toPlaceId: string, date: string) => ['routes', fromPlaceId, toPlaceId, date] as const,
};

/** 두 카드 사이 가장 빠른 경로. 대중교통·도보·택시 중 하나예요 */
export function fetchRoute(fromPlaceId: string, toPlaceId: string, departAt: string, signal?: AbortSignal): Promise<PlaceRoute> {
  return apiRequest<PlaceRoute>('/routes', { query: { from: fromPlaceId, to: toPlaceId, departAt }, signal });
}
