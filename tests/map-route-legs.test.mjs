import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 계획 보기 지도의 동선을 실제 길을 따라 그리기 (#99)

let server, polyline, mapRoute;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  polyline = await server.ssrLoadModule('/src/shared/components/Map/polyline.ts');
  mapRoute = await server.ssrLoadModule('/src/shared/components/Map/mapRoute.ts');
});
after(async () => { await server.close(); });

const near = (actual, expected) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((point, index) => {
    assert.ok(Math.abs(point.lat - expected[index].lat) < 1e-9, `lat ${index}`);
    assert.ok(Math.abs(point.lng - expected[index].lng) < 1e-9, `lng ${index}`);
  });
};

// ── 길 모양 풀기 ──

test('Google 길 모양 문자열을 좌표 목록으로 풀어요', () => {
  // Google 문서의 예시 값이에요
  near(polyline.decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@'), [
    { lat: 38.5, lng: -120.2 },
    { lat: 40.7, lng: -120.95 },
    { lat: 43.252, lng: -126.453 },
  ]);
});

test('빈 값이나 중간에 끊긴 길 모양은 빈 목록으로 돌려서 직선으로 그리게 해요', () => {
  assert.deepEqual(polyline.decodePolyline(''), []);
  assert.deepEqual(polyline.decodePolyline(null), []);
  assert.deepEqual(polyline.decodePolyline(undefined), []);
  // 마지막 좌표의 경도가 잘린 값
  assert.deepEqual(polyline.decodePolyline('_p~iF~ps|U_ulL'), []);
  // 길 모양에 쓸 수 없는 글자
  assert.deepEqual(polyline.decodePolyline('한글 섞임'), []);
});

// ── 지도 선에 길 모양 끼워 넣기 ──

const nodes = ['stay', 'a', 'b', 'b2', 'c'].map((id, index) => ({ id, name: id, imageUrl: '', position: { lat: index, lng: 0 } }));
const at = (id) => nodes.find((node) => node.id === id).position;
const road = (name) => [{ lat: 100, lng: name.charCodeAt(0) }, { lat: 101, lng: name.charCodeAt(0) }];

test('길 모양이 있는 구간은 두 장소 사이에 길을 끼워 넣고, 없는 구간은 직선으로 이어요', () => {
  const route = [{ nodeId: 'stay' }, { nodeId: 'a' }, { nodeId: 'b' }, { nodeId: 'stay' }];
  const legPaths = { [mapRoute.getLegKey('stay', 'a')]: road('x'), [mapRoute.getLegKey('b', 'stay')]: road('z') };
  const paths = mapRoute.buildRoutePaths(nodes, route, legPaths);
  assert.deepEqual(paths.mainPaths, [[at('stay'), ...road('x'), at('a'), at('b'), ...road('z'), at('stay')]]);
});

test('길 모양은 방향을 구분해요. 반대 방향 길을 대신 쓰지 않아요', () => {
  const route = [{ nodeId: 'a' }, { nodeId: 'b' }];
  const paths = mapRoute.buildRoutePaths(nodes, route, { [mapRoute.getLegKey('b', 'a')]: road('x') });
  assert.deepEqual(paths.mainPaths, [[at('a'), at('b')]]);
});

test('길 모양을 넘기지 않으면 전과 똑같이 직선으로 그려요', () => {
  const route = [{ nodeId: 'stay' }, { nodeId: 'a' }, { nodeId: 'b', planBNodeId: 'b2' }, { nodeId: 'c' }, { nodeId: 'stay' }];
  const paths = mapRoute.buildRoutePaths(nodes, route);
  assert.deepEqual(paths.mainPaths, [[at('stay'), at('a'), at('b'), at('c'), at('stay')]]);
  assert.deepEqual(paths.inactivePaths, [[at('a'), at('b2'), at('c')]]);
});

test('플랜B로 갈라지는 선도 그 구간의 길 모양이 있으면 길을 따라가요', () => {
  const route = [{ nodeId: 'a' }, { nodeId: 'b', planBNodeId: 'b2' }, { nodeId: 'c' }];
  const legPaths = { [mapRoute.getLegKey('a', 'b2')]: road('p'), [mapRoute.getLegKey('a', 'b')]: road('m') };
  const paths = mapRoute.buildRoutePaths(nodes, route, legPaths);
  assert.deepEqual(paths.inactivePaths, [[at('a'), ...road('p'), at('b2'), at('c')]]);
  assert.deepEqual(paths.mainPaths, [[at('a'), ...road('m'), at('b'), at('c')]]);
});
