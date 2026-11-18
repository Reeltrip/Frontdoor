import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 플랜B 정하기·옮기기·삭제·저장·동선 그리기의 경계 케이스

let server, api, days, edits, mapRoute;
const originalFetch = globalThis.fetch;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  api = await server.ssrLoadModule('/src/features/plan/api/plans.ts');
  days = await server.ssrLoadModule('/src/features/plan/model/planDays.ts');
  edits = await server.ssrLoadModule('/src/features/plan/model/planEdit.ts');
  mapRoute = await server.ssrLoadModule('/src/shared/components/Map/mapRoute.ts');
});
after(async () => { globalThis.fetch = originalFetch; await server.close(); });

const place = (id, category = 'food') => ({ id, category, name: id, imageUrl: '', summary: [] });
const localPlan = () => ({
  id: 'p', title: '계획', startDate: '2026-12-01', endDate: '2026-12-02', status: 'draft', accommodationPlaceId: 'stay',
  days: [
    { date: '2026-12-01', nodes: [{ id: 'n1', placeId: 'a' }, { id: 'n2', placeId: 'b', planB: { placeId: 'b2' } }, { id: 'n3', placeId: 'c' }] },
    { date: '2026-12-02', nodes: [{ id: 'n4', placeId: 'd', planB: { placeId: 'd2' } }] },
  ],
});

// ── 계획 바꾸는 함수 ──

test('setPlanB는 고른 노드에만 붙이고 원본 계획은 그대로 둬요', () => {
  const plan = localPlan();
  const next = edits.setPlanB(plan, 0, 'a', 'x');
  assert.deepEqual(next.days[0].nodes[0].planB, { placeId: 'x' });
  assert.equal(plan.days[0].nodes[0].planB, undefined);
  assert.deepEqual(next.days[0].nodes[1].planB, { placeId: 'b2' });
  assert.equal(next.days[1], plan.days[1]);
});

test('플랜B를 다시 고르면 이전 플랜B를 바꿔요', () => {
  const next = edits.setPlanB(localPlan(), 0, 'b', 'y');
  assert.deepEqual(next.days[0].nodes[1].planB, { placeId: 'y' });
});

test('canSetPlanB: 같은 카테고리이고 계획 어디에도 없는 카드만 돼요', () => {
  const plan = localPlan();
  const target = place('a');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('x')), true);
  assert.equal(edits.canSetPlanB(plan, 0, target, place('x', 'cafe')), false, '다른 카테고리');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('stay')), false, '숙소');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('c')), false, '같은 일차 노드');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('b2')), false, '같은 일차 다른 노드의 플랜B');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('a')), false, '자기 자신');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('d')), false, '다른 일차 노드');
  assert.equal(edits.canSetPlanB(plan, 0, target, place('d2')), false, '다른 일차 플랜B');
});

test('다른 일차의 플랜B였던 카드를 이 일차로 옮기면 원래 노드는 남고 플랜B만 빠져요', () => {
  const next = edits.moveNodeToDay(localPlan(), 0, 'd2');
  assert.deepEqual(next.days[1].nodes, [{ id: 'n4', placeId: 'd' }]);
  assert.equal(next.days[0].nodes.at(-1).placeId, 'd2');
});

test('플랜B를 가진 노드를 다른 일차로 옮기면 플랜B는 원래 일차에서 사라져요', () => {
  const next = edits.moveNodeToDay(localPlan(), 0, 'd');
  assert.deepEqual(next.days[1].nodes, []);
  assert.deepEqual(next.days[0].nodes.at(-1).planB, undefined);
});

test('같은 일차에서 이미 플랜B인 카드를 노드로 더하면 중복이 생기지 않아야 해요', () => {
  const next = edits.addNodeToDay(localPlan(), 0, 'b2');
  const ids = next.days[0].nodes.flatMap((node) => [node.placeId, ...(node.planB ? [node.planB.placeId] : [])]);
  assert.equal(new Set(ids).size, ids.length, `중복: ${ids.join(',')}`);
});

test('노드를 빼면 그 노드의 플랜B도 같이 빠져요', () => {
  const next = edits.removeNodeFromDay(localPlan(), 0, 'b');
  assert.deepEqual(next.days[0].nodes.map((node) => node.placeId), ['a', 'c']);
  assert.equal(edits.findOtherDayNumber(next, 1, 'b2'), undefined);
});

