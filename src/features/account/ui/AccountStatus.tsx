import Button from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/Loading';
import { getErrorMessage } from '@/shared/api/client';
import styles from './AccountStatus.module.css';

export default function AccountStatus({ isLoading, error, onRetry }: { isLoading?: boolean; error?: unknown; onRetry: () => void }) {
  return <div className={styles.status}>
    {isLoading ? <LoadingSpinner label="프로필을 불러오는 중" /> : <>
      <p role={error ? 'alert' : 'status'}>{error ? getErrorMessage(error) : '프로필 정보가 없어요.'}</p>
      <Button size="sm" isFullWidth={false} onClick={onRetry}>다시 불러오기</Button>
    </>}
  </div>;
}
