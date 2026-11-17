// 방금 끝난 링크 분석의 결과. 결과·카드 보기 화면이 "이번에 만든 카드"만 보여줄 때 써요.
// 새로고침해도 남게 sessionStorage에 두고, 탭을 닫으면 사라져요.
const LAST_RESULT_KEY = "reeltrip:last-result";

export type LastResult = {
  /** 이번 분석으로 보관함에 저장한 카드 id */
  placeIds: string[];
  /** 서버가 붙인 제목 (예: '오사카 여행 플랜') */
  title: string | null;
};

export function saveLastResult(result: LastResult) {
  try {
    sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
  } catch {
    // 저장소를 못 쓰면 결과 화면이 보관함 전체를 보여줘요
  }
}

export function readLastResult(): LastResult | null {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(LAST_RESULT_KEY) ?? "null",
    );
    if (
      typeof value === "object" &&
      value !== null &&
      "placeIds" in value &&
      Array.isArray(value.placeIds)
    ) {
      return {
        placeIds: value.placeIds.filter((id) => typeof id === "string"),
        title:
          "title" in value && typeof value.title === "string"
            ? value.title
            : null,
      };
    }
  } catch {
    // 아래에서 null
  }
  return null;
}
