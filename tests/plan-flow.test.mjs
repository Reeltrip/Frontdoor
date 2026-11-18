import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';

let server, api, hooks, days, edits;
const originalFetch = globalThis.fetch;
const fixture = () => ({
  planId: 10, name: '원래 계획', city: '오사카', startDate: '2026-12-01', endDate: '2026-12-02', status: 'DRAFT', role: 'OWNER', tips: [],
  stays: [{ planStayId: 80, placeId: 90 }, { planStayId: 81, placeId: 91 }],
  days: [
    { planDayId: 100, dayNumber: 1, date: '2026-12-01', isCompleted: false,
      areas: [{ name: '난바', latitude: 34.66, longitude: 135.5 }, { name: '우메다', latitude: 34.7, longitude: 135.5 }],
      nodes: [
        { planNodeId: 11, orderIndex: 0, placeId: 1, name: '라멘', category: 'FOOD', alternatives: [{ planAlternativeId: 41, placeId: 3 }, { planAlternativeId: 42, placeId: 4 }] },
        { planNodeId: 12, orderIndex: 1, placeId: 2, name: '스시', category: 'FOOD', alternatives: [] },
      ] },
    { planDayId: 101, dayNumber: 2, date: '2026-12-02', isCompleted: false, areas: [], nodes: [] },
  ],
});
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const waitUntil = async (condition) => {
  for (let i = 0; i < 1000; i++) { if (condition()) return; await tick(); }
  throw new Error('테스트 요청을 기다리다 시간이 초과됐어요.');
};
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  api = await server.ssrLoadModule('/src/features/plan/api/plans.ts');
  hooks = await server.ssrLoadModule('/src/features/plan/model/usePlan.ts');
  days = await server.ssrLoadModule('/src/features/plan/model/planDays.ts');
  edits = await server.ssrLoadModule('/src/features/plan/model/planEdit.ts');
});
after(async () => { globalThis.fetch = originalFetch; await server.close(); });

function model({ deferWrites = false } = {}) {
  let state = fixture();
  const writes = [];
  const fetch = async (url, options) => {
    const path = new URL(url, 'https://example.com').pathname;
    if (options.method === 'GET') return response(state);
    const body = JSON.parse(options.body);
    const apply = () => {
      if (options.method === 'PATCH') state = { ...state, ...body };
      else if (path.endsWith('/areas')) state.days[Number(path.split('/').at(-2)) - 1].areas = body.areas;
      else if (/\/days\/\d+$/.test(path)) {
        const day = state.days[Number(path.split('/').at(-1)) - 1];
        day.isCompleted = body.isCompleted;
        day.nodes = body.nodes.map((node, index) => ({
          planNodeId: day.nodes.find((old) => old.placeId === node.placeId)?.planNodeId ?? 200 + index,
          orderIndex: index, placeId: node.placeId, category: 'FOOD', name: `장소 ${node.placeId}`,
          alternatives: node.alternativePlaceIds.map((placeId) => ({ planAlternativeId: 400 + placeId, placeId })),
        }));
        state.status = state.days.every((day) => day.isCompleted) ? 'COMPLETED' : 'DRAFT';
      }
      return response(state);
    };
    if (!deferWrites) { writes.push({ path, body, method: options.method }); return apply(); }
    return new Promise((resolve) => writes.push({ path, body, method: options.method,
      settle: (isSuccess) => resolve(isSuccess ? apply() : response({ code: 'SERVER_ERROR', message: '저장 실패' }, 500)),
    }));
  };
  return { fetch, writes, get state() { return state; } };
}

function capture(client, count = 1) {
  const mutations = [];
  function Capture({ index }) { mutations[index] = hooks.useUpdatePlan('10'); return null; }
  renderToString(React.createElement(QueryClientProvider, { client },
    Array.from({ length: count }, (_, index) => React.createElement(Capture, { key: index, index }))));
  return mutations;
}

