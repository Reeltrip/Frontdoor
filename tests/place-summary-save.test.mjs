import { after, afterEach, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 카드 이름 아래 첫 줄을 고치면 그 줄이 온 서버 필드로 보내요 (#142)

let server, places;
let sentBodies;
const realFetch = globalThis.fetch;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  places = await server.ssrLoadModule('/src/features/place/api/places.ts');
});
after(async () => {
  await server.close();
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const stubPatch = () => {
  sentBodies = [];
  globalThis.fetch = async (_url, options) => {
    sentBodies.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ placeId: 1, category: 'FOOD', name: '이름' }), { status: 200 });
  };
};

test('가는 길이 없으면 첫 줄은 영업시간에서 와요', () => {
  const place = places.toPlace({ placeId: 1, category: 'FOOD', name: '이름', openingHours: '11:00~23:00' });
  assert.deepEqual(place.summary, ['11:00~23:00']);
  assert.equal(place.summaryFirstField, 'openingHours');
});

test('가는 길이 있으면 첫 줄은 가는 길이에요', () => {
  const place = places.toPlace({ placeId: 1, category: 'FOOD', name: '이름', accessText: '역 도보 3분', openingHours: '24시간' });
  assert.deepEqual(place.summary, ['역 도보 3분', '24시간']);
  assert.equal(place.summaryFirstField, 'accessText');
});

test('팁 카드는 세부유형이 없으면 첫 줄이 적용 지역이에요', () => {
  const place = places.toPlace({ placeId: 1, category: 'TIP', name: '이름', applicableRegion: '하카타' });
  assert.equal(place.summaryFirstField, 'applicableRegion');
});

test('첫 줄이 없는 카드는 필드를 정하지 않아요', () => {
  const place = places.toPlace({ placeId: 1, category: 'FOOD', name: '이름' });
  assert.equal(place.summaryFirstField, undefined);
});

test('첫 줄이 영업시간이면 영업시간을 고쳐요', async () => {
  stubPatch();
  await places.updatePlace('1', 'food', { summaryFirst: '하카타역 도보 5분', summaryFirstField: 'openingHours' });
  assert.deepEqual(sentBodies, [{ openingHours: '하카타역 도보 5분' }]);
});

test('필드를 모르면 예전처럼 장소 카드는 가는 길, 팁 카드는 세부유형으로 보내요', async () => {
  stubPatch();
  await places.updatePlace('1', 'food', { summaryFirst: '가는 길' });
  await places.updatePlace('1', 'tip', { summaryFirst: '세부유형' });
  assert.deepEqual(sentBodies, [{ accessText: '가는 길' }, { subType: '세부유형' }]);
});
