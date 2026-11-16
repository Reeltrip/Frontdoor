import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import AuthStepLayout from "@/features/auth/ui/AuthStepLayout";
import AuthInput from "@/features/auth/ui/AuthInput";
import CodeInput from "@/features/auth/ui/CodeInput";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useSignupForm } from "@/features/auth/model/useSignupForm";

const STEP_TEXT = {
  email: { title: "회원가입을 위한\n이메일을 알려주세요" },
  code: {
    title: "인증번호를 입력하세요",
    description: "전송된 인증번호는 10분안에 인증이 만료됩니다.",
  },
  password: {
    title: "웨이비에서 사용할\n비밀번호를 입력해주세요",
    description: "영문, 숫자 포함 8자리 이상",
  },
} as const;

// 회원가입: 이메일 → 인증번호 → 비밀번호 순서로 한 화면에서 단계만 바꿈. 끝나면 닉네임 화면으로 이동
export default function SignupPage() {
  const navigate = useNavigate();
  const {
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
  } = useSignupForm(() => navigate("/signup/nickname"));

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  const text = STEP_TEXT[step];
  const description = "description" in text ? text.description : undefined;

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthStepLayout
        key={step}
        onBack={() => goBack(() => navigate(-1))}
        title={text.title}
        description={description}
        action={
          <Button type="submit" disabled={!canNext}>
            다음
          </Button>
        }
      >
        {step === "email" && (
          <AuthInput
            variant="underline"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="이메일 주소"
            autoComplete="email"
            autoFocus
          />
        )}
        {step === "code" && (
          <CodeInput
            value={code}
            onChange={handleCodeChange}
            hasError={isCodeFailed}
          />
        )}
        {step === "password" && (
          <AuthInput
            variant="underline"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호 입력"
            autoComplete="new-password"
            autoFocus
          />
        )}
      </AuthStepLayout>

      <ConfirmModal
        isOpen={isCodeFailed}
        icon="alert"
        title="본인 인증에 실패했어요"
        description="앱을 켜서 다시 확인해주세요."
        cancelLabel="그만두기"
        confirmLabel="확인"
        onCancel={() => navigate("/")}
        onConfirm={retryCode}
        isDismissible={false}
      />
    </form>
  );
}