for (const [firstSucceeds, secondSucceeds] of [[true, true], [false, true], [true, false], [false, false]]) {
  test(`같은 계획의 두 저장을 직렬 실행하고 마지막 확정 상태로 복구해요 (${firstSucceeds}/${secondSucceeds})`, async () => {
    const backend = model({ deferWrites: true });
    globalThis.fetch = backend.fetch;
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const base = await api.fetchPlan('10');
    client.setQueryData(api.planKeys.detail('10'), base);
    const [first, second] = capture(client, 2);
    const firstPlan = { ...base, title: '첫 편집' };
    const lastPlan = { ...base, title: '마지막 편집' };
    const p1 = first.mutateAsync(firstPlan).catch((error) => error);
    await waitUntil(() => backend.writes.length === 1);
    const p2 = second.mutateAsync(lastPlan).catch((error) => error);
    await waitUntil(() => client.getQueryData(api.planKeys.detail('10')).title === '마지막 편집');
    assert.equal(backend.writes.length, 1, '첫 요청이 끝나기 전에 두 번째 요청이 전송되면 안 돼요.');
    backend.writes[0].settle(firstSucceeds);
    await p1;
    await waitUntil(() => backend.writes.length === 2);
    assert.equal(client.getQueryData(api.planKeys.detail('10')).title, '마지막 편집');
    backend.writes[1].settle(secondSucceeds);
    await p2;
    const expected = secondSucceeds ? '마지막 편집' : firstSucceeds ? '첫 편집' : '원래 계획';
    assert.equal(backend.state.name, expected);
    assert.equal(client.getQueryData(api.planKeys.detail('10')).title, expected);
    client.clear();
  });
}

test('빠르게 바꿨다가 원래 순서로 되돌려도 마지막 의도가 서버에 저장돼요', async () => {
  const backend = model({ deferWrites: true });
  globalThis.fetch = backend.fetch;
  const client = new QueryClient();
  const base = await api.fetchPlan('10');
  client.setQueryData(api.planKeys.detail('10'), base);
  const [mutation] = capture(client);
  const reversed = hooks.moveNodeInDay(base, 0, 0, 1);
  const p1 = mutation.mutateAsync(reversed);
  const p2 = mutation.mutateAsync(structuredClone(base));
  await waitUntil(() => backend.writes.length === 1 && client.getQueryData(api.planKeys.detail('10')).days[0].nodes[0].placeId === '1');
  backend.writes[0].settle(true);
  await p1;
  await waitUntil(() => backend.writes.length === 2);
  assert.deepEqual(backend.writes[1].body.nodes.map((node) => node.placeId), [1, 2]);
  backend.writes[1].settle(true);
  await p2;
  assert.deepEqual(backend.state.days[0].nodes.map((node) => node.placeId), [1, 2]);
  client.clear();
});

test('완성 클릭은 해당 일차만 완료하고 빈 날은 작성 중으로 남겨요', async () => {
  globalThis.fetch = model().fetch;
  const base = await api.fetchPlan('10');
  const completed = days.completePlanDay(base, 0);
  assert.equal(completed.days[0].isCompleted, true);
  assert.equal(completed.days[1].isCompleted, false);
  assert.equal(completed.status, 'draft');
  const removed = edits.removeNodeFromDay({ ...completed, days: [completed.days[0]] }, 0, '1');
  const empty = edits.removeNodeFromDay(removed, 0, '2');
  assert.equal(empty.days[0].isCompleted, false);
  assert.equal(empty.status, 'draft');
});

