import { apiRequest } from '@/shared/api/client';
import type { ApiPlace } from '@/features/place/api/places';
import type { RecentCollection } from '../model/recentCollection.types';

// 링크 분석 쿼리 키는 여기서만 만들어요
export const sourceKeys = {
  all: ['sources'] as const,
  recent: () => [...sourceKeys.all, 'recent'] as const,
  /** 분석 한 번(링크 붙여넣기 한 번)에 딸린 요청들 */
  run: (runKey: string) => [...sourceKeys.all, 'run', runKey] as const,
  detail: (id: number) => [...sourceKeys.all, id] as const,
  saved: (id: number) => [...sourceKeys.all, id, 'saved'] as const,
};

// ── BE 형식 (docs/api-spec.md 링크 분석) ──

export type ApiAnalysisStatus = 'PENDING' | 'ANALYZING' | 'DONE' | 'FAILED';

export type ApiSourceLink = {
  sourceLinkId: number;
  url: string;
  status: ApiAnalysisStatus;
  /** 카드 초안. 아직 보관함에 없어서 placeId가 없어요 */
  places: ApiPlace[] | null;
  code?: string;
  message?: string;
};

export type ApiSource = {
  sourceId: number;
  /** 분석이 끝나면 채워져요 (예: '오사카 여행 플랜') */
  title: string | null;
  status: ApiAnalysisStatus;
  sourceLinks: ApiSourceLink[];
};

/** 링크 여러 개를 한 번에 보내요 (최대 10개). 바로 202와 sourceId가 오고 분석은 뒤에서 돌아요 */
export function createSource(urls: string[]): Promise<{ sourceId: number }> {
  return apiRequest<{ sourceId: number }>('/sources', { method: 'POST', body: { urls } });
}

export function fetchSource(id: number, signal?: AbortSignal): Promise<ApiSource> {
  return apiRequest<ApiSource>(`/sources/${id}`, { signal });
}

type ApiSourceSummary = { sourceId: number; title: string | null; status: ApiAnalysisStatus; createdAt: string };

const STATUS_TITLES: Record<ApiAnalysisStatus, string> = {
  PENDING: '분석을 기다리는 링크',
  ANALYZING: '분석 중인 링크',
  DONE: '여행 링크',
  FAILED: '가져오지 못한 링크',
};

/** 홈의 '최근 수집 내역'. 제목은 분석이 끝나야 생겨서 그 전에는 상태로 보여줘요 */
export function fetchRecentSources(signal?: AbortSignal): Promise<RecentCollection[]> {
  return apiRequest<{ sources: ApiSourceSummary[] }>('/sources', { query: { page: 0, size: 10 }, signal }).then(
    (response) =>
      response.sources.map((source) => ({
        id: String(source.sourceId),
        // '2026-10-29T10:24:00+09:00' → '2026.10.29'
        date: source.createdAt.slice(0, 10).replaceAll('-', '.'),
        title: source.title ?? STATUS_TITLES[source.status],
      })),
  );
}