test('플랜B 카드만 삭제되면 플랜B만 떼고, 원래 카드가 삭제되면 노드를 통째로 빼요', () => {
  const onlyB = days.removePlacesFromPlan(localPlan(), ['b2']);
  assert.deepEqual(onlyB.days[0].nodes[1], { id: 'n2', placeId: 'b' });
  const original = days.removePlacesFromPlan(localPlan(), ['b']);
  assert.deepEqual(original.days[0].nodes.map((node) => node.placeId), ['a', 'c']);
});

test('보관함에 없는 카드를 찾을 때 플랜B 카드도 봐요', () => {
  const missing = days.findMissingPlaceIds(localPlan(), ['stay', 'a', 'b', 'c', 'd', 'd2'].map((id) => ({ id })));
  assert.deepEqual(missing, ['b2']);
});

// ── 동선 ──

test('완성 동선의 플랜B는 앞 노드에서 갈라져 다음 노드에서 합쳐져요', () => {
  const route = edits.buildDayRoute(localPlan(), 0);
  assert.deepEqual(route.map((stop) => stop.nodeId), ['stay', 'a', 'b', 'c', 'stay']);
  assert.equal(route[2].planBNodeId, 'b2');
  const nodes = ['stay', 'a', 'b', 'b2', 'c'].map((id, index) => ({ id, name: id, imageUrl: '', position: { lat: index, lng: 0 } }));
  const at = (id) => nodes.find((node) => node.id === id).position;
  const paths = mapRoute.buildRoutePaths(nodes, route);
  assert.deepEqual(paths.inactivePaths, [[at('a'), at('b2'), at('c')]]);
  assert.deepEqual(paths.mainPaths, [[at('stay'), at('a'), at('b'), at('c'), at('stay')]]);
});

test('마지막 노드의 플랜B는 숙소로 돌아오는 선에서 합쳐져요', () => {
  const plan = edits.setPlanB(localPlan(), 0, 'c', 'c2');
  const route = edits.buildDayRoute(plan, 0);
  const nodes = ['stay', 'a', 'b', 'c', 'c2'].map((id, index) => ({ id, name: id, imageUrl: '', position: { lat: index, lng: 0 } }));
  const at = (id) => nodes.find((node) => node.id === id).position;
  const paths = mapRoute.buildRoutePaths(nodes, route);
  assert.deepEqual(paths.inactivePaths.at(-1), [at('b'), at('c2'), at('stay')]);
});

test('숙소가 없으면 첫 노드의 플랜B는 다음 노드로만 이어져요', () => {
  const { accommodationPlaceId: _stay, ...noStay } = edits.setPlanB(localPlan(), 0, 'a', 'a2');
  const route = edits.buildDayRoute(noStay, 0);
  const nodes = ['a', 'a2', 'b', 'c'].map((id, index) => ({ id, name: id, imageUrl: '', position: { lat: index, lng: 0 } }));
  const at = (id) => nodes.find((node) => node.id === id).position;
  assert.deepEqual(mapRoute.buildRoutePaths(nodes, route).inactivePaths[0], [at('a2'), at('b')]);
});

test('지도 위치가 없는 플랜B 카드는 선을 그리지 않고 오류도 나지 않아요', () => {
  const route = edits.buildDayRoute(localPlan(), 0);
  const nodes = ['stay', 'a', 'b', 'c'].map((id, index) => ({ id, name: id, imageUrl: '', position: { lat: index, lng: 0 } }));
  assert.deepEqual(mapRoute.buildRoutePaths(nodes, route).inactivePaths, []);
});

// ── 서버 저장 ──

const serverPlan = () => ({
  planId: 10, name: '계획', city: '오사카', startDate: '2026-12-01', endDate: '2026-12-02', status: 'DRAFT', role: 'OWNER', tips: [],
  stays: [{ placeId: 90, name: '숙소', latitude: 34.6, longitude: 135.5 }],
  days: [
    { dayNumber: 1, date: '2026-12-01', isCompleted: false, areas: [], nodes: [
      { planNodeId: 11, placeId: 1, name: '라멘', category: 'FOOD', latitude: 34.6, longitude: 135.5, imageUrl: null,
        alternatives: [{ placeId: 3, name: '우동' }] },
      { planNodeId: 12, placeId: 2, name: '스시', category: 'FOOD', latitude: 34.6, longitude: 135.5, imageUrl: null, alternatives: [] },
    ] },
    { dayNumber: 2, date: '2026-12-02', isCompleted: false, areas: [], nodes: [] },
  ],
});

