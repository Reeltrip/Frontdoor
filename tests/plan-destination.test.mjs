import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let server, destination;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  destination = await server.ssrLoadModule('/src/features/plan/model/planDestination.ts');
});
after(async () => { await server.close(); });

test('검색 결과를 고르지 않고 글자만 치면 여행주소가 확정되지 않아요', () => {
  const typed = destination.typeDestination(destination.startDestination(), '아무 글자');
  assert.equal(typed.text, '아무 글자');
  assert.equal(destination.getConfirmedDestination(typed), undefined);
});

test('검색 결과를 고르면 그 이름으로 여행주소가 확정돼요', () => {
  const chosen = destination.chooseDestination('Osaka', 'Osaka');
  assert.equal(chosen.text, 'Osaka');
  assert.equal(destination.getConfirmedDestination(chosen), 'Osaka');
});

test('확정한 뒤 검색어를 고치면 선택이 풀려요', () => {
  const edited = destination.typeDestination(destination.chooseDestination('Osaka', 'Osaka'), 'Osak');
  assert.equal(edited.text, 'Osak');
  assert.equal(destination.getConfirmedDestination(edited), undefined);
});

test('한글로 검색했는데 결과 이름이 영어면 검색한 한글 이름으로 확정해요', () => {
  const chosen = destination.chooseDestination(' 오사카 ', 'Osaka');
  assert.equal(destination.getConfirmedDestination(chosen), '오사카');
});

test('계획 편집은 저장돼 있던 여행주소를 확정된 값으로 시작해요', () => {
  assert.equal(destination.getConfirmedDestination(destination.startDestination('교토')), '교토');
  assert.equal(destination.getConfirmedDestination(destination.startDestination('')), undefined);
});
