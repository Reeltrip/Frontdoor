import Button from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/Loading';
import styles from './MapStatus.module.css';

export type MapStatusKind = 'loading' | 'error' | 'noKey';

type MapStatusProps = {
  status: MapStatusKind;
  /** 지도 위에 겹쳐서 덮을 때 (불러오는 동안) */
  isOverlay?: boolean;
};

const reloadPage = () => window.location.reload();

// 지도 대신 보여 주는 화면: 불러오는 중, 불러오기 실패, 키 없음
export default function MapStatus({ status, isOverlay = false }: MapStatusProps) {
  const classNames = [styles.status, isOverlay && styles.overlay].filter(Boolean).join(' ');

  if (status === 'loading') {
    return (
      <div className={classNames}>
        <LoadingSpinner label="지도를 불러오는 중" />
        <p className={styles.description}>지도를 불러오는 중이에요.</p>
      </div>
    );
  }

  if (status === 'noKey') {
    return (
      <div className={classNames} role="alert">
        <p className={styles.title}>지도를 표시할 수 없어요.</p>
        <p className={styles.description}>지도 키가 설정되지 않았어요.</p>
        {import.meta.env.DEV && (
          <p className={styles.hint}>.env에 VITE_GOOGLE_MAPS_API_KEY를 넣고 개발 서버를 다시 켜 주세요.</p>
        )}
      </div>
    );
  }

  return (
    <div className={classNames} role="alert">
      <p className={styles.title}>지도를 불러오지 못했어요.</p>
      <p className={styles.description}>네트워크 연결을 확인하고 다시 시도해 주세요.</p>
      <Button variant="outline" size="sm" isFullWidth={false} className={styles.retry} onClick={reloadPage}>
        다시 시도
      </Button>
    </div>
  );
}
