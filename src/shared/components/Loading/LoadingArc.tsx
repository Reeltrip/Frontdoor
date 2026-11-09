import type { CSSProperties } from 'react';
import arcImage from '@/shared/assets/loading/arc.svg';
import styles from './Loading.module.css';

type LoadingArcProps = {
  label?: string;
  /** 회전 속도 배율. 1이 기본, 2면 두 배 빠름 */
  speed?: number;
};

// 회색 호가 도는 작은 로딩 표시 (피그마 컴포넌트 > 2, 4장면이 90도씩 돎)
export default function LoadingArc({ label = '불러오는 중', speed = 1 }: LoadingArcProps) {
  return (
    <span
      className={styles.arc}
      role="status"
      aria-label={label}
      style={{ '--loading-speed': speed } as CSSProperties}
    >
      <img src={arcImage} alt="" className={styles.arcImage} />
    </span>
  );
}
