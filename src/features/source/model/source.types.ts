export type LinkRow = {
  id: number;
  value: string;
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
