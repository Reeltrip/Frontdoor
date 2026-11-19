import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 계획 보기 동선을 구간마다 다른 색으로 (#106)

let server, mapRoute, legColors;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  mapRoute = await server.ssrLoadModule('/src/shared/components/Map/mapRoute.ts');
  legColors = await server.ssrLoadModule('/src/shared/components/Map/routeLegColors.ts');
});
after(async () => { await server.close(); });

const node = (id, lat, lng) => ({ id, name: id, position: { lat, lng } });
const nodes = [node('stay', 0, 0), node('a', 0, 1), node('b', 0, 2)];

test('동선을 구간 순서대로 나눠 돌려주고, 길 모양을 받은 구간은 그 길을 끼워 넣어요', () => {
  const road = [{ lat: 1, lng: 0.5 }];
  const { mainLegs } = mapRoute.buildRoutePaths(
    nodes,
    [{ nodeId: 'stay' }, { nodeId: 'a' }, { nodeId: 'b' }, { nodeId: 'stay' }],
    { [mapRoute.getLegKey('stay', 'a')]: road },
  );
  assert.deepEqual(mainLegs.map((leg) => leg.key), ['stay>a', 'a>b', 'b>stay']);
  assert.deepEqual(mainLegs[0].path, [{ lat: 0, lng: 0 }, { lat: 1, lng: 0.5 }, { lat: 0, lng: 1 }]);
  assert.deepEqual(mainLegs[1].path, [{ lat: 0, lng: 1 }, { lat: 0, lng: 2 }]);
});

test('장소가 하나뿐이면 구간이 없어요', () => {
  assert.deepEqual(mapRoute.buildRoutePaths(nodes, [{ nodeId: 'a' }]).mainLegs, []);
});

test('구간 색은 순서마다 다르고, 색이 다 떨어지면 처음 색부터 다시 써요', () => {
  const tokens = Array.from({ length: legColors.ROUTE_LEG_COLOR_COUNT + 1 }, (_, index) => legColors.getRouteLegColorToken(index));
  assert.equal(new Set(tokens.slice(0, -1)).size, legColors.ROUTE_LEG_COLOR_COUNT);
  assert.equal(tokens.at(-1), tokens[0]);
  assert.match(tokens[0], /^--color-route-leg-\d+$/);
});
