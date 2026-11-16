import { useState } from 'react';
import { signup } from '@/features/auth/api/signup';
import { clearSignupDraft, readSignupDraft } from './signupDraft';
import { setAuthTokens } from '@/shared/lib/authToken';

export const NICKNAME_MAX_LENGTH = 8;

export function useNicknameForm(onSuccess: () => void) {
  const [nickname, setNickname] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedNickname = nickname.trim();
    if (normalizedNickname.length < 1 || normalizedNickname.length > NICKNAME_MAX_LENGTH) {
      setErrorMessage('닉네임은 1자에서 8자까지 입력해주세요.');
      return;
    }
    if (!isTermsAgreed || !isPrivacyAgreed) {
      setErrorMessage('이용약관과 개인정보 처리에 동의해주세요.');
      return;
    }
    const draft = readSignupDraft();
    if (!draft) {
      setErrorMessage('가입 정보가 만료됐어요. 회원가입을 다시 시작해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const tokens = await signup({
        ...draft,
        nickname: normalizedNickname,
        isTermsAgreed,
        isPrivacyAgreed,
        isMarketingAgreed,
      });
      setAuthTokens(tokens);
      clearSignupDraft();
      onSuccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '회원가입을 완료하지 못했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    nickname, setNickname, handleSubmit, errorMessage, isSubmitting,
    isTermsAgreed, setIsTermsAgreed, isPrivacyAgreed, setIsPrivacyAgreed,
    isMarketingAgreed, setIsMarketingAgreed,
  };
}
