import type { MapNode } from '@/shared/components/Map';
import type { Place, PlaceCategory } from '../model/place.types';

/** 지도에 노드로 올리지 않는 카테고리. 하단 '꿀팁 보기' 같은 목록으로 보여줘요 */
const OFF_MAP_CATEGORIES: PlaceCategory[] = ['transportation', 'tip'];

/** 지도에 올릴 수 있는 첫 카드의 위치. 지도를 처음 열 때 카드가 있는 곳을 보여주려고 써요 */
export function getFirstNodePosition(places: Place[]): MapNode['position'] | undefined {
  return toMapNodes(places)[0]?.position;
}

/** 장소 카드를 지도 노드로 바꿔요. 교통·팁 카드와 좌표가 없는 카드는 빠져요 */
export function toMapNodes(places: Place[]): MapNode[] {
  return places.flatMap((place) => {
    if (!place.location || OFF_MAP_CATEGORIES.includes(place.category)) return [];
    return [{
      id: place.id,
      name: place.name,
      imageUrl: place.imageUrl,
      position: place.location,
      googlePlaceId: place.googlePlaceId,
    }];
  });
}
