import styles from "./LinkTutorial.module.css";

type LinkTutorialProps = {
  onClose: () => void;
  onTry: () => void;
};

export default function LinkTutorial({ onClose, onTry }: LinkTutorialProps) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.guide}>
        <span className={styles.ring} />

        <svg className={styles.arrow} viewBox="0 0 390 844" aria-hidden>
          <defs>
            <marker
              id="link-tutorial-head"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path className={styles.head} d="M1 1L6 4L1 7" />
            </marker>
          </defs>
          <path
            className={styles.dotted}
            d="M258 247C277 246 290 258 289 285"
            markerEnd="url(#link-tutorial-head)"
          />
        </svg>

        <p className={styles.text}>
          버튼을 눌러
          <br />
          여행 릴스 링크를 불러오기만
          <br />
          하면 자동으로 요약카드가 만들어져요.
        </p>

        <button type="button" className={styles.tryButton} onClick={onTry}>
          사용해보기
          <svg
            className={styles.tryArrow}
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 2L8 8L2 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
