import { apiRequest } from '@/shared/api/client';
import { uploadImage } from '@/features/place/api/places';
import type { AccountProfile, Inquiry, InquiryType, ProfileChanges } from '../model/account.types';

export const accountKeys = { profile: ['account', 'profile'] as const };

// BE UserMeResponse: userId, email, nickname, placeCount, planCount, avatarUrl(없으면 null)
type ApiProfile = Omit<AccountProfile, 'avatarUrl'> & { avatarUrl: string | null };

const toProfile = ({ avatarUrl, ...profile }: ApiProfile): AccountProfile => ({
  ...profile,
  ...(avatarUrl ? { avatarUrl } : {}),
});

export function getProfile(signal?: AbortSignal): Promise<AccountProfile | null> {
  return apiRequest<ApiProfile>('/users/me', { signal }).then(toProfile);
}

/** 방금 고른 사진은 이 기기 안의 data 주소라서, 먼저 서버에 올리고 받은 주소를 저장해요 */
async function toSavedAvatarUrl(avatarUrl: string | undefined): Promise<string | null | undefined> {
  if (avatarUrl === undefined) return undefined;
  if (!avatarUrl.startsWith('data:')) return avatarUrl;
  const blob = await (await fetch(avatarUrl)).blob();
  const extension = blob.type === 'image/png' ? 'png' : 'jpg';
  return uploadImage(new File([blob], `avatar.${extension}`, { type: blob.type }));
}

export async function updateProfile(changes: ProfileChanges): Promise<AccountProfile> {
  const avatarUrl = await toSavedAvatarUrl(changes.avatarUrl);
  return apiRequest<ApiProfile>('/users/me', {
    method: 'PATCH',
    body: { nickname: changes.nickname, ...(avatarUrl !== undefined ? { avatarUrl } : {}) },
  }).then(toProfile);
}

const INQUIRY_TYPE_CODES: Record<InquiryType, string> = {
  '서비스 이용 문의': 'SERVICE_USAGE',
  '계정 및 로그인': 'ACCOUNT_LOGIN',
  '여행 카드오류': 'TRAVEL_CARD_ERROR',
  '기타 문의': 'OTHER',
};

export async function submitInquiry(inquiry: Inquiry): Promise<void> {
  await apiRequest<unknown>('/inquiries', {
    method: 'POST',
    body: { ...inquiry, type: INQUIRY_TYPE_CODES[inquiry.type] },
  });
}
