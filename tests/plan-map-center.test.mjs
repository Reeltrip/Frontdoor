import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const FALLBACK = { lat: 33.5902, lng: 130.4105 };
const OSAKA_CARD = { lat: 34.6687, lng: 135.5013 };
const TOKYO = { lat: 35.6762, lng: 139.6503 };
const ZONE = { lat: 35.6595, lng: 139.7005 };
const LODGING = { lat: 35.69, lng: 139.7 };

// 노드에는 localStorage가 없어서 테스트용으로 하나 만들어요
const storage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
  },
};

let server, center;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  center = await server.ssrLoadModule('/src/features/plan/lib/planMapCenter.ts');
});
after(async () => { await server.close(); });
beforeEach(() => storage.clear());

test('숙소·구역이 없으면 보관함의 다른 도시 카드보다 여행주소에서 열려요', () => {
  assert.deepEqual(center.pickPlanMapCenter({ destination: TOKYO, library: OSAKA_CARD }, FALLBACK), TOKYO);
});

test('숙소나 구역을 고르면 여행주소보다 먼저 써요', () => {
  assert.deepEqual(center.pickPlanMapCenter({ zone: ZONE, destination: TOKYO }, FALLBACK), ZONE);
  assert.deepEqual(center.pickPlanMapCenter({ lodging: LODGING, destination: TOKYO }, FALLBACK), LODGING);
  assert.deepEqual(center.pickPlanMapCenter({ lodgingPreview: LODGING, zone: ZONE }, FALLBACK), LODGING);
});

test('여행주소 좌표를 찾는 중에는 보관함 카드로 옮겨 가지 않아요', () => {
  assert.deepEqual(
    center.pickPlanMapCenter({ isDestinationPending: true, library: OSAKA_CARD }, FALLBACK),
    FALLBACK,
  );
});

test('여행주소가 없는 예전 계획은 보관함 카드, 그것도 없으면 기본 위치에서 열려요', () => {
  assert.deepEqual(center.pickPlanMapCenter({ library: OSAKA_CARD }, FALLBACK), OSAKA_CARD);
  assert.deepEqual(center.pickPlanMapCenter({}, FALLBACK), FALLBACK);
});

test('고른 여행주소 좌표를 적어 두면 같은 이름으로 다시 꺼내요', () => {
  center.rememberDestinationCenter(' 도쿄 ', TOKYO);
  assert.deepEqual(center.readDestinationCenter('도쿄'), TOKYO);
  assert.equal(center.readDestinationCenter('오사카'), undefined);
  assert.equal(center.readDestinationCenter(undefined), undefined);
});

test('저장된 값이 깨져 있으면 없는 것으로 봐요', () => {
  storage.set('reeltrip:destination-centers', '{"도쿄":{"lat":"x"}}');
  assert.equal(center.readDestinationCenter('도쿄'), undefined);
  storage.set('reeltrip:destination-centers', 'not json');
  assert.equal(center.readDestinationCenter('도쿄'), undefined);
});
