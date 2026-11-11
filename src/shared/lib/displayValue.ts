/** 추출하지 못한 항목 자리에 보여주는 글자 (기능명세서 5-2 모든 항목 추출 실패) */
export const EMPTY_VALUE_TEXT = '-';

type DisplayValue = string | number | null | undefined;

/** 값이 없거나 공백뿐이면 false */
export function hasDisplayValue(value: DisplayValue): value is string | number {
  if (typeof value === 'number') return !Number.isNaN(value);
  return typeof value === 'string' && value.trim() !== '';
}

/** 빈 항목은 '-'로 바꿔서 돌려줘요. 카드처럼 추출 결과를 보여주는 곳에서 써요 */
export function displayOrDash(value: DisplayValue): string {
  return hasDisplayValue(value) ? String(value) : EMPTY_VALUE_TEXT;
}
