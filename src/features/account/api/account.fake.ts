import { fakeResponse } from '@/shared/api/fake';
import type { AccountProfile, Inquiry, ProfileChanges } from '../model/account.types';

// 가짜 API 전용 데이터예요. 실제 회원 정보나 문의를 서버에 저장하지 않아요.
const PROFILE_KEY = 'reeltrip:fake-profile';
const INQUIRIES_KEY = 'reeltrip:fake-inquiries';
let memoryProfile: AccountProfile = { userId: 1, nickname: '보영', email: 'test@naver.com' };

function readProfile(): AccountProfile {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null');
    if (typeof value === 'object' && value !== null && 'userId' in value && typeof value.userId === 'number'
      && 'email' in value && typeof value.email === 'string' && 'nickname' in value && typeof value.nickname === 'string') {
      return {
        userId: value.userId, email: value.email, nickname: value.nickname,
        avatarUrl: 'avatarUrl' in value && typeof value.avatarUrl === 'string' ? value.avatarUrl : undefined,
      };
    }
  } catch {
    // 저장소를 읽지 못하면 이 탭의 값을 써요.
  }
  return memoryProfile;
}

export function initializeFakeAccount(profile: AccountProfile) {
  const previous = readProfile();
  memoryProfile = previous.email === profile.email ? previous : profile;
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(memoryProfile)); } catch { /* 이 탭에만 남아요. */ }
}

export const fakeAccountApi = {
  getProfile: (signal?: AbortSignal) => fakeResponse(readProfile, { signal }),
  updateProfile: (changes: ProfileChanges) => fakeResponse(() => {
    const profile = { ...readProfile(), ...changes };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      throw new Error('프로필을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.');
    }
    memoryProfile = profile;
    return profile;
  }),
  submitInquiry: (inquiry: Inquiry) => fakeResponse(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(INQUIRIES_KEY) ?? '[]');
      const inquiries: unknown[] = Array.isArray(value) ? value : [];
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify([...inquiries, {
        ...inquiry, userId: readProfile().userId, email: readProfile().email, createdAt: new Date().toISOString(),
      }]));
    } catch {
      throw new Error('문의를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.');
    }
  }),
};
