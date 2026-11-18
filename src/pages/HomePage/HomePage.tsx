import { useNavigate } from "react-router";
import TabBar from "@/shared/components/TabBar";
import linkBg from "@/shared/assets/images/link-bg.png";
import RecentCollectionCard from "@/features/source/ui/RecentCollectionCard";
import { useRecentCollections } from "@/features/source/model/useRecentCollections";
import styles from "./HomePage.module.css";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sourceKeys } from "@/features/source/api/sources";
import HomeTutorial from "@/features/source/ui/HomeTutorial";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { readClipboardLink } from "@/features/source/lib/readClipboardLink";
import type { LinkAddState } from "@/features/source/model/source.types";

const HOME_TUTORIAL_SEEN_KEY = "wayvi.homeTutorialSeen";

/** 홈 사용 안내를 이미 닫은 적이 있는지. 저장소를 못 읽으면 처음 보는 것으로 봐요 */
function hasSeenHomeTutorial(): boolean {
  try {
    return localStorage.getItem(HOME_TUTORIAL_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markHomeTutorialSeen(): void {
  try {
    localStorage.setItem(HOME_TUTORIAL_SEEN_KEY, "1");
  } catch {
    // 저장이 막힌 환경(사생활 보호 모드 등)에서는 이번 화면에서만 닫혀요
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  // 불러오는 중이거나 실패하면 목록 없이 링크 불러오기만 보여줘요
  const recentCollections = useRecentCollections();
  const hasRecentCollections = recentCollections.length > 0;

  // 불러오기가 끝났는데 0개일 때만 사용 안내를 띄워요. 불러오는 중·실패와 구분하려고 쿼리 상태를 직접 봐요
  const queryClient = useQueryClient();
  const isRecentLoaded =
    queryClient.getQueryState(sourceKeys.recent())?.status === "success";
  const [hasSeenTutorial, setHasSeenTutorial] = useState(hasSeenHomeTutorial);
  const isTutorialOpen =
    !hasSeenTutorial && isRecentLoaded && !hasRecentCollections;

  const [clipboardLink, setClipboardLink] = useState<string | null>(null);

  // 클립보드에 링크가 있으면 팝업을 띄우고, 없으면 바로 링크 추가 화면으로 감
  const handleLoadLinkClick = async () => {
    const link = await readClipboardLink();
    if (link === null) {
      navigate("/links/new");
      return;
    }
    setClipboardLink(link);
  };

  const handleClipboardConfirm = () => {
    if (clipboardLink === null) return;
    const state: LinkAddState = { initialLink: clipboardLink };
    navigate("/links/new", { state });
  };

  const handleClipboardCancel = () => navigate("/links/new");

  const handleTutorialClose = () => {
    markHomeTutorialSeen();
    setHasSeenTutorial(true);
  };

  // 안내를 먼저 닫은 뒤 홈 버튼과 같은 흐름(클립보드 확인)을 따라요
  const handleTutorialLoadLink = () => {
    handleTutorialClose();
    void handleLoadLinkClick();
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundFrame} aria-hidden>
        <img className={styles.background} src={linkBg} alt="" />
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>
          모아둔 여행 영상 링크를
          <br />
          보여주세요!
        </h1>
        <p className={styles.description}>
          유튜브, 인스타그램 릴스, 블로그 모두 좋아요!
        </p>
        <button
          type="button"
          className={styles.loadButton}
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
      {isTutorialOpen && (
        <HomeTutorial
          onClose={handleTutorialClose}
          onLoadLink={handleTutorialLoadLink}
        />
      )}
    </main>
  );
}
