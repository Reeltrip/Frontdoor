import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import AuthInput from "@/features/auth/ui/AuthInput";
import Button from "@/shared/components/Button";
import {
  NICKNAME_MAX_LENGTH,
  useNicknameForm,
} from "@/features/auth/model/useNicknameForm";
import styles from "./NicknamePage.module.css";

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
    <form className={styles.page} onSubmit={handleFormSubmit}>
      <header className={styles.header}>
        <h1 className={styles.title}>안녕하세요, 웨이비입니다!</h1>
        <p className={styles.description}>당신을 뭐라고 불러드리면 될까요?</p>
      </header>

      <AuthInput
        value={nickname}
        onChange={setNickname}
        placeholder="닉네임을 입력해주세요.(1자~8자)"
        maxLength={NICKNAME_MAX_LENGTH}
        autoComplete="nickname"
      />

      <div className={styles.actions}>
        <Button type="submit">시작하기</Button>
      </div>
    </form>
  );
}
