import { apiRequest } from '@/shared/api/client';

export type SignupPayload = {
  email: string;
  password: string;
  nickname: string;
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  isMarketingAgreed: boolean;
};

export type SignupResponse = {
  accessToken: string;
  refreshToken: string;
};

export function requestEmailCode(email: string): Promise<void> {
  return apiRequest<void>('/auth/email-codes', {
    method: 'POST', body: { email }, isAuthRequired: false,
  });
}

export function verifyEmailCode(email: string, code: string): Promise<void> {
  return apiRequest<void>('/auth/email-codes/verify', {
    method: 'POST', body: { email, code }, isAuthRequired: false,
  });
}

export function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST', body: payload, isAuthRequired: false,
  });
}
