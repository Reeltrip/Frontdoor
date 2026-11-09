import type { SyntheticEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AuthLayout from "@/features/auth/ui/AuthLayout";
import AuthInput from "@/features/auth/ui/AuthInput";
import Button from "@/shared/components/Button";
import { useLoginForm } from "@/features/auth/model/useLoginForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAfterSignup =
    (location.state as { fromSignup?: boolean } | null)?.fromSignup === true;
  const {
    email,
    setEmail,
    password,
    handlePasswordChange,
    errorMessage,
    canSubmit,
    handleSubmit,
  } = useLoginForm(() =>
    navigate(isAfterSignup ? "/signup/nickname" : "/home"),
  );

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthLayout
        actions={
          <>
            <Button type="submit" disabled={!canSubmit}>
              로그인
            </Button>
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
