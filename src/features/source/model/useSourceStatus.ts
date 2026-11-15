import { useEffect } from 'react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/shared/api/client';
import { getViewStatus } from '@/shared/api/viewStatus';
import { placeKeys } from '@/features/place/api/places';
import { createSource, fetchSource, sourceKeys } from '../api/sources';

export const SOURCE_POLL_INTERVAL_MS = 1000;

/**
 * 링크 분석 상태를 분석이 끝날 때까지 1초마다 다시 불러와요.
 * done이나 failed가 되거나 요청이 실패하면 멈춰요. sourceId가 없으면 요청하지 않아요.
 */
export function useSourceStatus(sourceId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: sourceKeys.detail(sourceId ?? ''),
    queryFn: sourceId ? ({ signal }) => fetchSource(sourceId, signal) : skipToken,
    staleTime: 0,
    refetchInterval: ({ state }) => {
      if (state.status === 'error' || state.data?.status !== 'analyzing') return false;
      return SOURCE_POLL_INTERVAL_MS;
    },
  });

  const analysisStatus = query.data?.status;

  // 분석이 끝나면 새 카드가 생겼으니 보관함 목록을 다시 불러옴
  useEffect(() => {
    if (analysisStatus === 'done') queryClient.invalidateQueries({ queryKey: placeKeys.all });
  }, [analysisStatus, queryClient]);

  return {
    source: query.data,
    /** analyzing·done·failed. 아직 첫 응답 전이면 undefined */
    analysisStatus,
    /** 분석 상태를 불러오는 요청 자체의 로딩·실패 (분석 실패는 analysisStatus가 failed) */
    viewStatus: getViewStatus(query),
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * 링크 등록. 성공하면 응답을 바로 캐시에 넣어서 분석 중 화면이 첫 상태를 기다리지 않아요.
 * 중복 링크(5-1)는 isDuplicateSourceError로 확인해 모달을 띄우고, '네'면 isForced: true로 다시 불러요.
 */
export function useCreateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSource,
    onSuccess: (source) => queryClient.setQueryData(sourceKeys.detail(source.id), source),
  });
}

export function isDuplicateSourceError(error: unknown): boolean {
  return isApiError(error, 'DUPLICATE_SOURCE');
}
