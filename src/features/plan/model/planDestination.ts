/**
 * 여행주소 입력칸의 상태. 글자만 쳐서는 확정되지 않고, 장소 검색 결과를 골라야 확정돼요.
 * confirmed가 있을 때만 계획을 만들거나 수정할 수 있어요.
 */
export type DestinationInput = {
  /** 입력칸에 보이는 글자 */
  text: string;
  /** 검색 결과에서 고른 여행주소. 고른 뒤 글자를 고치면 없어져요 */
  confirmed: string | undefined;
};

const hasHangul = (text: string) => /[가-힣]/.test(text);

/** 계획 편집처럼 저장된 여행주소가 있으면 확정된 값으로 시작해요 */
export function startDestination(initial?: string): DestinationInput {
  const saved = initial?.trim() ?? '';
  return { text: saved, confirmed: saved || undefined };
}

/** 글자를 고치면 선택이 풀려요. 확정한 값과 같은 글자로 돌아오면 그대로 둬요 */
export function typeDestination(input: DestinationInput, text: string): DestinationInput {
  return { text, confirmed: text.trim() === input.confirmed ? input.confirmed : undefined };
}

/** 검색 결과를 골랐을 때. 한글로 검색했는데 결과 이름이 영어(Osaka)면 검색한 이름(오사카)으로 확정해요 */
export function chooseDestination(searchedQuery: string, resultName: string): DestinationInput {
  const query = searchedQuery.trim();
  const name = !hasHangul(resultName) && hasHangul(query) ? query : resultName.trim();
  return { text: name, confirmed: name };
}

export function getConfirmedDestination(input: DestinationInput): string | undefined {
  return input.confirmed;
}
