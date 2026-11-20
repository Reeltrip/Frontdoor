import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 요약카드에서 고친 위치 설명이 보관함 작은 카드에도 보여요 (#199)

let server, subline, placeEdit;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  subline = await server.ssrLoadModule('/src/features/place/lib/cardSubline.ts');
  placeEdit = await server.ssrLoadModule('/src/features/place/model/placeEdit.ts');
});
after(async () => {
  await server.close();
});

const ADDRESS = '후쿠오카시 하카타구 하카타역 중앙가 1-1';

const makePlace = (fields) => ({ id: '1', category: 'food', name: '이치란 본점', imageUrl: '', summary: [], ...fields });

test('보관함 카드는 요약카드 이름 아래 첫 줄을 보여줘요', () => {
  const place = makePlace({ summary: ['하카타역 도보 5분', '11:00~23:00'], address: ADDRESS });
  assert.equal(subline.getCardSubline(place, 'summary'), '하카타역 도보 5분');
});

test('요약카드에서 위치 설명을 고치면 보관함 카드 줄도 그 글로 바뀌어요', () => {
  const place = makePlace({ summary: ['하카타역 도보 5분', '11:00~23:00'], address: ADDRESS });
  const edited = placeEdit.applyDraft(place, { ...placeEdit.toDraft(place), location: '하카타역 동쪽 출구 3분' });
  assert.equal(subline.getCardSubline(edited, 'summary'), '하카타역 동쪽 출구 3분');
});

test('첫 줄이 없으면 보관함 카드는 주소를 보여줘요', () => {
  assert.equal(subline.getCardSubline(makePlace({ summary: [], address: ADDRESS }), 'summary'), ADDRESS);
  assert.equal(subline.getCardSubline(makePlace({ summary: ['  '], address: ADDRESS }), 'summary'), ADDRESS);
});

test('다른 화면 카드는 지금처럼 주소만 보여줘요', () => {
  const place = makePlace({ summary: ['하카타역 도보 5분'], address: ADDRESS });
  assert.equal(subline.getCardSubline(place, 'address'), ADDRESS);
  // 주소가 없을 때 첫 줄로 바꿔 채우지 않아요. 여행계획 카드는 지금처럼 '-'예요
  assert.equal(subline.getCardSubline(makePlace({ summary: ['하카타역 도보 5분'] }), 'address'), undefined);
});

test('보여줄 글이 없으면 undefined라서 카드가 -를 보여줘요', () => {
  const place = makePlace({ summary: [] });
  assert.equal(subline.getCardSubline(place, 'summary'), undefined);
  assert.equal(subline.getCardSubline(place, 'address'), undefined);
});
