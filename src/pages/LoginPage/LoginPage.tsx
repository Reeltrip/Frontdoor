import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "@/features/auth/ui/AuthLayout";
import AuthInput from "@/features/auth/ui/AuthInput";
import AuthButton from "@/features/auth/ui/AuthButton";
import { useLoginForm } from "@/features/auth/model/useLoginForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    password,
    handlePasswordChange,
    errorMessage,
    canSubmit,
    handleSubmit,
  } = useLoginForm(() => navigate("/home"));

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthLayout
        actions={
          <>
            <AuthButton disabled={!canSubmit}>로그인</AuthButton>
            <p className={styles.signupText}>
              회원이 아니신가요?{" "}
              <Link to="/signup" className={styles.signupLink}>
                회원가입
              </Link>
            </p>
          </>
        }
      >
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
          autoComplete="current-password"
          errorMessage={errorMessage}
        />
      </AuthLayout>
    </form>
  );
}
