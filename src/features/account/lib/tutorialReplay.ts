/**
 * 튜토리얼을 본 기록 키. 각 화면이 정한 이름을 그대로 적어요(이름이 어긋나면 tests/tutorial-replay가 잡아요).
 * - local: 홈 사용 안내(HomePage), 계획 확정·플랜B 안내(planTutorialSeen)
 * - session: 카드 다이얼·편집 안내(CardBrowsePage). 앱을 다시 열면 원래 다시 떠요
 */
export const TUTORIAL_SEEN_KEYS = {
  local: ['wayvi.homeTutorialSeen', 'wayvi.planConfirmTutorialSeen', 'wayvi.planBTutorialSeen'],
  session: ['reeltrip:dial-tutorial-seen', 'reeltrip:edit-tutorial-seen'],
} as const;

/**
 * 다시 보기는 안내가 있는 화면을 차례로 옮겨 가며 보여줘요 (#179).
 * 시작 안내(/welcome) → 링크 홈 → 요약카드 다이얼·편집 → 여행계획 확정·플랜 B → 마이페이지.
 * 여행계획 안내는 실제 계획에서 장소를 골라야 떠서, 다시 보기 전용 화면(/tutorial/plan)에서 보여줘요.
 * 카드 직접 추가의 다이얼·화살표 안내는 다시 보기에서 뺐어요 (#238)
 */
export type TutorialTourStep = 'home' | 'cards' | 'plan';

const TOUR_KEY = 'wayvi.tutorialReplay';
const TOUR_STEPS: TutorialTourStep[] = ['home', 'cards', 'plan'];
const STEP_PATHS: Record<TutorialTourStep, string> = { home: '/home', cards: '/cards', plan: '/tutorial/plan' };
const TOUR_END_PATH = '/my';

/** 마이페이지 "튜토리얼 다시 보기": 본 기록을 지우고 이어 보기를 시작해요 */
export function replayTutorials(): void {
  try {
    TUTORIAL_SEEN_KEYS.local.forEach((key) => localStorage.removeItem(key));
    TUTORIAL_SEEN_KEYS.session.forEach((key) => sessionStorage.removeItem(key));
    localStorage.setItem(TOUR_KEY, 'home');
  } catch {
    // 저장소를 못 쓰는 브라우저는 원래도 튜토리얼이 매번 떠요
  }
}

/** 지금 이어 보기 중인 단계. 이어 보기 중이 아니면 null */
export function getTutorialTourStep(): TutorialTourStep | null {
  try {
    const value = localStorage.getItem(TOUR_KEY);
    // 예전 버전은 '1'로 적었어요. 홈 단계로 읽어요
    if (value === '1') return 'home';
    return TOUR_STEPS.find((step) => step === value) ?? null;
  } catch {
    return null;
  }
}

/** 홈 사용 안내는 원래 수집 기록이 없을 때만 떠요. 이어 보기의 홈 단계면 기록이 있어도 띄워요 */
export function isTutorialReplay(): boolean {
  return getTutorialTourStep() === 'home';
}

/** 지금 단계의 안내를 다 봤어요. 다음 단계로 넘기고 이동할 주소를 돌려줘요. 마지막이면 마이페이지예요 */
export function advanceTutorialTour(): string {
  const next = TOUR_STEPS[TOUR_STEPS.indexOf(getTutorialTourStep() ?? 'plan') + 1];
  try {
    if (next) localStorage.setItem(TOUR_KEY, next);
    else localStorage.removeItem(TOUR_KEY);
  } catch {
    // 저장하지 못하면 다음 화면에서 이어지지 않을 뿐이에요
  }
  return next ? STEP_PATHS[next] : TOUR_END_PATH;
}

/** 안내 중에 실제 버튼을 눌러 다른 일을 시작하면 이어 보기를 끝내요 */
export function clearTutorialReplay(): void {
  try {
    localStorage.removeItem(TOUR_KEY);
  } catch {
    // 지우지 못해도 각 안내는 이미 본 것으로 저장돼서 다시 뜨지 않아요
  }
}
