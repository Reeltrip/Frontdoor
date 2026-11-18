import { useNavigate } from "react-router";
import TabBar from "@/shared/components/TabBar";
import linkBg from "@/shared/assets/images/link-bg.png";
import RecentCollectionCard from "@/features/source/ui/RecentCollectionCard";
import { useRecentCollections } from "@/features/source/model/useRecentCollections";
import styles from "./HomePage.module.css";
import { useState } from "react";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { readClipboardLink } from "@/features/source/lib/readClipboardLink";
import type { LinkAddState } from "@/features/source/model/source.types";
import LinkTutorial from "@/features/source/ui/LinkTutorial";

const LINK_TUTORIAL_SEEN_KEY = "reeltrip:link-tutorial-seen";

function hasSeenLinkTutorial(): boolean {
  try {
    return sessionStorage.getItem(LINK_TUTORIAL_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markLinkTutorialSeen() {
  try {
    sessionStorage.setItem(LINK_TUTORIAL_SEEN_KEY, "1");
  } catch {}
}

export default function HomePage() {
  const navigate = useNavigate();
  // 불러오는 중이거나 실패하면 목록 없이 링크 불러오기만 보여줘요
  const recentCollections = useRecentCollections();
  const hasRecentCollections = recentCollections.length > 0;

  const [clipboardLink, setClipboardLink] = useState<string | null>(null);

  // 클립보드에 링크가 있으면 팝업을 띄우고, 없으면 바로 링크 추가 화면으로 감
  const handleLoadLinkClick = async () => {
    closeTutorial();
    const link = await readClipboardLink();
    if (link === null) {
      navigate("/links/new");
      return;
    }
    setClipboardLink(link);
  };

  const [isTutorialOpen, setIsTutorialOpen] = useState(
    () => !hasSeenLinkTutorial(),
  );

  const closeTutorial = () => {
    markLinkTutorialSeen();
    setIsTutorialOpen(false);
  };

  const handleClipboardConfirm = () => {
    if (clipboardLink === null) return;
    const state: LinkAddState = { initialLink: clipboardLink };
    navigate("/links/new", { state });
  };

  const handleClipboardCancel = () => navigate("/links/new");

  return (
    <main className={styles.page}>
      <div className={styles.backgroundFrame} aria-hidden>
        <img className={styles.background} src={linkBg} alt="" />
      </div>

      <header className={styles.header}>
        <h1
          className={`${styles.title} ${isTutorialOpen ? styles.titleOnTutorial : ""}`}
        >
          모아둔 여행 영상 링크를
          <br />
          보여주세요!
        </h1>
        <p className={styles.description}>
          유튜브, 인스타그램 릴스, 블로그 모두 좋아요!
        </p>
        <button
          type="button"
          className={`${styles.loadButton} ${isTutorialOpen ? styles.aboveTutorial : ""}`}
          onClick={handleLoadLinkClick}
        >
          링크 불러오기
        </button>
      </header>

      {hasRecentCollections && (
        <section className={styles.recent}>
          <h2 className={styles.recentTitle}>최근 수집 내역</h2>
          <ul className={styles.recentList}>
            {recentCollections.map((collection) => (
              <RecentCollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </ul>
        </section>
      )}
      {isTutorialOpen && (
        <LinkTutorial onClose={closeTutorial} onTry={handleLoadLinkClick} />
      )}
      <ConfirmModal
        isOpen={clipboardLink !== null}
        icon="link"
        title="클립보드에 링크가 있어요."
        description="방금 복사한 이 링크를 가져올까요?"
        cancelLabel="직접 입력하기"
        confirmLabel="링크 추가하기"
        onCancel={handleClipboardCancel}
        onConfirm={handleClipboardConfirm}
      />
      <TabBar activeTab="sources" className={styles.tabBar} />
    </main>
  );
}