test('계획 생성의 실제 응답은 상세를 다시 읽고, 목록은 plans 배열을 변환해요', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const path = new URL(url, 'https://example.com').pathname;
    if (options.method === 'POST') return response({ planId: 10, status: 'DRAFT', totalDayCount: 2, loadedPlaceCount: 6 }, 201);
    return path === '/plans' ? response({ plans: [fixture()], totalCount: 1 }) : response(fixture());
  };
  const plan = await api.createPlan({ title: '저장 검증', destination: '오사카', startDate: '2026-12-01', endDate: '2026-12-02' });
  assert.deepEqual(JSON.parse(calls[0].options.body), { name: '저장 검증', city: '오사카', startDate: '2026-12-01', endDate: '2026-12-02' });
  assert.equal(plan.id, '10');
  assert.equal(plan.days.length, 2);
  const list = await api.fetchPlans();
  assert.equal(list[0].title, '원래 계획');
  assert.equal(list[0].destination, '오사카');
});

test('여러 편집 API 중 일부가 실패하면 실제 서버의 부분 저장 상태를 다시 읽어요', async () => {
  const backend = model();
  globalThis.fetch = async (url, options) => {
    if (options.method === 'PUT' && /\/days\/1$/.test(new URL(url, 'https://example.com').pathname)) {
      return response({ code: 'SERVER_ERROR', message: '일차 저장 실패' }, 500);
    }
    return backend.fetch(url, options);
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const base = await api.fetchPlan('10');
  client.setQueryData(api.planKeys.detail('10'), base);
  const observer = new QueryObserver(client, { queryKey: api.planKeys.detail('10'), queryFn: () => api.fetchPlan('10'), staleTime: Infinity });
  const unsubscribe = observer.subscribe(() => {});
  const [mutation] = capture(client);
  const next = edits.setDayZone(hooks.moveNodeInDay(base, 0, 0, 1), 0, { name: '하카타', center: { lat: 33.59, lng: 130.42 } });
  await assert.rejects(mutation.mutateAsync(next));
  const actual = client.getQueryData(api.planKeys.detail('10'));
  assert.equal(actual.days[0].zone, '하카타');
  assert.deepEqual(actual.days[0].nodes.map((node) => node.placeId), ['1', '2']);
  unsubscribe(); client.clear();
});

test('작성 중 계획도 선택한 일차의 완료 상태를 서버에 저장해요', async () => {
  const backend = model();
  globalThis.fetch = backend.fetch;
  const base = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', days.completePlanDay(base, 0));
  assert.equal(saved.status, 'DRAFT');
  assert.equal(saved.days[0].isCompleted, true);
  assert.equal(saved.days[1].isCompleted, false);
  assert.equal(backend.writes.length, 1);
  assert.equal(backend.writes[0].path, '/plans/10/days/1');
  assert.equal(backend.writes[0].body.isCompleted, true);
});

test('다른 일차의 완료 상태는 노드 순서 저장 때도 유지해요', async () => {
  const backend = model();
  backend.state.days[0].isCompleted = true;
  globalThis.fetch = backend.fetch;
  const base = await api.fetchPlan('10');
  const saved = await api.updatePlan('10', hooks.moveNodeInDay(base, 0, 0, 1));
  assert.equal(saved.days[0].isCompleted, true);
  assert.equal(saved.days[1].isCompleted, false);
});

test('동선 미리보기는 계획을 바꾸지 않고 완성 화면에서만 숙소 복귀선을 보여줘요', async () => {
  globalThis.fetch = model().fetch;
  const plan = await api.fetchPlan('10');

  const preview = edits.buildPlanningRoute(plan, 0, { previewPlaceId: '5' });
  assert.deepEqual(preview.map(({ nodeId }) => nodeId), ['90', '1', '2', '5']);
  assert.deepEqual(plan.days[0].nodes.map(({ placeId }) => placeId), ['1', '2']);

  const planB = edits.buildPlanningRoute(plan, 0, { previewPlanB: { targetPlaceId: '1', placeId: '6' } });
  assert.equal(planB[1].planBNodeId, '6');
  assert.equal(plan.days[0].nodes[0].planB.placeId, '3');

  const finished = edits.buildPlanningRoute(plan, 0, { isClosed: true });
  assert.deepEqual(finished.map(({ nodeId }) => nodeId), ['90', '1', '2', '90']);
});
