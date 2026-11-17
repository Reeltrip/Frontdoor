export type AccountProfile = {
  userId: number;
  email: string;
  nickname: string;
  avatarUrl?: string;
};

export type ProfileChanges = Pick<AccountProfile, 'nickname' | 'avatarUrl'>;

export const INQUIRY_TYPES = ['서비스 이용 문의', '계정 및 로그인', '여행 카드오류', '기타 문의'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export type Inquiry = {
  type: InquiryType;
  content: string;
  wantsReplyNotification: boolean;
};
