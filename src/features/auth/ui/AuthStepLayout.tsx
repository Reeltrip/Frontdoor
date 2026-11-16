import type { ReactNode } from "react";
import { Link } from "react-router";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import styles from "./AuthStepLayout.module.css";

type AuthStepLayoutProps = {
  onBack?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  action: ReactNode;
  hasLoginLink?: boolean;
};

export default function AuthStepLayout({
  onBack,
  title,
  description,
  children,
  action,
  hasLoginLink = true,
}: AuthStepLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.top}>
        {onBack && (
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            aria-label="뒤로"
          >
            <img src={backIcon} alt="" />
          </button>
        )}
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>

      <div className={styles.fields}>{children}</div>

      <div className={styles.actions}>
        {action}
        {hasLoginLink ? (
          <p className={styles.loginText}>
            이미 회원이신가요?{" "}
            <Link to="/login" className={styles.loginLink}>
              로그인
            </Link>
          </p>
        ) : (
          <div className={styles.loginSpace} />
        )}
      </div>
    </main>
  );
}
