import { apiRequest } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import { isFakeApiEnabled } from '@/shared/lib/env';
import { initializeFakeAccount } from '@/features/account/api/account.fake';

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
  if (isFakeApiEnabled) return fakeResponse(() => undefined);
  return apiRequest<void>('/auth/email-codes', {
    method: 'POST', body: { email }, isAuthRequired: false,
  });
}

export function verifyEmailCode(email: string, code: string): Promise<void> {
  if (isFakeApiEnabled) return fakeResponse(() => undefined);
  return apiRequest<void>('/auth/email-codes/verify', {
    method: 'POST', body: { email, code }, isAuthRequired: false,
  });
}

export function signup(payload: SignupPayload): Promise<SignupResponse> {
  if (isFakeApiEnabled) {
    return fakeResponse(() => {
      initializeFakeAccount({ userId: 1, email: payload.email, nickname: payload.nickname });
      return {
        accessToken: 'fake-signup-access-token',
        refreshToken: 'fake-signup-refresh-token',
      };
    });
  }
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST', body: payload, isAuthRequired: false,
  });
}
