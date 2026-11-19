import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

// 마이페이지 "튜토리얼 다시 보기" (#124)

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
  };
};

let server, replay;

before(async () => {
  globalThis.localStorage = makeStorage();
  globalThis.sessionStorage = makeStorage();
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' });
  replay = await server.ssrLoadModule('/src/features/account/lib/tutorialReplay.ts');
});
after(async () => { await server.close(); });
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

test('다시 보기를 누르면 튜토리얼을 본 기록이 모두 지워져요', () => {
  for (const key of replay.TUTORIAL_SEEN_KEYS.local) localStorage.setItem(key, '1');
  for (const key of replay.TUTORIAL_SEEN_KEYS.session) sessionStorage.setItem(key, '1');
  replay.replayTutorials();
  for (const key of replay.TUTORIAL_SEEN_KEYS.local) assert.equal(localStorage.getItem(key), null, key);
  for (const key of replay.TUTORIAL_SEEN_KEYS.session) assert.equal(sessionStorage.getItem(key), null, key);
});

test('다시 보기 표시는 홈 안내를 닫으면 사라져요', () => {
  assert.equal(replay.isTutorialReplay(), false);
  replay.replayTutorials();
  assert.equal(replay.isTutorialReplay(), true);
  replay.clearTutorialReplay();
  assert.equal(replay.isTutorialReplay(), false);
});

test('지우는 키가 각 화면에서 쓰는 키와 같아요', () => {
  // 화면 쪽 키 이름이 바뀌면 다시 보기가 그 튜토리얼을 못 지워요. 이름이 어긋나면 여기서 잡아요
  const sources = [
    'src/pages/HomePage/HomePage.tsx',
    'src/pages/CardBrowsePage/CardBrowsePage.tsx',
    'src/features/plan/lib/planTutorialSeen.ts',
  ].map((path) => readFileSync(path, 'utf8')).join('\n');
  for (const key of [...replay.TUTORIAL_SEEN_KEYS.local, ...replay.TUTORIAL_SEEN_KEYS.session]) {
    assert.ok(sources.includes(`"${key}"`) || sources.includes(`'${key}'`), key);
  }
});
