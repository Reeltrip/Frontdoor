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

// 다시 보기는 안내가 있는 화면을 차례로 옮겨 가며 보여줘요 (#179)
// 카드 직접 추가 안내는 빼고 여행계획 확정·플랜 B 안내를 넣었어요 (#238)
test('다시 보기는 홈 → 요약카드 → 여행계획 순서로 이어져요', () => {
  assert.equal(replay.getTutorialTourStep(), null);
  replay.replayTutorials();
  assert.equal(replay.getTutorialTourStep(), 'home');
  assert.equal(replay.advanceTutorialTour(), '/cards');
  assert.equal(replay.getTutorialTourStep(), 'cards');
  assert.equal(replay.advanceTutorialTour(), '/tutorial/plan');
  assert.equal(replay.getTutorialTourStep(), 'plan');
  // 마지막 안내 다음에는 마이페이지로 돌아가고 이어 보기는 끝나요
  assert.equal(replay.advanceTutorialTour(), '/my');
  assert.equal(replay.getTutorialTourStep(), null);
});

test('이어 보기를 끝내면 어느 화면에서도 이어지지 않아요', () => {
  replay.replayTutorials();
  replay.advanceTutorialTour();
  replay.clearTutorialReplay();
  assert.equal(replay.getTutorialTourStep(), null);
  assert.equal(replay.isTutorialReplay(), false);
});

test('예전 카드 직접 추가 단계(cardAdd)가 남아 있으면 이어 보기로 읽지 않아요', () => {
  localStorage.setItem('wayvi.tutorialReplay', 'cardAdd');
  assert.equal(replay.getTutorialTourStep(), null);
});

test('예전 다시 보기 표시(1)는 홈 단계로 읽어요', () => {
  localStorage.setItem('wayvi.tutorialReplay', '1');
  assert.equal(replay.getTutorialTourStep(), 'home');
  assert.equal(replay.isTutorialReplay(), true);
});
