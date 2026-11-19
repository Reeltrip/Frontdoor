/**
 * 튜토리얼을 본 기록 키. 각 화면이 정한 이름을 그대로 적어요(이름이 어긋나면 tests/tutorial-replay가 잡아요).
 * - local: 홈 사용 안내(HomePage), 계획 확정·플랜B 안내(planTutorialSeen)
 * - session: 카드 다이얼·편집 안내(CardBrowsePage). 앱을 다시 열면 원래 다시 떠요
 */
export const TUTORIAL_SEEN_KEYS = {
  local: ['wayvi.homeTutorialSeen', 'wayvi.planConfirmTutorialSeen', 'wayvi.planBTutorialSeen'],
  session: ['reeltrip:dial-tutorial-seen', 'reeltrip:edit-tutorial-seen'],
} as const;

/** 홈 사용 안내는 원래 수집 기록이 없을 때만 떠요. 다시 보기를 누르면 기록이 있어도 한 번 띄워요 */
const REPLAY_KEY = 'wayvi.tutorialReplay';

/** 마이페이지 "튜토리얼 다시 보기": 본 기록을 지워서 각 화면에서 튜토리얼이 다시 떠요 */
export function replayTutorials(): void {
  try {
    TUTORIAL_SEEN_KEYS.local.forEach((key) => localStorage.removeItem(key));
    TUTORIAL_SEEN_KEYS.session.forEach((key) => sessionStorage.removeItem(key));
    localStorage.setItem(REPLAY_KEY, '1');
  } catch {
    // 저장소를 못 쓰는 브라우저는 원래도 튜토리얼이 매번 떠요
  }
}

export function isTutorialReplay(): boolean {
  try {
    return localStorage.getItem(REPLAY_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearTutorialReplay(): void {
  try {
    localStorage.removeItem(REPLAY_KEY);
  } catch {
    // 지우지 못해도 홈 안내는 이미 본 것으로 저장돼서 다시 뜨지 않아요
  }
}
