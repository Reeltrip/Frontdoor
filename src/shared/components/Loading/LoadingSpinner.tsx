import ringImage from '@/shared/assets/loading/spinner-ring.png';
import type { CSSProperties } from 'react';
import styles from './Loading.module.css';

type LoadingSpinnerProps = {
  label?: string;
  /** 회전 속도 배율. 1이 기본, 2면 두 배 빠름 */
  speed?: number;
};

// 라임색 고리가 도는 작은 로딩 표시 (피그마 Loading_Out)
export default function LoadingSpinner({ label = '불러오는 중', speed = 1 }: LoadingSpinnerProps) {
  return (
    <span
      className={styles.spinner}
      role="status"
      aria-label={label}
      style={{ '--loading-speed': speed } as CSSProperties}
    >
      <img src={ringImage} alt="" className={styles.spinnerRing} />
    </span>
  );
}
