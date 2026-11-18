export type PlanTutorialKind = 'confirm' | 'planB';

const SEEN_KEYS: Record<PlanTutorialKind, string> = {
  confirm: 'wayvi.planConfirmTutorialSeen',
  planB: 'wayvi.planBTutorialSeen',
};

/** 여행계획 안내를 이미 닫은 적이 있는지. 저장소를 못 읽으면 처음 보는 것으로 봐요 */
export function hasSeenPlanTutorial(kind: PlanTutorialKind): boolean {
  try {
    return localStorage.getItem(SEEN_KEYS[kind]) === '1';
  } catch {
    return false;
  }
}

export function markPlanTutorialSeen(kind: PlanTutorialKind): void {
  try {
    localStorage.setItem(SEEN_KEYS[kind], '1');
  } catch {
    // 저장하지 못해도 이번 화면에서는 닫힌 상태로 둬요
  }
}
