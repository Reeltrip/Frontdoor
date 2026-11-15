// 가짜 응답: POST /sources, GET /sources/{id}가 정해지기 전까지 쓰는 메모리 저장소.
// - 같은 링크를 두 번 등록하면 409 DUPLICATE_SOURCE (isForced면 통과)
//   단, 그 링크로 만든 카드를 모두 삭제했으면 처음 수집하는 링크로 봐요 (기능명세서 5-2 삭제한 카드 다시 만들기)
// - 새 카드의 장소가 보관함에 이미 있으면 duplicatePlaces로 알려 줘요 (5-2 보관함에 이미 있는 장소)
// - 링크에 'fail'이 들어 있으면 두 번째 단계에서 실패 (feature/#7-home-link 가짜 분석과 같은 규칙)
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import { addFakePlaceFromSource, getFakeLibraryPlaceId } from '@/features/place/api/places.fake';
import type { CreateSourceRequest, DuplicatePlacePair, Source } from '../model/sourceStatus.types';

const FAKE_STEP_MS = 1500;
const FAKE_TOTAL_STEPS = 3;
const FAKE_FAIL_KEYWORD = 'fail';
const FAKE_FAIL_STEP = 1;

type FakeSourceRecord = {
  url: string;
  createdAt: number;
  placeIds: string[];
  duplicatePlaces: DuplicatePlacePair[];
};

const fakeSources = new Map<string, FakeSourceRecord>();
let nextSourceNumber = 1;

const toSource = (id: string, record: FakeSourceRecord): Source => {
  const elapsedSteps = Math.floor((Date.now() - record.createdAt) / FAKE_STEP_MS);
  const base = { id, url: record.url, totalSteps: FAKE_TOTAL_STEPS, placeIds: [], duplicatePlaces: [] };

  if (record.url.includes(FAKE_FAIL_KEYWORD) && elapsedSteps > FAKE_FAIL_STEP) {
    return { ...base, status: 'failed', step: FAKE_FAIL_STEP, failReason: '장소 정보를 찾지 못했어요.' };
  }
  if (elapsedSteps < FAKE_TOTAL_STEPS) return { ...base, status: 'analyzing', step: elapsedSteps };

  // 분석이 끝난 첫 조회 때 카드를 만들어 보관함에 넣음
  if (record.placeIds.length === 0) {
    const { placeId, duplicateOfPlaceId } = addFakePlaceFromSource(record.url);
    record.placeIds.push(placeId);
    if (duplicateOfPlaceId) record.duplicatePlaces.push({ newPlaceId: placeId, existingPlaceId: duplicateOfPlaceId });
  }

  return {
    ...base,
    status: 'done',
    step: FAKE_TOTAL_STEPS,
    // 대체된 카드는 남은 카드 id로, 삭제된 카드는 빼고 돌려줌
    placeIds: [...new Set(record.placeIds.flatMap((placeId) => getFakeLibraryPlaceId(placeId) ?? []))],
    // 사용자가 이미 답한 쌍(새 카드가 대체되거나 지워짐)은 빼고 돌려줌
    duplicatePlaces: record.duplicatePlaces.filter(
      (pair) =>
        getFakeLibraryPlaceId(pair.newPlaceId) === pair.newPlaceId &&
        getFakeLibraryPlaceId(pair.existingPlaceId) === pair.existingPlaceId,
    ),
  };
};

// 카드를 만들었는데 지금은 하나도 남아 있지 않은 링크
const hasOnlyDeletedPlaces = (record: FakeSourceRecord) =>
  record.placeIds.length > 0 && record.placeIds.every((placeId) => getFakeLibraryPlaceId(placeId) === undefined);

export const fakeSourcesApi = {
  create: ({ url, isForced = false }: CreateSourceRequest) =>
    fakeResponse(() => {
      const isDuplicate = [...fakeSources.values()].some(
        (record) => record.url === url && !hasOnlyDeletedPlaces(record),
      );
      if (isDuplicate && !isForced) {
        throw new ApiError({ status: 409, code: 'DUPLICATE_SOURCE', message: '이전에 수집한 적 있는 링크예요.' });
      }
      const id = `fake-source-${nextSourceNumber}`;
      nextSourceNumber += 1;
      const record: FakeSourceRecord = { url, createdAt: Date.now(), placeIds: [], duplicatePlaces: [] };
      fakeSources.set(id, record);
      return toSource(id, record);
    }),

  get: (id: string, signal?: AbortSignal) =>
    fakeResponse(
      () => {
        const record = fakeSources.get(id);
        if (!record) throw new ApiError({ status: 404, code: 'NOT_FOUND', message: '분석 기록을 찾을 수 없어요.' });
        return toSource(id, record);
      },
      { delayMs: 200, signal },
    ),
};
