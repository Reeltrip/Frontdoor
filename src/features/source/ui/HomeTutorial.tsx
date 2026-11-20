import type { MouseEvent } from "react";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import styles from "./HomeTutorial.module.css";

type HomeTutorialProps = {
  /** 닫기만 해요 (뒤로 꺾쇠, 어두운 막) */
  onClose: () => void;
  /** 닫고 홈의 [링크 불러오기]와 같은 동작을 해요 */
  onLoadLink: () => void;
};

/** 최근 수집 내역이 없을 때 홈 위에 겹쳐 보여주는 사용 안내 */
export default function HomeTutorial({ onClose, onLoadLink }: HomeTutorialProps) {
  // 막을 누른 것으로 처리되지 않게 버튼 클릭은 위로 올리지 않아요
  const handleCloseClick = (event: MouseEvent) => {
    event.stopPropagation();
    onClose();
  };

  const handleLoadLinkClick = (event: MouseEvent) => {
    event.stopPropagation();
    onLoadLink();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <section className={styles.guide} role="dialog" aria-label="홈 사용 안내">
        <button
          type="button"
          className={styles.backButton}
          onClick={handleCloseClick}
          aria-label="안내 닫기"
        >
          <img className={styles.backIcon} src={backIcon} alt="" />
        </button>

        {/* 홈 화면의 header와 같은 구조·값이라 제목과 버튼이 정확히 겹쳐요 */}
        <div className={styles.header}>
          <p className={styles.title}>
            모아둔 여행 영상 링크를
            <br />
            보여주세요!
          </p>
          <p className={styles.description} aria-hidden>
            유튜브, 인스타그램 릴스, 블로그 모두 좋아요!
          </p>
          <button
            type="button"
            className={styles.loadButton}
            onClick={handleLoadLinkClick}
          >
            링크 불러오기
          </button>
        </div>

        <svg className={styles.arrow} viewBox="0 0 390 844" aria-hidden>
          <defs>
            <marker
              id="home-tutorial-head"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path className={styles.head} d="M1 1L6 4L1 7" />
            </marker>
          </defs>
          {/* 안내 글 첫 줄 오른쪽에서 버튼 오른쪽 아래로 휘어 올라가요. 버튼 위치·크기를 바꾸면 끝점도 옮겨요 */}
          <path
            className={styles.dotted}
            d="M186 344C254 346 306 270 270 240"
            markerEnd="url(#home-tutorial-head)"
          />
        </svg>

        <p className={styles.text}>
          버튼을 눌러
          <br />
          여행 릴스 링크를 불러오기만
          <br />
          하면 자동으로 요약카드가 만들어져요.
        </p>

        <button
          type="button"
          className={styles.tryButton}
          onClick={handleLoadLinkClick}
        >
          사용해보기 &gt;
        </button>
      </section>
    </div>
  );
}
