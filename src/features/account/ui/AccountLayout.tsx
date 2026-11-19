import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import TabBar from "@/shared/components/TabBar";
import backChevron from "../assets/back-chevron.svg";
import styles from "./AccountLayout.module.css";
import { useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";

type AccountLayoutProps = {
  title: string;
  children: ReactNode;
  hasBack?: boolean;
  hasTabBar?: boolean;
  onBack?: () => void;
  action?: ReactNode;
};

export default function AccountLayout({
  title,
  children,
  hasBack = true,
  hasTabBar = false,
  onBack,
  action,
}: AccountLayoutProps) {
  const navigate = useNavigate();
  useScreenBackdrop("#fafafa");
  return (
    <main className={`${styles.page} ${hasTabBar ? styles.withTabs : ""}`}>
      <header className={styles.header}>
        {hasBack && (
          <button
            type="button"
            className={styles.back}
            onClick={onBack ?? (() => navigate("/my"))}
            aria-label="뒤로 가기"
          >
            <img src={backChevron} alt="" />
          </button>
        )}
        <h1 className={styles.title}>{title}</h1>
        {action}
      </header>
      {children}
      {hasTabBar && <TabBar activeTab="profile" className={styles.tabBar} />}
    </main>
  );
}
