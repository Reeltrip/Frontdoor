// 화면에서 쓰는 계획 모양. BE 형식(planId, name, stays, areas …)과는 features/plan/api/plans.ts에서 서로 바꿔요
import type { MapPosition } from '@/shared/components/Map';
import type { Place } from '@/features/place/model/place.types';

/** 지도 위 노드 하나. 확정한 순서(배열 순서)대로 동선을 그려요 */
export type PlanNode = {
  /** 서버에 저장된 노드는 planNodeId, 방금 넣은 노드는 임시 id예요 */
  id: string;
  placeId: string;
  /** 이 노드 대신 갈 수 있는 곳. 앞 노드에서 갈라져 다음 노드에서 합쳐져요 */
  planB?: { placeId: string };
  /** 서버엔 플랜B가 여러 개일 수 있어요. 화면은 첫 번째만 쓰고, 나머지는 저장할 때 지우지 않고 돌려줘요 */
  extraPlanBIds?: string[];
};

export type PlanDay = {
  /** 서버의 일차별 완료 상태. 빈 일차는 완료할 수 없어요 */
  isCompleted?: boolean;
  /** YYYY-MM-DD */
  date: string;
  /** 여행 구역 이름. 아직 고르지 않았으면 없음 */
  zone?: string;
  /** 구역 중심 좌표. 이 주변 카드를 그 구역 카드로 봐요 */
  zoneCenter?: MapPosition;
  /** 비어 있으면 노드 선택을 건너뛴 일차 (기능명세서 5-3) */
  nodes: PlanNode[];
};

/**
 * 서버는 DRAFT·COMPLETED를 줘요. draft·complete는 화면에서 바꾼 직후의 값이에요.
 * 빈 일차가 있거나 기간을 늘리면 draft가 돼요 (기능명세서 5-3, 5-4)
 */
export type PlanStatus = 'draft' | 'complete' | 'DRAFT' | 'COMPLETED';

export const isDraftPlanStatus = (status: PlanStatus): boolean => status.toLowerCase() === 'draft';

/** 이 계획에서 내 권한. 로그인 없이 보는 공유 계획은 없어요 */
export type PlanRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export type ShareType = 'READ_ONLY' | 'EDIT';

export type Plan = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  /** 여행 장소(예: 오사카). 서버의 city */
  destination?: string;
  accommodationPlaceId?: string;
  status: PlanStatus;
  role?: PlanRole;
  /** 계획 응답에 들어 있는 카드. 보관함에 없는 카드(공유받은 계획)를 그릴 때 써요 */
  embeddedPlaces?: Place[];
  days: PlanDay[];
};

/** 화면은 계획 전체를 넘기고, api/plans.ts의 updatePlan이 바뀐 부분만 서버에 보내요 */
export type UpdatePlanRequest = Omit<Plan, 'id'>;

export type CreatePlanRequest = {
  title: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  /** 여행 장소. 입력한 글자 그대로 보내요 */
  destination?: string;
};

export type PlanListParams = {
  /** me: 내가 만든 계획 / shared: 공유받은 계획 / 생략: 둘 다 */
  owner?: 'me' | 'shared';
};

/** GET /plans 목록의 한 줄 */
export type PlanSummary = Pick<Plan, 'id' | 'title' | 'startDate' | 'endDate' | 'destination' | 'status'> & {
  /** 계획 첫 노드의 카드 사진. 노드가 없으면 없어요 */
  coverImageUrl?: string;
  /** 모든 일차에 들어 있는 장소 수 합계 */
  placeCount?: number;
};
