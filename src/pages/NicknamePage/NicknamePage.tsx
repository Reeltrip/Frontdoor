import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import AuthStepLayout from "@/features/auth/ui/AuthStepLayout";
import AuthInput from "@/features/auth/ui/AuthInput";
import Button from "@/shared/components/Button";
import {
  NICKNAME_MAX_LENGTH,
  useNicknameForm,
} from "@/features/auth/model/useNicknameForm";

export default function NicknamePage() {
  const navigate = useNavigate();
  const { nickname, setNickname, handleSubmit } = useNicknameForm(() =>
    navigate("/home"),
  );

  const handleFormSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <AuthStepLayout
        title="안녕하세요, 웨이비입니다!"
        description="앞으로 불러드릴 이름을 알려주세요!"
        hasLoginLink={false}
        action={
          <Button type="submit" disabled={nickname.trim() === ""}>
            시작하기
          </Button>
        }
      >
        <AuthInput
          variant="underline"
          value={nickname}
          onChange={setNickname}
          placeholder="닉네임 입력"
          maxLength={NICKNAME_MAX_LENGTH}
          autoComplete="nickname"
          autoFocus
        />
      </AuthStepLayout>
    </form>
  );
}
