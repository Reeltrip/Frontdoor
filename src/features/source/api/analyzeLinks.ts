// 가짜 분석: 분석 API 형식이 정해지면 서버 호출로 교체
// 링크에 'fail'이 들어 있으면 실패하게 해서 실패 화면을 확인할 수 있음
export const FAKE_STEP_DELAY_MS = 1500;
export const FAKE_FAIL_KEYWORD = "fail";

export function willFakeAnalysisFail(links: string[]): boolean {
  return links.some((link) => link.includes(FAKE_FAIL_KEYWORD));
}
