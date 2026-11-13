// 가짜 응답: GET /places, PATCH /places/{id}가 정해지기 전까지 쓰는 메모리 저장소.
// 새로고침하면 처음 상태로 돌아가요. 쇼핑·관광지 등 비어 있는 카테고리로 빈 화면을 볼 수 있어요.
// 예외 상황(기능명세서 5-2)용 가정:
// - 삭제는 deletedAt만 채우고 남겨 둬요. 목록에는 안 나오고, 복구하면 다시 나와요
// - 링크에 'same-place'가 있으면 보관함에 이미 있는 '하카타 잇소' 카드를 또 만들어요
// - 링크에 'partial'이 있으면 이름만 추출된 카드를 만들어요 (빈 항목 '-' 표시 확인용). 좌표도 없어서 지도에 안 나와요
// 좌표는 일본 국토지리원 주소 검색으로 찾은 후쿠오카 실제 위치예요
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import sampleFood from '@/shared/assets/images/sample-food.png';
import sampleHotel from '@/shared/assets/images/sample-hotel.jpg';
import sampleDonut from '@/shared/assets/images/sample-donut.jpg';
import type { Place, PlaceListParams, PlaceLocation, UpdatePlaceRequest } from '../model/place.types';

export const FAKE_SAME_PLACE_KEYWORD = 'same-place';
export const FAKE_PARTIAL_KEYWORD = 'partial';

type FakePlaceRecord = Place & {
  /** 삭제한 시각. 없으면 보관함에 있는 카드 */
  deletedAt?: string;
};

const RAMEN_PLACE: Omit<Place, 'id'> = {
  category: 'food',
  name: '하카타 잇소 (博多一双)',
  imageUrl: sampleFood,
  location: { lat: 33.586388, lng: 130.425186 },
  summary: ['하카타역 동쪽 도보 약 6~7분', '11:00~24:00'],
  tag: '¥960~980',
  reviewCount: 6500,
};

const fakePlaces: FakePlaceRecord[] = [
  { id: 'fake-place-1', ...RAMEN_PLACE },
  {
    id: 'fake-place-2',
    category: 'accommodation',
    name: 'JR 큐슈 호텔 블라썸 하카타 센트럴',
    imageUrl: sampleHotel,
    location: { lat: 33.589813, lng: 130.417984 },
    summary: ['하카타역 도보 약 2분'],
    tag: '공식 홈페이지 확인',
  },
  {
    id: 'fake-place-3',
    category: 'cafe',
    name: "I'm donut? 후쿠오카 텐진점",
    imageUrl: sampleDonut,
    location: { lat: 33.588314, lng: 130.402252 },
    summary: [],
    address: '후쿠오카시 주오구 와타나베도리 5-24-30, 1층',
    tag: '¥220~240',
    reviewCount: 1806,
  },
];

let nextPlaceNumber = fakePlaces.length + 1;

// 가짜 링크 분석으로 만든 카드에 차례로 붙이는 좌표 (캐널시티 하카타, 구시다 신사, 도초지, 스미요시 신사, 오호리 공원, 후쿠오카 타워)
const FAKE_COLLECTED_LOCATIONS: PlaceLocation[] = [
  { lat: 33.589874, lng: 130.411911 },
  { lat: 33.593357, lng: 130.411011 },
  { lat: 33.594616, lng: 130.414169 },
  { lat: 33.58569, lng: 130.411972 },
  { lat: 33.589401, lng: 130.373947 },
  { lat: 33.593754, lng: 130.351791 },
];

/** 새 카드로 대체돼 없어진 카드 id → 남은 카드 id */
const replacedPlaceIds = new Map<string, string>();

const isInLibrary = (place: FakePlaceRecord) => place.deletedAt === undefined;

const toPlace = ({ deletedAt: _deletedAt, ...place }: FakePlaceRecord): Place => place;

