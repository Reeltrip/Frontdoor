// 가짜 응답: GET /places, PATCH /places/{id}가 정해지기 전까지 쓰는 메모리 저장소.
// 새로고침하면 처음 상태로 돌아가요. 쇼핑·관광지 등 비어 있는 카테고리로 빈 화면을 볼 수 있어요.
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import sampleFood from '@/shared/assets/images/sample-food.png';
import sampleHotel from '@/shared/assets/images/sample-hotel.jpg';
import sampleDonut from '@/shared/assets/images/sample-donut.jpg';
import type { Place, PlaceListParams, UpdatePlaceRequest } from '../model/place.types';

const fakePlaces: Place[] = [
  {
    id: 'fake-place-1',
    category: 'food',
    name: '하카타 잇소 (博多一双)',
    imageUrl: sampleFood,
    summary: ['하카타역 동쪽 도보 약 6~7분', '11:00~24:00'],
    tag: '¥960~980',
    reviewCount: 6500,
  },
  {
    id: 'fake-place-2',
    category: 'accommodation',
    name: 'JR 큐슈 호텔 블라썸 하카타 센트럴',
    imageUrl: sampleHotel,
    summary: ['하카타역 도보 약 2분'],
    tag: '공식 홈페이지 확인',
  },
  {
    id: 'fake-place-3',
    category: 'cafe',
    name: "I'm donut? 후쿠오카 텐진점",
    imageUrl: sampleDonut,
    summary: [],
    address: '후쿠오카시 주오구 와타나베도리 5-24-30, 1층',
    tag: '¥220~240',
    reviewCount: 1806,
  },
];

let nextPlaceNumber = fakePlaces.length + 1;

const findPlace = (id: string) => {
  const place = fakePlaces.find((item) => item.id === id);
  if (!place) throw new ApiError({ status: 404, code: 'NOT_FOUND', message: '장소를 찾을 수 없어요.' });
  return place;
};

export const fakePlacesApi = {
  list: (params: PlaceListParams, signal?: AbortSignal) =>
    fakeResponse(
      () => fakePlaces.filter((place) => !params.category || place.category === params.category),
      { signal },
    ),

  update: (id: string, changes: UpdatePlaceRequest) =>
    fakeResponse(() => Object.assign(findPlace(id), changes)),
};

/** 가짜 링크 분석이 끝났을 때 카드를 하나 만들어 보관함에 넣어요 */
export function addFakePlaceFromSource(sourceUrl: string): string {
  const id = `fake-place-${nextPlaceNumber}`;
  fakePlaces.push({
    id,
    category: 'food',
    name: `수집한 장소 ${nextPlaceNumber}`,
    imageUrl: sampleFood,
    summary: [sourceUrl],
  });
  nextPlaceNumber += 1;
  return id;
}
