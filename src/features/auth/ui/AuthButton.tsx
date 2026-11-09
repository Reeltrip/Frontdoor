import type { ReactNode } from "react";
import styles from "./AuthButton.module.css";

type AuthButtonProps = {
  children: ReactNode;
  disabled?: boolean;
};

// 공통 Button이 올라오면 shared 컴포넌트로 교체
export default function AuthButton({
  children,
  disabled = false,
}: AuthButtonProps) {
  return (
    <button type="submit" className={styles.button} disabled={disabled}>
      {children}
    </button>
  );
}
