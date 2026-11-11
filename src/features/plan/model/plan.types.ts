// 가짜 형식: BE와 GET /plans/{id}, PUT /plans/{id} 형식이 정해지면 그대로 옮겨 적기

/** 지도 위 노드 하나. 확정한 순서(배열 순서)대로 동선을 그려요 */
export type PlanNode = {
  id: string;
  placeId: string;
  /** 이 노드 대신 갈 수 있는 곳. 앞 노드에서 갈라져 다음 노드에서 합쳐져요 */
  planB?: { placeId: string };
};

export type PlanDay = {
  /** YYYY-MM-DD */
  date: string;
  /** 여행 구역 이름. 아직 고르지 않았으면 없음 */
  zone?: string;
  /** 비어 있으면 노드 선택을 건너뛴 일차 (기능명세서 5-3) */
  nodes: PlanNode[];
};

/**
 * 가정: 계획에 상태 필드가 있어요. draft는 '작성 중인 계획'이에요.
 * 빈 일차가 있거나 기간을 늘리면 draft가 돼요 (기능명세서 5-3, 5-4)
 */
export type PlanStatus = 'draft' | 'complete';

export type Plan = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  accommodationPlaceId?: string;
  status: PlanStatus;
  days: PlanDay[];
};

/** PUT /plans/{id}는 계획 전체를 보내서 덮어써요 */
export type UpdatePlanRequest = Omit<Plan, 'id'>;

// 가짜 형식: POST /plans. 서버가 기간의 날짜마다 빈 일차를 만들어 draft 계획을 돌려준다고 가정해요
export type CreatePlanRequest = {
  title: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  /** 같은 기간에 다른 계획이 있어도 만들기 (기능명세서 5-3 같은 기간에 새 여행계획에서 '네') */
  isForced?: boolean;
};

/** 가정: 409 PLAN_PERIOD_OVERLAP 응답의 details. 겹치는 계획을 알려 줘요 */
export type PlanPeriodOverlapDetails = {
  overlappingPlans: Pick<Plan, 'id' | 'title' | 'startDate' | 'endDate'>[];
};
