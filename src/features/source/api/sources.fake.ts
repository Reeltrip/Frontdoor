// 가짜 응답: POST /sources, GET /sources/{id}가 정해지기 전까지 쓰는 메모리 저장소.
// - 같은 링크를 두 번 등록하면 409 DUPLICATE_SOURCE (isForced면 통과)
// - 링크에 'fail'이 들어 있으면 두 번째 단계에서 실패 (feature/#7-home-link 가짜 분석과 같은 규칙)
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import { addFakePlaceFromSource } from '@/features/place/api/places.fake';
import type { CreateSourceRequest, Source } from '../model/sourceStatus.types';

const FAKE_STEP_MS = 1500;
const FAKE_TOTAL_STEPS = 3;
const FAKE_FAIL_KEYWORD = 'fail';
const FAKE_FAIL_STEP = 1;

type FakeSourceRecord = {
  url: string;
  createdAt: number;
  placeIds: string[];
};

const fakeSources = new Map<string, FakeSourceRecord>();
let nextSourceNumber = 1;

const toSource = (id: string, record: FakeSourceRecord): Source => {
  const elapsedSteps = Math.floor((Date.now() - record.createdAt) / FAKE_STEP_MS);
  const base = { id, url: record.url, totalSteps: FAKE_TOTAL_STEPS, placeIds: [] };

  if (record.url.includes(FAKE_FAIL_KEYWORD) && elapsedSteps > FAKE_FAIL_STEP) {
    return { ...base, status: 'failed', step: FAKE_FAIL_STEP, failReason: '장소 정보를 찾지 못했어요.' };
  }
  if (elapsedSteps < FAKE_TOTAL_STEPS) return { ...base, status: 'analyzing', step: elapsedSteps };

  // 분석이 끝난 첫 조회 때 카드를 만들어 보관함에 넣음
  if (record.placeIds.length === 0) record.placeIds.push(addFakePlaceFromSource(record.url));
  return { ...base, status: 'done', step: FAKE_TOTAL_STEPS, placeIds: record.placeIds };
};

export const fakeSourcesApi = {
  create: ({ url, isForced = false }: CreateSourceRequest) =>
    fakeResponse(() => {
      const isDuplicate = [...fakeSources.values()].some((record) => record.url === url);
      if (isDuplicate && !isForced) {
        throw new ApiError({ status: 409, code: 'DUPLICATE_SOURCE', message: '이전에 수집한 적 있는 링크예요.' });
      }
      const id = `fake-source-${nextSourceNumber}`;
      nextSourceNumber += 1;
      const record = { url, createdAt: Date.now(), placeIds: [] };
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
