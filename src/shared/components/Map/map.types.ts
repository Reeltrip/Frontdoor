/** 지도 좌표. Google Maps가 쓰는 모양 그대로예요 */
export type MapPosition = {
  lat: number;
  lng: number;
};

/** 지도 위 노드 하나 (사진 핀) */
export type MapNode = {
  id: string;
  name: string;
  imageUrl: string;
  /** 선택한 장소에 카드 사진이 없을 때 Google 장소 사진을 찾아요. */
  googlePlaceId?: string;
  position: MapPosition;
  /** 다른 일자에 이미 들어간 노드는 회색으로 */
  isMuted?: boolean;
  isDot?: boolean;
  categoryIcon?: string;
};

/** 동선의 한 지점. 배열 순서가 확정한 순서예요 */
export type MapRouteStop = {
  nodeId: string;
  /** 이 지점 대신 갈 수 있는 플랜B 노드. 앞 지점에서 갈라져 다음 지점에서 합쳐져요 */
  planBNodeId?: string;
  isPlanBPreview?: boolean;
};
