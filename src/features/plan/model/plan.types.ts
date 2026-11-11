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

export type Plan = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  accommodationPlaceId?: string;
  /** 작성 중인 계획이면 true (빈 일차가 있거나 기간을 늘렸을 때) */
  isDraft: boolean;
  days: PlanDay[];
};

/** PUT /plans/{id}는 계획 전체를 보내서 덮어써요 */
export type UpdatePlanRequest = Omit<Plan, 'id'>;
