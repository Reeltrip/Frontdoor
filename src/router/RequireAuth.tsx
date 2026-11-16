import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { hasAuthTokens, onAuthExpired } from '@/shared/lib/authToken';
import { isFakeApiEnabled } from '@/shared/lib/env';

export type LoginRedirectState = { from?: string };

// 로그인이 필요한 화면을 감싸요. 토큰이 없거나 만료되면 로그인 화면으로 보내고, 로그인하면 원래 화면으로 돌아와요.
// 가짜 응답을 쓸 때는 미리보기에서 주소로 바로 들어가 볼 수 있게 막지 않아요
export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const from = `${location.pathname}${location.search}`;

  useEffect(
    () =>
      onAuthExpired(() => {
        const state: LoginRedirectState = { from };
        navigate('/login', { replace: true, state });
      }),
    [from, navigate],
  );

  if (!isFakeApiEnabled && !hasAuthTokens()) {
    const state: LoginRedirectState = { from };
    return <Navigate to="/login" replace state={state} />;
  }
  return children;
}
