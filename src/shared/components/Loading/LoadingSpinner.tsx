import ringImage from '@/shared/assets/loading/spinner-ring.png';
import styles from './Loading.module.css';

type LoadingSpinnerProps = {
  label?: string;
};

// 라임색 고리가 도는 작은 로딩 표시 (피그마 Loading_Out)
export default function LoadingSpinner({ label = '불러오는 중' }: LoadingSpinnerProps) {
  return (
    <span className={styles.spinner} role="status" aria-label={label}>
      <img src={ringImage} alt="" className={styles.spinnerRing} />
    </span>
  );
}
