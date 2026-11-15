import { useParams } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/Loading';
import { formatDayDate } from '@/features/plan/model/planDays';
import { usePlan } from '@/features/plan/model/usePlan';
import styles from './PlanEditPage.module.css';

// 임시 화면: 여행계획 편집(기능명세서 4-3)을 만들 때 교체해요.
// 지금은 생성 화면에서 만든 계획과 일차가 잘 넘어왔는지만 보여줘요
export default function PlanEditPage() {
  const { planId } = useParams();
  const { plan, viewStatus, error, refetch } = usePlan(planId);

  if (viewStatus === 'loading') {
    return (
      <main className={styles.center}>
        <LoadingSpinner label="여행 계획을 불러오는 중" />
      </main>
    );
  }

  if (viewStatus === 'error' || !plan) {
    return (
      <main className={styles.center}>
        <p className={styles.message}>여행 계획을 불러오지 못했어요. {getErrorMessage(error)}</p>
        <Button size="sm" isFullWidth={false} onClick={() => refetch()}>
          다시 시도
        </Button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{plan.title}</h1>
      <p className={styles.summary}>
        {plan.destination ? `${plan.destination} · ` : ''}
        {formatDayDate(plan.startDate)} ~ {formatDayDate(plan.endDate)}
      </p>
      <p className={styles.notice}>여행계획 편집 화면은 준비 중이에요.</p>
      <ol className={styles.days}>
        {plan.days.map((day, index) => (
          <li key={day.date} className={styles.day}>
            <span>{index + 1}일차</span>
            <span className={styles.dayDate}>{formatDayDate(day.date)}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
