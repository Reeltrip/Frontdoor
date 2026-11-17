export type PlaceCategory =
  | "food"
  | "accommodation"
  | "cafe"
  | "shopping"
  | "attraction"
  | "transportation"
  | "tip"
  | "activity";

// 화면에서 쓰는 좌표 모양. BE의 latitude·longitude는 features/place/api/places.ts에서 바꿔요
export type PlaceLocation = {
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
};

export type Place = {
  id: string;
  category: PlaceCategory;
  name: string;
  imageUrl: string;
  /** 지도에 놓을 좌표. 교통·팁 카드나 위치를 찾지 못한 카드는 없음 */
  location?: PlaceLocation;
  /** 카드 이름 아래 한 줄. 여러 개면 구분선으로 이어 붙임. 예: ['하카타역 동쪽 도보 약 6~7분', '11:00~24:00'] */
  summary: string[];
  address?: string;
  tag?: string;
  reviewCount?: number;
};

/** GET /places 조건. 비우면 전체 */
export type PlaceListParams = {
  category?: PlaceCategory;
};

// 화면에서 고칠 수 있는 항목. BE 필드로 옮기는 건 api/places.ts의 updatePlace가 해요
export type UpdatePlaceRequest = Partial<
  Pick<Place, "name" | "address" | "tag">
> & {
  /** 이름 아래 첫 줄. 장소 카드는 가는 길, 교통·팁 카드는 세부유형이에요 */
  summaryFirst?: string;
};
