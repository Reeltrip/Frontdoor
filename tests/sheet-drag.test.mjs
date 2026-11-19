import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 계획 보기 일정 시트를 끌어서 펼치기·접기 (#118)

let server, sheet;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  sheet = await server.ssrLoadModule('/src/shared/hooks/useSheetDrag.ts');
});
after(async () => { await server.close(); });

test('위로 충분히 끌면 펼치고, 아래로 충분히 끌면 접어요', () => {
  assert.equal(sheet.decideSheetExpanded(false, -41), true);
  assert.equal(sheet.decideSheetExpanded(true, 41), false);
});

test('조금만 끌면 지금 상태 그대로예요', () => {
  assert.equal(sheet.decideSheetExpanded(false, -20), false);
  assert.equal(sheet.decideSheetExpanded(true, 20), true);
  // 펼친 상태에서 더 위로, 접은 상태에서 더 아래로 끌어도 그대로예요
  assert.equal(sheet.decideSheetExpanded(true, -200), true);
  assert.equal(sheet.decideSheetExpanded(false, 200), false);
});

test('끄는 동안 높이는 접힌 높이와 펼친 높이 사이로만 움직여요', () => {
  assert.equal(sheet.getDraggingHeight({ isExpanded: false, dy: -100, collapsed: 281, expanded: 600 }), 381);
  assert.equal(sheet.getDraggingHeight({ isExpanded: false, dy: 50, collapsed: 281, expanded: 600 }), 281);
  assert.equal(sheet.getDraggingHeight({ isExpanded: true, dy: -50, collapsed: 281, expanded: 600 }), 600);
  assert.equal(sheet.getDraggingHeight({ isExpanded: true, dy: 100, collapsed: 281, expanded: 600 }), 500);
});
