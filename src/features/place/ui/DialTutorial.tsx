import handImage from "@/shared/assets/icons/tutorial-hand.svg";
import styles from "./DialTutorial.module.css";

type DialTutorialProps = {
  onClose: () => void;
  lines?: [string, string];
};
const DEFAULT_LINES: [string, string] = [
  "다이얼을 돌려",
  "카테고리 항목들을 살펴보세요!",
];

export default function DialTutorial({
  onClose,
  lines = DEFAULT_LINES,
}: DialTutorialProps) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.guide}>
        <p className={styles.text}>
          {lines[0]}
          <br />
          {lines[1]}
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
            {}
            <marker
              id="tutorial-head-green"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto-start-reverse"
            >
              <path className={styles.headGreen} d="M1 1L6 4L1 7" />
            </marker>
          </defs>
          {}
          <path
            className={styles.dotted}
            d="M301 415C302 394 280 381 254 391"
            markerEnd="url(#tutorial-head-white)"
          />
          {}
          <path
            className={styles.green}
            d="M84 552C120 528 175 512 217 509C257 512 285 526 302 543"
            markerStart="url(#tutorial-head-green)"
            markerEnd="url(#tutorial-head-green)"
          />
        </svg>

        <div className={styles.touch}>
          <span className={styles.touchRing} />
          <span className={styles.dot} />
        </div>
        <img className={styles.hand} src={handImage} alt="" />
      </div>
    </div>
  );
}
