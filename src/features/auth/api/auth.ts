import { apiRequest } from '@/shared/api/client';
import { isFakeApiEnabled } from '@/shared/lib/env';
import type { LoginRequest, LoginResponse } from '../model/auth.types';
import { fakeAuthApi } from './auth.fake';

export function login(request: LoginRequest): Promise<LoginResponse> {
  if (isFakeApiEnabled) return fakeAuthApi.login(request);
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: request, isAuthRequired: false });
}
