import { hasDisplayValue } from "@/shared/lib/displayValue";
import type { Place } from "../model/place.types";

/** 작은 카드 이름 아래 줄에 무엇을 보여줄지. summary는 요약카드 이름 아래 첫 줄이에요 */
export type CardSublineMode = "address" | "summary";

/** 작은 카드 이름 아래 줄. 보여줄 글이 없으면 undefined라서 카드가 '-'를 보여줘요 */
export function getCardSubline(
  place: Place,
  mode: CardSublineMode,
): string | undefined {
  const summaryFirst = place.summary[0];
  // 요약카드 편집의 '위치 설명'이 바꾸는 줄이 summary[0]이에요 (placeEdit.ts)
  if (mode === "summary" && hasDisplayValue(summaryFirst)) return summaryFirst;
  return hasDisplayValue(place.address) ? place.address : undefined;
}
