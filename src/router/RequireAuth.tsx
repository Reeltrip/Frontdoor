import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { hasAuthTokens, onAuthExpired } from '@/shared/lib/authToken';

export type LoginRedirectState = { from?: string };

// 로그인이 필요한 화면을 감싸요. 토큰이 없거나 만료되면 로그인 화면으로 보내고, 로그인하면 원래 화면으로 돌아와요.
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

  if (!hasAuthTokens()) {
    const state: LoginRedirectState = { from };
    return <Navigate to="/login" replace state={state} />;
  }
  return children;
}
