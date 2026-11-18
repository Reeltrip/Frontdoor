import type { SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import AuthStepLayout from '@/features/auth/ui/AuthStepLayout';
import AuthInput from '@/features/auth/ui/AuthInput';
import { NICKNAME_MAX_LENGTH, useNicknameForm } from '@/features/auth/model/useNicknameForm';
import Button from '@/shared/components/Button';
import styles from './NicknamePage.module.css';

export default function NicknamePage() {
  const navigate = useNavigate();
  const {
    nickname,
    setNickname,
    handleSubmit,
    errorMessage,
    isSubmitting,
    canSubmit,
    isTermsAgreed,
    setIsTermsAgreed,
    isPrivacyAgreed,
    setIsPrivacyAgreed,
    isMarketingAgreed,
    setIsMarketingAgreed,
  } = useNicknameForm(() => navigate('/welcome', { replace: true }));

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthStepLayout
        title="안녕하세요, 웨이비입니다!"
        description="앞으로 불러드릴 이름을 알려주세요!"
        hasLoginLink={false}
        action={<Button type="submit" disabled={!canSubmit}>{isSubmitting ? '가입 중' : '시작하기'}</Button>}
      >
        <AuthInput
          variant="underline"
          value={nickname}
          onChange={setNickname}
          placeholder="닉네임 입력"
          maxLength={NICKNAME_MAX_LENGTH}
          autoComplete="nickname"
          autoFocus
          errorMessage={errorMessage}
        />
        <section className={styles.consents} aria-label="약관 동의">
          <label><input type="checkbox" checked={isTermsAgreed} onChange={(event) => setIsTermsAgreed(event.target.checked)} /> 이용약관 동의 (필수)</label>
          <label><input type="checkbox" checked={isPrivacyAgreed} onChange={(event) => setIsPrivacyAgreed(event.target.checked)} /> 개인정보 수집 및 이용 동의 (필수)</label>
          <label><input type="checkbox" checked={isMarketingAgreed} onChange={(event) => setIsMarketingAgreed(event.target.checked)} /> 마케팅 정보 수신 동의 (선택)</label>
        </section>
      </AuthStepLayout>
    </form>
  );
}
