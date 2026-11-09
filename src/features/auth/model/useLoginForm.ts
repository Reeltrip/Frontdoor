import { useState } from "react";

// 가짜 로그인: 로그인 API가 정해지면 교체
const FAKE_PASSWORD = "test1234";

export function useLoginForm(onSuccess: () => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = email.trim() !== "" && password !== "";

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (password !== FAKE_PASSWORD) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    onSuccess();
  };

  return {
    email,
    setEmail,
    password,
    handlePasswordChange,
    errorMessage,
    canSubmit,
    handleSubmit,
  };
}
