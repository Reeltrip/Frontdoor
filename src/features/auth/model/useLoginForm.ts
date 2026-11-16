import { useState } from "react";
import { getErrorMessage } from "@/shared/api/client";
import { useLogin } from "./useAuth";

export function useLoginForm(onSuccess: () => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const canSubmit = email.trim() !== "" && password !== "" && !login.isPending;
  // 서버가 보내는 message는 화면에 바로 띄울 수 있는 문구예요
  const errorMessage = login.isError ? getErrorMessage(login.error) : "";

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    login.reset();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    login.mutate({ email: email.trim(), password }, { onSuccess });
  };

  return {
    email,
    setEmail,
    password,
    handlePasswordChange,
    errorMessage,
    canSubmit,
    isSubmitting: login.isPending,
    handleSubmit,
  };
}
