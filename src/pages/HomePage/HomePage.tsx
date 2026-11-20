import { useNavigate } from "react-router";
import TabBar from "@/shared/components/TabBar";
import linkBg from "@/shared/assets/images/link-bg.png";
import RecentCollectionCard from "@/features/source/ui/RecentCollectionCard";
import { useRecentCollections } from "@/features/source/model/useRecentCollections";
import { LIME_BACKDROP, useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";
import styles from "./HomePage.module.css";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sourceKeys } from "@/features/source/api/sources";
import HomeTutorial from "@/features/source/ui/HomeTutorial";
import {
  advanceTutorialTour,
  clearTutorialReplay,
  isTutorialReplay,
} from "@/features/account/lib/tutorialReplay";
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
  useScreenBackdrop(LIME_BACKDROP, { hasStatusBarCap: false });
  const navigate = useNavigate();
  // 불러오는 중이거나 실패하면 목록 없이 링크 불러오기만 보여줘요
  const recentCollections = useRecentCollections();
  const hasRecentCollections = recentCollections.length > 0;
  const recentScrollRef = useRef<HTMLDivElement>(null);
  const recentListRef = useRef<HTMLUListElement>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    const scrollArea = recentScrollRef.current;
    const list = recentListRef.current;
    if (!hasRecentCollections || !scrollArea || !list) return;

    const updateFade = () => {
      const { scrollTop, clientHeight, scrollHeight } = scrollArea;
      setHasMoreBelow(scrollTop + clientHeight < scrollHeight - 1);
    };

    // 화면 높이와 카드 내용이 바뀔 때도 그라데이션을 다시 확인해요
    const observer = new ResizeObserver(updateFade);
    observer.observe(scrollArea);
    observer.observe(list);
    scrollArea.addEventListener("scroll", updateFade, { passive: true });
    updateFade();

    return () => {
      observer.disconnect();
      scrollArea.removeEventListener("scroll", updateFade);
    };
  }, [hasRecentCollections]);

  // 불러오기가 끝났는데 0개일 때만 사용 안내를 띄워요. 불러오는 중·실패와 구분하려고 쿼리 상태를 직접 봐요
  const queryClient = useQueryClient();
  const isRecentLoaded =
    queryClient.getQueryState(sourceKeys.recent())?.status === "success";
  const [hasSeenTutorial, setHasSeenTutorial] = useState(hasSeenHomeTutorial);
  // 마이페이지에서 "튜토리얼 다시 보기"를 누르면 수집 기록이 있어도 한 번 띄워요
  const [isReplay] = useState(isTutorialReplay);
  const isTutorialOpen =
    !hasSeenTutorial && isRecentLoaded && (!hasRecentCollections || isReplay);

  const [clipboardLink, setClipboardLink] = useState<string | null>(null);

  // 클립보드에 링크가 있으면 팝업을 띄우고, 없으면 바로 링크 추가 화면으로 감
  const handleLoadLinkClick = async () => {
    const link = await readClipboardLink({ requireGrantedPermission: true });
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
    // 다시 보기 중이면 다음 안내(요약카드)로 이어서 가요 (#179)
    if (isReplay) navigate(advanceTutorialTour());
  };

  // 안내를 먼저 닫은 뒤 홈 버튼과 같은 흐름(클립보드 확인)을 따라요. 직접 해 보기를 골랐으니 이어 보기는 끝내요
  const handleTutorialLoadLink = () => {
    markHomeTutorialSeen();
    clearTutorialReplay();
    setHasSeenTutorial(true);
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
          <h2 id="recent-collections-title" className={styles.recentTitle}>
            최근 수집 내역
          </h2>
          <div className={styles.recentBody}>
            <div
              ref={recentScrollRef}
              className={styles.recentScroll}
              role="region"
              aria-labelledby="recent-collections-title"
              tabIndex={0}
            >
              <ul ref={recentListRef} className={styles.recentList}>
                {recentCollections.map((collection) => (
                  <RecentCollectionCard
                    key={collection.id}
                    collection={collection}
                  />
                ))}
              </ul>
            </div>
            <div
              className={`${styles.bottomFade} ${hasMoreBelow ? styles.bottomFadeVisible : ""}`}
              aria-hidden
            />
          </div>
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
