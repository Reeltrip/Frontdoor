// 가짜 형식: BE와 POST /sources, GET /sources/{id} 형식이 정해지면 그대로 옮겨 적기.
// 화면 사이에 넘기는 값(링크 추가 → 분석 중)은 source.types.ts에 있어요 (feature/#7-home-link)

export type SourceStatus = 'analyzing' | 'done' | 'failed';

/** 링크 하나의 분석 결과 */
export type Source = {
  id: string;
  url: string;
  status: SourceStatus;
  /** 지금 진행 중인 분석 단계 (0부터). 분석 중 화면의 단계 표시에 씀 */
  step: number;
  totalSteps: number;
  /** 분석이 끝나고 만들어진 카드 id */
  placeIds: string[];
  /** status가 failed일 때 이유 */
  failReason?: string;
};

export type CreateSourceRequest = {
  url: string;
  /** 이전에 수집한 링크여도 다시 수집 (기능명세서 5-1 중복 링크에서 '네') */
  isForced?: boolean;
};
