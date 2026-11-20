import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import bgImage from '@/shared/assets/images/plan-home-bg.jpg';
import globeImage from '@/shared/assets/images/plan-home-globe.svg';
import { LoadingSpinner } from '@/shared/components/Loading';
import TabBar from '@/shared/components/TabBar';
import Toast from '@/shared/components/Toast';
import { isDraftPlanStatus, type PlanSummary } from '@/features/plan/model/plan.types';
import { usePlans } from '@/features/plan/model/usePlan';
import { DARK_BACKDROP, useScreenBackdrop } from '@/shared/hooks/useScreenBackdrop';
import styles from './PlanHomePage.module.css';

const STATUS_LABELS: Record<PlanSummary['status'], string> = {
  draft: '작성중',
  complete: '작성완료',
  DRAFT: '작성중',
  COMPLETED: '작성완료',
};

/** 2026-11-21 → 2026.11.21 */
const formatDate = (date: string) => date.replaceAll('-', '.');

// 하단 '계획' 탭 화면. 새 계획을 만들거나 최근 계획으로 들어가요
export default function PlanHomePage() {
  useScreenBackdrop(DARK_BACKDROP, { hasStatusBarCap: false });
  const navigate = useNavigate();
  const location = useLocation();
  const planAutoSaved = (location.state as { planAutoSaved?: boolean } | null)?.planAutoSaved === true;
  const [showSavedToast, setShowSavedToast] = useState(planAutoSaved);

  useEffect(() => {
    if (planAutoSaved) navigate('.', { replace: true, state: null });
  }, [navigate, planAutoSaved]);

  useEffect(() => {
    if (!showSavedToast) return;
    const timer = window.setTimeout(() => setShowSavedToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showSavedToast]);
  const { plans, viewStatus, error, refetch } = usePlans();

  // 작성 중인 계획은 이어서 편집하고, 다 만든 계획은 보기 화면으로 가요
  const openPlan = (plan: PlanSummary) =>
    navigate(isDraftPlanStatus(plan.status) ? `/plans/${plan.id}/edit` : `/plans/${plan.id}`);

  const renderPlans = () => {
    if (viewStatus === 'loading') {
      return (
        <div className={styles.status}>
          <LoadingSpinner label="계획 목록을 불러오는 중" />
        </div>
      );
    }
    if (viewStatus === 'error') {
      return (
        <div className={styles.status} role="alert">
          <p className={styles.statusText}>계획 목록을 불러오지 못했어요. {getErrorMessage(error)}</p>
          <button type="button" className={styles.retryButton} onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      );
    }
    if (viewStatus === 'empty') {
      return (
        <div className={styles.status}>
          <p className={styles.statusText}>아직 만든 계획이 없어요.</p>
        </div>
      );
    }
    return (
      <ul className={styles.list}>
        {plans.map((plan) => (
          <li key={plan.id}>
            <button type="button" className={styles.planCard} onClick={() => openPlan(plan)}>
              <span className={styles.planMeta}>
                {formatDate(plan.startDate)} ㅣ {STATUS_LABELS[plan.status]}
              </span>
              <span className={styles.planTitle}>{plan.title}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <main className={styles.page}>
      <img src={bgImage} alt="" className={styles.background} />
      <img src={globeImage} alt="" className={styles.globe} />

      <section className={styles.intro}>
        <h1 className={styles.title}>
          모아둔 여행자료로
          <br />
          여행계획을 만들어 보세요.
        </h1>
        <p className={styles.description}>완성한 계획은 메뉴의 “여행목록"에서 볼 수 있어요.</p>
        <button type="button" className={styles.createButton} onClick={() => navigate('/plans/new')}>
          여행계획 생성하기
        </button>
      </section>

      <section className={styles.recent} aria-labelledby="recent-plans-title">
        <h2 id="recent-plans-title" className={styles.recentTitle}>
          최근 작성 계획
        </h2>
        {renderPlans()}
      </section>

      <TabBar activeTab="plan" theme="dark" className={styles.tabBar} />
      {showSavedToast && <Toast message="여행계획이 자동 저장됐어요." />}
    </main>
  );
}
