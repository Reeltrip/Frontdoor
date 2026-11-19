import styles from "./EditTutorial.module.css";

type EditTutorialProps = {
  onClose: () => void;
};

export default function EditTutorial({ onClose }: EditTutorialProps) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.guide}>
        <p className={styles.text}>
          버튼을 눌러
          <br />
          카테고리 내용들을 편집하고 저장하세요!
        </p>

        <svg className={styles.arrow} viewBox="0 0 390 844" aria-hidden>
          <defs>
            <marker
              id="edit-tutorial-head"
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
            d="M305 780C284 786 256 776 252 751"
            markerEnd="url(#edit-tutorial-head)"
          />
        </svg>
      </div>
      <span className={styles.ring} />
    </div>
  );
}
