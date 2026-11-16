import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAuthTokens } from '@/shared/lib/authToken';
import { login } from '../api/auth';

/** 로그인. 성공하면 토큰을 저장하고, 이전 사용자의 화면 캐시를 비워요 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, refreshToken }) => {
      queryClient.clear();
      setAuthTokens({ accessToken, refreshToken });
    },
  });
}
