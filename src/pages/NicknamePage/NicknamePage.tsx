import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import AuthInput from "@/features/auth/ui/AuthInput";
import Button from "@/shared/components/Button";
import {
  NICKNAME_MAX_LENGTH,
  useNicknameForm,
} from "@/features/auth/model/useNicknameForm";
import styles from "./NicknamePage.module.css";

export default function NicknamePage() {
  const navigate = useNavigate();
  const {
    nickname, setNickname, handleSubmit, errorMessage, isSubmitting,
    isTermsAgreed, setIsTermsAgreed, isPrivacyAgreed, setIsPrivacyAgreed,
    isMarketingAgreed, setIsMarketingAgreed,
  } = useNicknameForm(() =>
    navigate("/home"),
  );

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <form className={styles.page} onSubmit={handleFormSubmit}>
      <header className={styles.header}>
        <h1 className={styles.title}>안녕하세요, 웨이비입니다!</h1>
        <p className={styles.description}>당신을 뭐라고 불러드리면 될까요?</p>
      </header>

      <AuthInput
        value={nickname}
        onChange={setNickname}
        placeholder="닉네임을 입력해주세요.(1자~8자)"
        maxLength={NICKNAME_MAX_LENGTH}
        autoComplete="nickname"
      />

      <section className={styles.consents} aria-label="약관 동의">
        <label><input type="checkbox" checked={isTermsAgreed} onChange={(event) => setIsTermsAgreed(event.target.checked)} /> 이용약관 동의 (필수)</label>
        <label><input type="checkbox" checked={isPrivacyAgreed} onChange={(event) => setIsPrivacyAgreed(event.target.checked)} /> 개인정보 수집 및 이용 동의 (필수)</label>
        <label><input type="checkbox" checked={isMarketingAgreed} onChange={(event) => setIsMarketingAgreed(event.target.checked)} /> 마케팅 정보 수신 동의 (선택)</label>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </section>

      <div className={styles.actions}>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "가입 중" : "시작하기"}</Button>
      </div>
    </form>
  );
}
