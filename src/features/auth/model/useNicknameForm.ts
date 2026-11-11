import { useState } from "react";

export const NICKNAME_MAX_LENGTH = 8;

export function useNicknameForm(onSuccess: () => void) {
  const [nickname, setNickname] = useState("");

  const handleSubmit = () => {
    if (nickname.trim() === "") return;
    // 가짜 저장: 닉네임 API가 정해지면 서버 호출로 교체
    onSuccess();
  };

  return { nickname, setNickname, handleSubmit };
}
