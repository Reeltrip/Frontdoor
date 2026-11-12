import styles from "./DialTutorial.module.css";

type DialTutorialProps = {
  onClose: () => void;
};

export default function DialTutorial({ onClose }: DialTutorialProps) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.guide}>
        <p className={styles.text}>
          다이얼을 돌려
          <br />
          카테고리 항목들을 살펴보세요!
        </p>

        <svg className={styles.arrows} viewBox="0 0 390 844" aria-hidden>
          <defs>
            <marker
              id="tutorial-head-white"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path className={styles.headWhite} d="M1 1L6 4L1 7" />
            </marker>
            <marker
              id="tutorial-head-green"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path className={styles.headGreen} d="M1 1L6 4L1 7" />
            </marker>
          </defs>
          {}
          <path
            className={styles.dotted}
            d="M252 392C258 372 296 372 301 408"
            markerEnd="url(#tutorial-head-white)"
          />
          {}
          <path
            className={styles.green}
            d="M213 512C170 516 120 528 86 548"
            markerEnd="url(#tutorial-head-green)"
          />
          <path
            className={styles.green}
            d="M225 512C262 514 288 522 304 538"
            markerEnd="url(#tutorial-head-green)"
          />
        </svg>

        <div className={styles.touch}>
          <span className={styles.dot} />
          <svg
            className={styles.hand}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path d="M18 11V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
            <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
            <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
            <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
      </div>
    </div>
  );
}
