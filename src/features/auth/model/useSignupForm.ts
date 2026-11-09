import { useState } from "react";

export function useSignupForm(onSuccess: () => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isFilled =
    email.trim() !== "" && password !== "" && passwordConfirm !== "";

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrorMessage("");
  };

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (!isFilled) return;
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않아요");
      return;
    }
    // 가짜 회원가입: 회원가입 API가 정해지면 서버 호출로 교체
    onSuccess();
  };

  return {
    email,
    setEmail,
    password,
    handlePasswordChange,
    passwordConfirm,
    handlePasswordConfirmChange,
    errorMessage,
    handleSubmit,
  };
}
