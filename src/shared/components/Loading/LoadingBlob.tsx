import ringImage from '@/shared/assets/loading/blob-ring.svg';
import coreImage from '@/shared/assets/loading/blob-core.svg';
import styles from './Loading.module.css';

type LoadingBlobProps = {
  label?: string;
};

// 흐릿한 라임색 덩어리가 도는 큰 로딩 표시 (피그마 Loading_in). 링크 분석 중 화면용
export default function LoadingBlob({ label = '분석하는 중' }: LoadingBlobProps) {
  return (
    <span className={styles.blob} role="status" aria-label={label}>
      <img src={ringImage} alt="" className={styles.blobRing} />
      <img src={coreImage} alt="" className={styles.blobCore} />
    </span>
  );
}
