export type LinkRow = {
  id: number;
  value: string;
};
export type LinkAddState = {
  initialLink: string;
};
/** 링크 추가 화면에서 분석 화면으로 넘기는 값 */
export type AnalyzingState = {
  links: string[];
};

export type AnalysisStatus = "running" | "failed" | "done";

export function isAnalyzingState(value: unknown): value is AnalyzingState {
  if (typeof value !== "object" || value === null || !("links" in value))
    return false;
  const { links } = value;
  return (
    Array.isArray(links) &&
    links.length > 0 &&
    links.every((link) => typeof link === "string")
  );
}
export function isLinkAddState(value: unknown): value is LinkAddState {
  return (
    typeof value === "object" &&
    value !== null &&
    "initialLink" in value &&
    typeof value.initialLink === "string"
  );
}
