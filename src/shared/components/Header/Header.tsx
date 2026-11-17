import type { ReactNode } from "react";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import styles from "./Header.module.css";

type HeaderProps = {
  title: string;
  onBack?: () => void;
  /** 오른쪽 끝에 두는 버튼 (예: 더보기) */
  action?: ReactNode;
};

// 화면 위쪽의 뒤로 가기 버튼 + 제목
export default function Header({ title, onBack, action }: HeaderProps) {
  return (
    <header className={styles.header}>
      {onBack && (
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="뒤로 가기"
        >
          <img src={backIcon} alt="" />
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}
