import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/shared/api/client';

const MAX_RETRY_COUNT = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 시연 중 다른 창에 갔다 오면 목록이 깜빡이지 않게 끔
      refetchOnWindowFocus: false,
      // 4xx는 다시 보내도 결과가 같아서 재시도하지 않음
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
        return failureCount < MAX_RETRY_COUNT;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
