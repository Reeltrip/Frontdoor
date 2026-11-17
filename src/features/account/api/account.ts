import { apiRequest } from '@/shared/api/client';
import { isFakeApiEnabled } from '@/shared/lib/env';
import type { AccountProfile, Inquiry, ProfileChanges } from '../model/account.types';
import { fakeAccountApi } from './account.fake';

export const accountKeys = { profile: ['account', 'profile'] as const };

export function getProfile(signal?: AbortSignal): Promise<AccountProfile | null> {
  if (isFakeApiEnabled) return fakeAccountApi.getProfile(signal);
  // BE UserMeResponse: userId, email, nickname, placeCount, planCount
  return apiRequest<AccountProfile>('/users/me', { signal });
}

export async function updateProfile(changes: ProfileChanges): Promise<AccountProfile> {
  if (isFakeApiEnabled) return fakeAccountApi.updateProfile(changes);
  // 프로필 수정 API는 아직 없어서, 저장에 성공한 것처럼 표시하지 않아요.
  throw new Error('프로필 수정 기능은 준비 중이에요. 잠시 후 다시 이용해 주세요.');
}

export async function submitInquiry(inquiry: Inquiry): Promise<void> {
  if (isFakeApiEnabled) return fakeAccountApi.submitInquiry(inquiry);
  throw new Error('문의 접수 기능은 준비 중이에요. 잠시 후 다시 이용해 주세요.');
}
