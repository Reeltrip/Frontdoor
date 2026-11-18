import type { Place } from '../model/place.types';

/**
 * 카드의 ↗ 버튼이 여는 원본 링크(릴스·유튜브·블로그). http(s) 주소만 열고, 없으면 undefined.
 * 원본이 없다고 구글 지도로 대신 보내지 않아요 (버튼을 숨김)
 */
export function getPlaceSourceUrl(place: Place): string | undefined {
  const url = place.sourceUrl?.trim();
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

/** 카드의 ↗ 버튼: 새 탭에서 원본 링크를 열어요 */
export function openPlace(place: Place): void {
  const url = getPlaceSourceUrl(place);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

/** 카드의 복사 버튼: 이름과 주소를 클립보드에 넣어요. 실패하면 false (권한 거부, http 등) */
export async function copyPlace(place: Place): Promise<boolean> {
  const text = [place.name, place.address].filter(Boolean).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const COPY_DONE_MESSAGE = '장소 이름과 주소를 복사했어요.';
export const COPY_FAILED_MESSAGE = '복사하지 못했어요. 다시 시도해 주세요.';
