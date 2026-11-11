import { apiRequest } from '@/shared/api/client';
import { isFakeApiEnabled } from '@/shared/lib/env';
import type { CreateSourceRequest, Source } from '../model/sourceStatus.types';
import { fakeSourcesApi } from './sources.fake';

// 링크 분석 쿼리 키는 여기서만 만들어요
export const sourceKeys = {
  all: ['sources'] as const,
  detail: (id: string) => [...sourceKeys.all, id] as const,
};

/** 링크 하나 등록. 여러 링크는 링크마다 한 번씩 불러요 (기능명세서 5-1 여러 링크 동시 수집) */
export function createSource(request: CreateSourceRequest): Promise<Source> {
  if (isFakeApiEnabled) return fakeSourcesApi.create(request);
  return apiRequest<Source>('/sources', { method: 'POST', body: request });
}

export function fetchSource(id: string, signal?: AbortSignal): Promise<Source> {
  if (isFakeApiEnabled) return fakeSourcesApi.get(id, signal);
  return apiRequest<Source>(`/sources/${encodeURIComponent(id)}`, { signal });
}
