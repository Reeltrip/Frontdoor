import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let server, TripListPage, planKeys;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  ({ default: TripListPage } = await server.ssrLoadModule('/src/pages/TripListPage/TripListPage.tsx'));
  ({ planKeys } = await server.ssrLoadModule('/src/features/plan/api/plans.ts'));
});

after(async () => { await server.close(); });

function renderList(plans, error) {
  const client = new QueryClient({ defaultOptions: { queries: { enabled: false, retry: false } } });
  const key = planKeys.list({ owner: 'me' });
  if (plans !== undefined) client.setQueryData(key, plans);
  if (error) client.getQueryCache().build(client, { queryKey: key }).setState({ status: 'error', error });
  client.setQueryData(planKeys.list({ owner: 'shared' }), []);
  try {
    return renderToString(React.createElement(QueryClientProvider, { client },
      React.createElement(MemoryRouter, null, React.createElement(TripListPage))));
  } finally {
    client.clear();
  }
}

const pastPlan = { id: 'past', title: '교토 당일치기', startDate: '2000-05-03', endDate: '2000-05-03', status: 'COMPLETED', placeCount: 5 };
const upcomingPlan = { id: 'upcoming', title: '오사카 여행', startDate: '2999-12-01', endDate: '2999-12-02', status: 'DRAFT' };

test('지난 여행만 있어도 생성 안내와 지난 여행 목록을 함께 보여줘요', () => {
  const html = renderList([pastPlan]);
  assert.match(html, /모아둔 여행자료로/);
  assert.match(html, /여행계획을 만들어 보세요\./);
  assert.match(html, /여행계획 생성하기/);
  assert.match(html, /교토 당일치기/);
  assert.match(html, /장소 5곳/);
  assert.doesNotMatch(html, /다가오는 여행 \|/);
});

test('전체 계획이 없어도 생성 버튼을 하나만 보여줘요', () => {
  const html = renderList([]);
  assert.equal((html.match(/여행계획 생성하기/g) ?? []).length, 1);
  assert.match(html, /아직 지난 여행이 없어요\./);
  assert.doesNotMatch(html, /class="[^"]*createButton[^"]*"[^>]*>여행계획 만들기/);
});

test('다가오는 여행이 있으면 대표 카드를 보여주고 빈 안내는 숨겨요', () => {
  const html = renderList([pastPlan, upcomingPlan]);
  assert.match(html, /다가오는 여행 \| /);
  assert.match(html, /오사카 여행/);
  assert.match(html, /교토 당일치기/);
  assert.doesNotMatch(html, /모아둔 여행자료로|여행계획 생성하기/);
});

test('불러오는 중에는 빈 안내를 보여주지 않아요', () => {
  const html = renderList(undefined);
  assert.match(html, /여행목록을 불러오는 중이에요\./);
  assert.doesNotMatch(html, /모아둔 여행자료로|여행계획 생성하기/);
});

test('조회 실패 시에는 재시도를 보여주고 빈 안내를 숨겨요', () => {
  const html = renderList(undefined, new Error('조회 실패'));
  assert.match(html, /여행목록을 불러오지 못했어요\./);
  assert.match(html, /다시 시도/);
  assert.doesNotMatch(html, /모아둔 여행자료로|여행계획 생성하기/);
});

// 피그마 S5-1: 지난 여행 카드 제목 옆에 만든 날을 YY.MM.DD로 보여줘요 (#210)
test('지난 여행 카드 제목 옆에 만든 날을 보여줘요', () => {
  const html = renderList([{ ...pastPlan, createdAt: '2026-07-17T10:20:00+09:00' }]);
  assert.match(html, /교토 당일치기<\/span><span[^>]*>26\.07\.17<\/span>/);
  assert.match(html, /2000\.05\.03 \| 장소 5곳/);
});

test('만든 날이 없으면 제목만 보여줘요', () => {
  const html = renderList([pastPlan]);
  assert.doesNotMatch(html, /\d{2}\.\d{2}\.\d{2}<\/span>/);
});
