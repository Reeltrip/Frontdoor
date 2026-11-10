import { useNavigate } from "react-router";
import TabBar from "@/shared/components/TabBar";
import linkBg from "@/shared/assets/images/link-bg.png";
import RecentCollectionCard from "@/features/source/ui/RecentCollectionCard";
import { FAKE_RECENT_COLLECTIONS } from "@/features/source/api/recentCollections";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();
  const recentCollections = FAKE_RECENT_COLLECTIONS;
  const hasRecentCollections = recentCollections.length > 0;

  const handleLoadLinkClick = () => {
    navigate("/links/new");
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

      <TabBar activeTab="sources" className={styles.tabBar} />
    </main>
  );
}
