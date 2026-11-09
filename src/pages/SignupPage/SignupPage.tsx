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
    setEmail,
    password,
    handlePasswordChange,
    passwordConfirm,
    handlePasswordConfirmChange,
    errorMessage,
    handleSubmit,
  } = useSignupForm(() => navigate("/signup/nickname"));

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthLayout actions={<Button type="submit">회원가입</Button>}>
        <AuthInput
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="이메일을 입력해주세요."
          autoComplete="email"
        />
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
