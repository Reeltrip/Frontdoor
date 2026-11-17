import { apiRequest } from '@/shared/api/client';
import type { LoginRequest, LoginResponse } from '../model/auth.types';

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: request, isAuthRequired: false });
}

/** 지금 로그인의 리프레시 토큰만 서버에서 지워요. 다른 기기의 로그인은 그대로예요 */
export function logout(refreshToken: string): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST', body: { refreshToken }, isAuthRequired: false });
}