const findPlace = (id: string, { isDeletedIncluded = false } = {}) => {
  const place = fakePlaces.find((item) => item.id === id && (isDeletedIncluded || isInLibrary(item)));
  if (!place) throw new ApiError({ status: 404, code: 'NOT_FOUND', message: '장소를 찾을 수 없어요.' });
  return place;
};

export const fakePlacesApi = {
  list: (params: PlaceListParams, signal?: AbortSignal) =>
    fakeResponse(
      () =>
        fakePlaces
          .filter((place) => isInLibrary(place) && (!params.category || place.category === params.category))
          .map(toPlace),
      { signal },
    ),

  update: (id: string, changes: UpdatePlaceRequest) =>
    fakeResponse(() => toPlace(Object.assign(findPlace(id), changes))),

  /** 삭제 표시만 해요. 계획에서 복구할 수 있게 남겨 둬요 */
  remove: (id: string) =>
    fakeResponse(() => {
      findPlace(id).deletedAt = new Date().toISOString();
    }),

  restore: (id: string) =>
    fakeResponse(() => {
      const place = findPlace(id, { isDeletedIncluded: true });
      delete place.deletedAt;
      return toPlace(place);
    }),

  /** 이전 카드 내용을 새 카드로 바꾸고 새 카드는 없애요. 이전 카드 id가 남아서 계획의 노드는 그대로예요 */
  replace: (existingPlaceId: string, newPlaceId: string) =>
    fakeResponse(() => {
      const existingPlace = findPlace(existingPlaceId);
      const newPlace = findPlace(newPlaceId);
      Object.assign(existingPlace, { ...newPlace, id: existingPlaceId });
      fakePlaces.splice(fakePlaces.indexOf(newPlace), 1);
      replacedPlaceIds.set(newPlaceId, existingPlaceId);
      return toPlace(existingPlace);
    }),
};

/**
 * 가짜 링크 분석용: 지금 보관함에 있는 카드 id를 돌려줘요.
 * 대체된 카드는 남은 카드 id로 바꾸고, 삭제된 카드는 undefined예요.
 */
export function getFakeLibraryPlaceId(id: string): string | undefined {
  const currentId = replacedPlaceIds.get(id) ?? id;
  return fakePlaces.some((place) => place.id === currentId && isInLibrary(place)) ? currentId : undefined;
}

const buildFakePlace = (sourceUrl: string): Omit<Place, 'id'> => {
  if (sourceUrl.includes(FAKE_SAME_PLACE_KEYWORD)) {
    return { ...RAMEN_PLACE, summary: ['하카타역 동쪽 도보 약 6분', '11:00~23:00 (새로 수집)'] };
  }
  if (sourceUrl.includes(FAKE_PARTIAL_KEYWORD)) {
    return { category: 'food', name: `이름만 찾은 장소 ${nextPlaceNumber}`, imageUrl: sampleFood, summary: [] };
  }
  return {
    category: 'food',
    name: `수집한 장소 ${nextPlaceNumber}`,
    imageUrl: sampleFood,
    location: FAKE_COLLECTED_LOCATIONS[nextPlaceNumber % FAKE_COLLECTED_LOCATIONS.length],
    summary: [sourceUrl],
  };
};

/**
 * 가짜 링크 분석이 끝났을 때 카드를 하나 만들어 보관함에 넣어요.
 * 같은 이름의 카드가 보관함에 이미 있으면 그 id를 duplicateOfPlaceId로 알려 줘요 (삭제된 카드는 없는 것으로 봄).
 */
export function addFakePlaceFromSource(sourceUrl: string): { placeId: string; duplicateOfPlaceId?: string } {
  const placeId = `fake-place-${nextPlaceNumber}`;
  const place = buildFakePlace(sourceUrl);
  const duplicate = fakePlaces.find((item) => isInLibrary(item) && item.name === place.name);
  fakePlaces.push({ id: placeId, ...place });
  nextPlaceNumber += 1;
  return { placeId, duplicateOfPlaceId: duplicate?.id };
}
