const FAKE_ADDRESSES = [
  "일본 후쿠오카현 후쿠오카시 하카타구 하카타역마에 1-1-1",
  "일본 후쿠오카현 후쿠오카시 주오구 텐진 2-11-1",
  "일본 후쿠오카현 후쿠오카시 주오구 나카스 5-3-8",
  "일본 후쿠오카현 후쿠오카시 주오구 오호리코엔 1-2",
  "일본 후쿠오카현 후쿠오카시 사와라구 모모치하마 2-2-26",
  "일본 오사카부 오사카시 주오구 도톤보리 1-6-8",
];

export function searchFakeAddresses(query: string): string[] {
  const keyword = query.trim();
  if (!keyword) return [];
  return FAKE_ADDRESSES.filter((address) => address.includes(keyword));
}
