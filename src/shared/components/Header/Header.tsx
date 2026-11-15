import backIcon from "@/shared/assets/icons/back-arrow.svg";
import styles from "./Header.module.css";

type HeaderProps = {
  title: string;
  onBack?: () => void;
};

// 화면 위쪽의 뒤로 가기 버튼 + 제목
export default function Header({ title, onBack }: HeaderProps) {
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
    </header>
  );
}