function fakeServer(initial = serverPlan()) {
  let state = initial;
  const writes = [];
  globalThis.fetch = async (url, options) => {
    const path = new URL(url, 'https://example.com').pathname;
    if (options.method === 'GET') return new Response(JSON.stringify(state), { status: 200 });
    const body = JSON.parse(options.body);
    writes.push({ method: options.method, path, body });
    const match = path.match(/\/days\/(\d+)$/);
    if (match) {
      // 실제 서버처럼 한 계획에 같은 카드가 두 번 들어가면 거절해요
      const otherIds = state.days.filter((_, i) => i !== Number(match[1]) - 1)
        .flatMap((day) => day.nodes.flatMap((node) => [node.placeId, ...node.alternatives.map((alt) => alt.placeId)]));
      const newIds = body.nodes.flatMap((node) => [node.placeId, ...node.alternativePlaceIds]);
      if (newIds.some((id) => otherIds.includes(id))) {
        return new Response(JSON.stringify({ code: 'DUPLICATE_PLAN_PLACE', message: '중복' }), { status: 409 });
      }
      const day = state.days[Number(match[1]) - 1];
      day.isCompleted = body.isCompleted;
      day.nodes = body.nodes.map((node, index) => ({
        planNodeId: 200 + index, placeId: node.placeId, name: `장소 ${node.placeId}`, category: 'FOOD',
        latitude: 34.6, longitude: 135.5, imageUrl: null,
        alternatives: node.alternativePlaceIds.map((placeId) => ({ placeId, name: `장소 ${placeId}` })),
      }));
    }
    return new Response(JSON.stringify(state), { status: 200 });
  };
  return { writes, get state() { return state; } };
}

test('서버 플랜B는 노드의 planB로 읽고, 플랜B 카드도 계획 안 카드 목록에 들어가요', async () => {
  fakeServer();
  const plan = await api.fetchPlan('10');
  assert.deepEqual(plan.days[0].nodes[0].planB, { placeId: '3' });
  const embedded = plan.embeddedPlaces.find((item) => item.id === '3');
  assert.equal(embedded.category, 'food');
});

test('플랜B만 바꿔도 그 일차를 alternativePlaceIds로 저장해요', async () => {
  const backend = fakeServer();
  const plan = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', edits.setPlanB(plan, 0, '2', '5'));
  assert.equal(backend.writes.length, 1);
  assert.equal(backend.writes[0].path, '/plans/10/days/1');
  assert.deepEqual(backend.writes[0].body.nodes, [
    { placeId: 1, alternativePlaceIds: [3] },
    { placeId: 2, alternativePlaceIds: [5] },
  ]);
  assert.deepEqual(saved.days[0].nodes[1].planB, { placeId: '5' });
});

test('플랜B를 떼어도 그 일차를 다시 저장해요', async () => {
  const backend = fakeServer();
  const plan = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', days.removePlacesFromPlan(plan, ['3']));
  assert.deepEqual(backend.writes[0].body.nodes[0], { placeId: 1, alternativePlaceIds: [] });
  assert.equal(saved.days[0].nodes[0].planB, undefined);
});

test('같은 카드가 다른 일차 노드와 플랜B에 동시에 있으면 요청 전에 막아요', async () => {
  const backend = fakeServer();
  const plan = await api.fetchPlan('10');
  const broken = { ...plan, days: plan.days.map((day, i) => (i === 1 ? { ...day, nodes: [{ id: 't', placeId: '3' }] } : day)) };
  await assert.rejects(api.updatePlan('10', broken), (error) => error.code === 'DUPLICATE_PLAN_PLACE');
  assert.equal(backend.writes.length, 0);
});

