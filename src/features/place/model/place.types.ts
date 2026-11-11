// 가짜 형식: BE와 GET /places 응답 형식이 정해지면 그대로 옮겨 적기
export type PlaceCategory =
  | 'food'
  | 'accommodation'
  | 'cafe'
  | 'shopping'
  | 'attraction'
  | 'transportation'
  | 'tip'
  | 'activity';

export type Place = {
  id: string;
  category: PlaceCategory;
  name: string;
  imageUrl: string;
  /** 카드 이름 아래 한 줄. 여러 개면 구분선으로 이어 붙임. 예: ['하카타역 동쪽 도보 약 6~7분', '11:00~24:00'] */
  summary: string[];
  /** 짧은 주소 (작은 카드에서 씀) */
  address?: string;
  /** 테두리 태그에 들어가는 값. 예: '¥960~980', '공식 홈페이지 확인' */
  tag?: string;
  reviewCount?: number;
};

/** GET /places 조건. 비우면 전체 */
export type PlaceListParams = {
  category?: PlaceCategory;
};

// 가짜 형식: PATCH /places/{id}에서 바꿀 수 있는 항목. BE와 정해지면 맞추기
export type UpdatePlaceRequest = Partial<Pick<Place, 'name' | 'category' | 'summary' | 'address' | 'tag'>>;
