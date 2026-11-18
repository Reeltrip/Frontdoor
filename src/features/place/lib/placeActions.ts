import type { Place } from '../model/place.types';

/** 카드의 ↗ 버튼이 여는 주소. 원본 링크가 있으면 원본, 없으면 Google 지도에서 그 장소를 찾아요 */
export function getPlaceOpenUrl(place: Place): string {
  if (place.sourceUrl) return place.sourceUrl;
  const query = [place.name, place.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** 카드의 ↗ 버튼: 새 탭에서 원본(또는 지도)을 열어요 */
export function openPlace(place: Place): void {
  window.open(getPlaceOpenUrl(place), '_blank', 'noopener,noreferrer');
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
