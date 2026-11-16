import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import AuthLayout from "@/features/auth/ui/AuthLayout";
import AuthInput from "@/features/auth/ui/AuthInput";
import Button from "@/shared/components/Button";
import { useSignupForm } from "@/features/auth/model/useSignupForm";

export default function SignupPage() {
  const navigate = useNavigate();
  const {
    email,
    handleEmailChange,
    code,
    setCode,
    password,
    handlePasswordChange,
    passwordConfirm,
    handlePasswordConfirmChange,
    errorMessage,
    isCodeSent,
    isEmailVerified,
    isSendingCode,
    isVerifyingCode,
    handleSendCode,
    handleVerifyCode,
    handleSubmit,
  } = useSignupForm(() => navigate("/signup/nickname"));

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthLayout actions={<Button type="submit" disabled={!isEmailVerified}>회원가입</Button>}>
        <AuthInput
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="이메일을 입력해주세요."
          autoComplete="email"
        />
        <Button type="button" variant="outline" size="md" onClick={handleSendCode} disabled={isSendingCode || isEmailVerified}>
          {isEmailVerified ? "이메일 인증 완료" : isSendingCode ? "인증번호 보내는 중" : isCodeSent ? "인증번호 다시 받기" : "이메일 인증번호 받기"}
        </Button>
        {isCodeSent && !isEmailVerified && (
          <>
            <AuthInput value={code} onChange={setCode} placeholder="이메일 인증번호" autoComplete="one-time-code" errorMessage={errorMessage} />
            <Button type="button" variant="outline" size="md" onClick={handleVerifyCode} disabled={isVerifyingCode}>
              {isVerifyingCode ? "확인 중" : "인증번호 확인"}
            </Button>
          </>
        )}
        <AuthInput
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호를 입력해주세요."
          autoComplete="new-password"
        />
        <AuthInput
          type="password"
          value={passwordConfirm}
          onChange={handlePasswordConfirmChange}
          placeholder="비밀번호 확인"
          autoComplete="new-password"
          errorMessage={errorMessage}
        />
      </AuthLayout>
    </form>
  );
}
