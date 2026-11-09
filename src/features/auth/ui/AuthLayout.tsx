import type { ReactNode } from "react";
import logo from "@/shared/assets/logo/wayvi-logo-lime.svg";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  children: ReactNode; // 입력칸들
  actions: ReactNode; // 하단 버튼과 링크
};

export default function AuthLayout({ children, actions }: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <img className={styles.logo} src={logo} alt="WAYVI" />
      <div className={styles.fields}>{children}</div>
      <div className={styles.actions}>{actions}</div>
    </main>
  );
}
