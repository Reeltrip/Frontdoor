import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';
import { apiRequest, getErrorMessage } from '@/shared/api/client';
import { API_BASE_URL } from '@/shared/lib/env';
import Button from '@/shared/components/Button';
import LivePlanTestPanel from './LivePlanTestPanel';
import styles from './LiveApiTestPanel.module.css';

export default function LiveApiTestPanel() {
  const session = useMutation({
    mutationFn: () => apiRequest<{ nickname: string }>('/users/me'),
  });

  return (
    <div className={styles.panel}>
      <h2>실제 API 검증</h2>
      <p>연결 서버: {API_BASE_URL}</p>
      <section className={styles.step}>
        <h3>로그인 확인</h3>
        <p>로그인한 계정의 검증용 계획을 사용해요. 저장 버튼은 실제 서버 데이터를 바꿔요.</p>
        <Link to="/login">로그인 화면</Link>
        <Button size="sm" disabled={session.isPending} onClick={() => session.mutate()}>로그인 확인</Button>
        {session.isPending && <p role="status">계정을 확인하고 있어요.</p>}
        {session.isError && <p className={styles.error} role="alert">{getErrorMessage(session.error)}</p>}
        {session.isSuccess && <p className={styles.success}>{session.data.nickname}님으로 로그인했어요.</p>}
      </section>
      {session.isSuccess && <LivePlanTestPanel />}
    </div>
  );
}
