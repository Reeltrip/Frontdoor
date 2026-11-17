import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/shared/api/client";
import {
  createPlaces,
  placeKeys,
  type ApiPlace,
  type CreatePlacesResult,
} from "@/features/place/api/places";
import { saveLastResult } from "@/features/place/model/lastResult";
import {
  createSource,
  fetchSource,
  sourceKeys,
  type ApiSource,
} from "../api/sources";
import type { AnalysisStatus } from "./source.types";

export const ANALYSIS_STEPS = [
  "링크 내용 가져오는 중",
  "여행 정보 분석 중",
  "요약 카드 마무리 중",
];

const POLL_INTERVAL_MS = 2000;

const isFinished = (source: ApiSource | undefined) =>
  source !== undefined &&
  source.sourceLinks.every(
    (link) => link.status === "DONE" || link.status === "FAILED",
  );

/** 분석이 끝난 링크의 카드 초안을 저장 요청 모양으로 바꿔요. 빈 항목(null)은 빼고 보내요 */
function toSaveRequests(source: ApiSource): ApiPlace[] {
  return source.sourceLinks.flatMap((link) =>
    (link.places ?? []).map((draft) => {
      const filled = Object.fromEntries(
        Object.entries(draft).filter(([, value]) => value !== null),
      ) as ApiPlace;
      return {
        ...filled,
        sourceLinkId: link.sourceLinkId,
        sourceUrl: filled.sourceUrl ?? link.url,
      };
    }),
  );
}

/**
 * 링크 분석 한 번의 흐름: 링크 등록 → 끝날 때까지 상태 확인 → 카드 초안을 보관함에 저장.
 * runKey가 같으면(같은 화면 진입) 요청을 다시 보내지 않아요. 개발 모드에서 화면이 두 번 그려져도 한 번만 등록돼요.
 */
export function useAnalysis(links: string[], runKey: string) {
  const queryClient = useQueryClient();

  const created = useQuery({
    queryKey: sourceKeys.run(runKey),
    queryFn: () => createSource(links),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
  const sourceId = created.data?.sourceId;

  const polled = useQuery({
    queryKey: sourceKeys.detail(sourceId ?? 0),
    queryFn: ({ signal }) => fetchSource(sourceId as number, signal),
    enabled: sourceId !== undefined,
    staleTime: 0,
    refetchInterval: ({ state }) =>
      state.status === "error" || isFinished(state.data)
        ? false
        : POLL_INTERVAL_MS,
  });
  const source = polled.data;
  const finished = isFinished(source);
  const drafts = source && finished ? toSaveRequests(source) : [];

  const saved = useQuery({
    queryKey: sourceKeys.saved(sourceId ?? 0),
    queryFn: async (): Promise<CreatePlacesResult> => {
      const result = await createPlaces(drafts);
      saveLastResult({
        placeIds: result.placeIds,
        title: source?.title ?? null,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: placeKeys.all }),
        queryClient.invalidateQueries({ queryKey: sourceKeys.recent() }),
      ]);
      return result;
    },
    enabled: finished && drafts.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  const failedLinks =
    source?.sourceLinks.filter((link) => link.status === "FAILED") ?? [];
  const requestError = created.error ?? polled.error ?? saved.error;

  let status: AnalysisStatus = "running";
  let failMessage: string | undefined;
  if (requestError) {
    status = "failed";
    failMessage = getErrorMessage(requestError);
  } else if (finished && drafts.length === 0) {
    status = "failed";
    failMessage = failedLinks[0]?.message;
  } else if (saved.data && saved.data.placeIds.length === 0) {
    status = "failed";
    failMessage =
      "장소의 주소를 찾지 못해 카드를 만들지 못했어요. 다른 링크로 다시 시도해 주세요.";
  } else if (saved.data) {
    status = "done";
  }

  const hasStarted =
    source?.sourceLinks.some((link) => link.status !== "PENDING") ?? false;
  const currentStep = saved.data ? 3 : finished ? 2 : hasStarted ? 1 : 0;

  return {
    status,
    currentStep,
    failMessage,
    /** 저장한 카드 수와 빠진 카드·실패한 링크 수 (결과 화면 안내에 써요) */
    savedCount: saved.data?.placeIds.length ?? 0,
    skippedCount: saved.data?.skipped.length ?? 0,
    failedLinkCount: failedLinks.length,
  };
}
