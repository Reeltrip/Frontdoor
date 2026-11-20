import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 보관함 카드·지도 마커가 같이 쓰는 Google 장소 사진 로더 (#138)

let server, photos;
let fetchCount;
let fetchResult;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  photos = await server.ssrLoadModule('/src/shared/lib/googlePlacePhoto.ts');
});
after(async () => {
  delete globalThis.google;
  await server.close();
});

const installGoogle = () => {
  fetchCount = 0;
  class Place {
    constructor({ id }) { this.id = id; }
    async fetchFields() {
      fetchCount += 1;
      return fetchResult(this.id);
    }
  }
  globalThis.google = { maps: { importLibrary: async () => ({ Place }) } };
};

const photoOf = (id) => ({
  getURI: () => `https://photo.test/${id}`,
  authorAttributions: [{ displayName: `작성자 ${id}` }],
});

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
  };
};

test('지도 스크립트도 로그인도 없으면 조회하지 않고 undefined를 돌려줘요', async () => {
  delete globalThis.google;
  assert.equal(await photos.loadGooglePlacePhoto('no-google'), undefined);
});

// 요약카드 화면처럼 지도가 없는 곳은 서버(GET /place-photos)로 받아요 (#193)
test('지도 스크립트가 없으면 서버에서 사진과 올린 사람을 받아요', async () => {
  delete globalThis.google;
  const realFetch = globalThis.fetch;
  globalThis.localStorage = makeStorage();
  localStorage.setItem('reeltrip:access-token', 'a');
  localStorage.setItem('reeltrip:refresh-token', 'r');
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ photoUrl: 'https://photo.test/server', attributions: [{ displayName: '올린 사람', uri: 'https://maps.test/u' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const photo = await photos.loadGooglePlacePhoto('server-1');
    assert.equal(photo.url, 'https://photo.test/server');
    assert.equal(photo.authors[0].displayName, '올린 사람');
    assert.ok(urls[0].includes('/place-photos?googlePlaceId=server-1'), urls[0]);
    // 같은 장소는 다시 묻지 않아요 (사진 조회는 과금돼요)
    await photos.loadGooglePlacePhoto('server-1');
    assert.equal(urls.length, 1);
  } finally {
    globalThis.fetch = realFetch;
    delete globalThis.localStorage;
  }
});

test('서버가 사진이 없다고 하면 undefined라 카드 사진을 그대로 써요', async () => {
  delete globalThis.google;
  const realFetch = globalThis.fetch;
  globalThis.localStorage = makeStorage();
  localStorage.setItem('reeltrip:access-token', 'a');
  localStorage.setItem('reeltrip:refresh-token', 'r');
  globalThis.fetch = async () => new Response(JSON.stringify({ photoUrl: null, attributions: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    assert.equal(await photos.loadGooglePlacePhoto('server-none'), undefined);
  } finally {
    globalThis.fetch = realFetch;
    delete globalThis.localStorage;
  }
});

test('장소마다 다른 사진을 돌려주고, 같은 장소는 한 번만 조회해요', async () => {
  installGoogle();
  fetchResult = (id) => ({ place: { photos: [photoOf(id)] } });

  const [a, b, aAgain] = await Promise.all([
    photos.loadGooglePlacePhoto('A'),
    photos.loadGooglePlacePhoto('B'),
    photos.loadGooglePlacePhoto('A'),
  ]);

  assert.equal(a.url, 'https://photo.test/A');
  assert.equal(b.url, 'https://photo.test/B');
  assert.deepEqual(a.authors, [{ displayName: '작성자 A' }]);
  assert.equal(aAgain, a);
  assert.equal(fetchCount, 2);
});

test('사진이 없는 장소는 undefined라 카드 사진을 그대로 써요', async () => {
  installGoogle();
  fetchResult = () => ({ place: { photos: [] } });
  assert.equal(await photos.loadGooglePlacePhoto('no-photo'), undefined);
});

test('조회에 실패하면 기억하지 않고 다음에 다시 조회해요', async () => {
  installGoogle();
  fetchResult = () => { throw new Error('network'); };
  assert.equal(await photos.loadGooglePlacePhoto('flaky'), undefined);

  fetchResult = (id) => ({ place: { photos: [photoOf(id)] } });
  assert.equal((await photos.loadGooglePlacePhoto('flaky')).url, 'https://photo.test/flaky');
  assert.equal(fetchCount, 2);
});