test('1일차 플랜B 카드를 2일차 노드로 옮겨도 서버가 거절하지 않아요', async () => {
  const backend = fakeServer();
  const plan = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', edits.moveNodeToDay(plan, 1, '3'));
  // 1일차에서 먼저 빼고 2일차에 넣어야 해요. 1일차는 남는 노드 저장과 최종 저장으로 두 번 보낼 수 있어요
  const paths = backend.writes.map((write) => write.path);
  assert.ok(paths.indexOf('/plans/10/days/1') < paths.indexOf('/plans/10/days/2'), paths.join(' → '));
  assert.equal(saved.days[0].nodes[0].planB, undefined);
  assert.deepEqual(saved.days[1].nodes.map((node) => node.placeId), ['3']);
});

test('2일차 노드를 1일차 플랜B로 옮겨도 서버가 거절하지 않아요', async () => {
  const initial = serverPlan();
  initial.days[1].nodes = [{ planNodeId: 13, placeId: 7, name: '카레', category: 'FOOD', latitude: 34.6, longitude: 135.5, imageUrl: null, alternatives: [] }];
  const backend = fakeServer(initial);
  const plan = await api.fetchPlan('10');
  // 화면에서는 다른 일차 카드를 플랜B로 못 고르지만(canSetPlanB), 저장 순서 자체가 안전한지 봐요
  const moved = edits.setPlanB({ ...plan, days: plan.days.map((day, i) => (i === 1 ? { ...day, nodes: [] } : day)) }, 0, '2', '7');
  const saved = await api.updatePlan('10', moved);
  assert.deepEqual(saved.days[0].nodes[1].planB, { placeId: '7' });
  assert.deepEqual(saved.days[1].nodes, []);
  assert.ok(backend.writes.length >= 2);
});

test('서버에 플랜B가 2개 있는 노드는 다른 곳만 고쳐 저장해도 두 번째 플랜B를 지우지 않아야 해요', async () => {
  const initial = serverPlan();
  initial.days[0].nodes[0].alternatives.push({ placeId: 4, name: '소바' });
  const backend = fakeServer(initial);
  const plan = await api.fetchPlan('10');
  await api.updatePlan('10', edits.setPlanB(plan, 0, '2', '5'));
  assert.deepEqual(backend.writes[0].body.nodes[0].alternativePlaceIds, [3, 4]);
});

test('추가 플랜B 카드를 다른 일차 노드로 넣으면 그 카드만 플랜B에서 빼고 저장해요', async () => {
  const initial = serverPlan();
  initial.days[0].nodes[0].alternatives.push({ placeId: 4, name: '소바' });
  const backend = fakeServer(initial);
  const plan = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', edits.moveNodeToDay(plan, 1, '4'));
  assert.ok(backend.writes.every((write) => !write.body.nodes || write.body.nodes.every((node) => !node.alternativePlaceIds.includes(4) || node.placeId === 4)));
  assert.deepEqual(saved.days[0].nodes[0].planB, { placeId: '3' });
  assert.deepEqual(saved.days[1].nodes.map((node) => node.placeId), ['4']);
});

test('플랜B를 떼면 추가 플랜B도 같이 빠져요', async () => {
  const initial = serverPlan();
  initial.days[0].nodes[0].alternatives.push({ placeId: 4, name: '소바' });
  const backend = fakeServer(initial);
  const plan = await api.fetchPlan('10');
  await api.updatePlan('10', days.removePlacesFromPlan(plan, ['3']));
  assert.deepEqual(backend.writes.at(-1).body.nodes[0].alternativePlaceIds, []);
});

test('뒤 일차의 추가 플랜B 카드를 앞 일차로 옮겨도 뒤 일차에서 먼저 빼고 저장해요', async () => {
  const initial = serverPlan();
  initial.days[1].nodes = [{ planNodeId: 13, placeId: 7, name: '카레', category: 'FOOD', latitude: 34.6, longitude: 135.5, imageUrl: null,
    alternatives: [{ placeId: 8, name: '돈카츠' }, { placeId: 9, name: '규동' }] }];
  fakeServer(initial);
  const plan = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', edits.moveNodeToDay(plan, 0, '9'));
  assert.deepEqual(saved.days[0].nodes.map((node) => node.placeId), ['1', '2', '9']);
  assert.deepEqual(saved.days[1].nodes[0].planB, { placeId: '8' });
  assert.equal(saved.days[1].nodes[0].extraPlanBIds, undefined);
});
