import { useState } from "react";

export type SignupStep = "email" | "code" | "password";

export const SIGNUP_STEPS: SignupStep[] = ["email", "code", "password"];
export const CODE_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 8;
export const FAKE_FAIL_CODE = "000000";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

export function useSignupForm(onSuccess: () => void) {
  const [step, setStep] = useState<SignupStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isCodeFailed, setIsCodeFailed] = useState(false);

  const canNext = {
    email: EMAIL_PATTERN.test(email.trim()),
    code: code.length === CODE_LENGTH,
    password: isValidPassword(password),
  }[step];

  const handleCodeChange = (value: string) => {
    setCode(value);
    setIsCodeFailed(false);
  };

  const goBack = (onFirstStepBack: () => void) => {
    const index = SIGNUP_STEPS.indexOf(step);
    if (index === 0) onFirstStepBack();
    else setStep(SIGNUP_STEPS[index - 1]);
  };

  const handleSubmit = () => {
    if (!canNext) return;

    if (step === "email") {
      setStep("code");
      return;
    }
    if (step === "code") {
      if (code === FAKE_FAIL_CODE) {
        setIsCodeFailed(true);
        return;
      }
      setStep("password");
      return;
    }
    // 가짜 회원가입: 회원가입 API가 정해지면 서버 호출로 교체
    onSuccess();
  };

  const retryCode = () => {
    setIsCodeFailed(false);
    setCode("");
  };

  return {
    step,
    email,
    setEmail,
    code,
    handleCodeChange,
    password,
    setPassword,
    canNext,
    isCodeFailed,
    retryCode,
    goBack,
    handleSubmit,
  };
}
