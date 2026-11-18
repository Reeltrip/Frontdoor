import type { PlanTutorialKind } from '../lib/planTutorialSeen';
import styles from './PlanTutorial.module.css';

type PlanTutorialOverlayProps = {
  kind: PlanTutorialKind;
  onClose: () => void;
};

/** 지도와 위쪽 줄을 덮는 어두운 막. 어디를 눌러도 닫혀요 */
export function PlanTutorialOverlay({ kind, onClose }: PlanTutorialOverlayProps) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      {kind === 'confirm' && (
        // 피그마 'S4-5c-2 여행계획 튜토리얼': 1번에서 2번으로 이어지는 동선 그림
        <svg className={styles.route} viewBox="0 0 240 260" aria-hidden>
          <ellipse className={styles.glow} cx="160" cy="212" rx="70" ry="38" />
          <path className={styles.line} d="M38 92L160 212" />
          <circle className={styles.dot} cx="38" cy="92" r="9" />
          <circle className={styles.dot} cx="160" cy="212" r="9" />
          <path className={styles.pin} d="M36 74C18 60 4 50 4 34a32 32 0 0164 0c0 16-14 26-32 40z" />
          <path className={styles.pin} d="M160 190c-18-14-32-24-32-40a32 32 0 0164 0c0 16-14 26-32 40z" />
          <text className={styles.number} x="36" y="44">1</text>
          <text className={styles.number} x="160" y="160">2</text>
        </svg>
      )}
    </div>
  );
}

/** 아래쪽 버튼·카드 바로 위에 놓는 안내 글과 점선 화살표 */
export function PlanTutorialHint({ kind }: { kind: PlanTutorialKind }) {
  if (kind === 'confirm') {
    return (
      <div className={styles.confirmHint}>
        <p className={styles.text}>
          지도 위에서 장소를 둘러보며 확정해보아요.
          <br />
          확정하면 바로 일정으로 추가돼요.
        </p>
        <svg className={styles.confirmArrow} viewBox="0 0 44 44" aria-hidden>
          <path className={styles.dotted} d="M34 42C40 26 30 10 10 8" />
          <path className={styles.head} d="M17 2L9 8L17 14" />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.planBHint}>
      <p className={styles.text}>
        확정카드에서 <strong className={styles.accent}>플랜 B추가</strong>를 눌러
        <br />
        계획을 더 구체화 해보세요!
      </p>
      <span className={`${styles.label} ${styles.removeLabel}`}>카드 삭제</span>
      <span className={`${styles.label} ${styles.openLabel}`}>원본 보기</span>
      {/* 화살표는 카드 위 버튼에서 글 쪽으로 올라와요. 카드는 y 98에서 시작하고 왼쪽 20px, 폭 300px이에요 */}
      <svg className={styles.planBArrows} viewBox="0 0 390 150" aria-hidden>
        <path className={styles.dotted} d="M58 124C40 112 34 84 48 62" />
        <path className={styles.head} d="M41 67L49 61L53 70" />
        <path className={styles.dotted} d="M245 122C252 104 250 82 241 66" />
        <path className={styles.head} d="M235 72L241 65L248 70" />
        <path className={styles.dotted} d="M283 122C296 108 302 86 300 66" />
        <path className={styles.head} d="M294 72L300 65L306 72" />
      </svg>
    </div>
  );
}
