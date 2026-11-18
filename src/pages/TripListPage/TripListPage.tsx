import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import { isDraftPlanStatus, type PlanSummary } from '@/features/plan/model/plan.types';
import { usePlans } from '@/features/plan/model/usePlan';
import TabBar from '@/shared/components/TabBar';
import styles from './TripListPage.module.css';

type PlanTab = 'mine' | 'shared';

const formatDate = (date: string) => date.replaceAll('-', '.');

function isUpcoming(plan: PlanSummary) {
  const endDate = new Date(`${plan.endDate}T23:59:59`);
  return !Number.isNaN(endDate.getTime()) && endDate.getTime() >= Date.now();
}

function PlanRow({ plan, onOpen }: { plan: PlanSummary; onOpen: (plan: PlanSummary) => void }) {
  return (
    <li>
      <button type="button" className={styles.planRow} onClick={() => onOpen(plan)}>
        <span className={styles.planName}>{plan.title}</span>
        <span className={styles.planDate}>
          {/* 장소 수는 목록 응답의 placeCount예요. 값이 없으면 기간을 보여줘요 */}
          {plan.placeCount !== undefined
            ? `${formatDate(plan.startDate)} | 장소 ${plan.placeCount}곳`
            : `${formatDate(plan.startDate)} — ${formatDate(plan.endDate)}`}
        </span>
      </button>
    </li>
  );
}

// 다가오는 여행 큰 카드 (피그마 S5-1). 표지 사진이 없거나 못 불러오면 뒤의 그라데이션이 그대로 보여요
function FeaturedPlanCard({ plan, onOpen }: { plan: PlanSummary; onOpen: (plan: PlanSummary) => void }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>();
  const { coverImageUrl } = plan;
  const hasCover = coverImageUrl !== undefined && coverImageUrl !== failedImageUrl;

  return (
    <button type="button" className={styles.featured} onClick={() => onOpen(plan)}>
      {hasCover && (
        <img className={styles.featuredImage} src={coverImageUrl} alt="" onError={() => setFailedImageUrl(coverImageUrl)} />
      )}
      {/* 사진이 없을 때도 밝은 그라데이션 위 흰 글자가 읽히게 늘 덮어요 */}
      <span className={styles.featuredShade} />
      <span className={styles.featuredLabel}>다가오는 여행 | {plan.title}</span>
      <span className={styles.openIcon} aria-hidden="true">↗</span>
    </button>
  );
}

export default function TripListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PlanTab>('mine');
  const [showAllPast, setShowAllPast] = useState(false);
  const { plans, viewStatus, error, refetch } = usePlans({ owner: 'me' });
  const shared = usePlans({ owner: 'shared' });
  const { upcoming, past } = useMemo(() => {
    const sorted = [...plans].sort((a, b) => a.startDate.localeCompare(b.startDate));
    return {
      upcoming: sorted.filter(isUpcoming),
      past: sorted.filter((plan) => !isUpcoming(plan)).reverse(),
    };
  }, [plans]);

  const openPlan = (plan: PlanSummary) =>
    navigate(isDraftPlanStatus(plan.status) ? `/plans/${plan.id}/edit` : `/plans/${plan.id}`);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>여행목록</h1>
        <button type="button" className={styles.moreButton} aria-label="여행계획 만들기" onClick={() => navigate('/plans/new')}>
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="여행계획 종류">
        <button type="button" role="tab" aria-selected={activeTab === 'mine'} className={activeTab === 'mine' ? styles.activeTab : ''} onClick={() => setActiveTab('mine')}>
          내 계획
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'shared'} className={activeTab === 'shared' ? styles.activeTab : ''} onClick={() => setActiveTab('shared')}>
          공유받은 계획
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'shared' ? (
          shared.viewStatus === 'loading' ? (
            <div className={styles.state} role="status">공유받은 계획을 불러오는 중이에요.</div>
          ) : shared.viewStatus === 'error' ? (
            <div className={styles.state} role="alert">
              <p>공유받은 계획을 불러오지 못했어요. {getErrorMessage(shared.error)}</p>
              <button type="button" onClick={() => shared.refetch()}>다시 시도</button>
            </div>
          ) : shared.plans.length === 0 ? (
            <div className={styles.emptyShared} role="tabpanel">
              <p>공유받은 여행계획이 없어요.</p>
            </div>
          ) : (
            <div role="tabpanel" className={styles.planContent}>
              <ul className={styles.list}>
                {/* 공유받은 계획은 권한에 따라 못 고칠 수 있어서 늘 보기 화면으로 열어요 */}
                {shared.plans.map((plan) => <PlanRow key={plan.id} plan={plan} onOpen={(item) => navigate(`/plans/${item.id}`)} />)}
              </ul>
            </div>
          )
        ) : viewStatus === 'loading' ? (
          <div className={styles.state} role="status">여행목록을 불러오는 중이에요.</div>
        ) : viewStatus === 'error' ? (
          <div className={styles.state} role="alert">
            <p>여행목록을 불러오지 못했어요. {getErrorMessage(error)}</p>
            <button type="button" onClick={() => refetch()}>다시 시도</button>
          </div>
        ) : (
          <div role="tabpanel" className={styles.planContent}>
            {upcoming[0] && (
              <section className={styles.upcoming} aria-label="다가오는 여행">
                <FeaturedPlanCard plan={upcoming[0]} onOpen={openPlan} />
              </section>
            )}

            <section className={styles.pastSection} aria-labelledby="past-trips-title">
              <div className={styles.sectionHeading}>
                <h2 id="past-trips-title">지난 여행 <span>{past.length}</span></h2>
                {past.length > 3 && (
                  <button type="button" onClick={() => setShowAllPast((isShowing) => !isShowing)}>
                    {showAllPast ? '접기' : '모두보기'}
                  </button>
                )}
              </div>
              {past.length ? (
                <ul className={styles.list}>
                  {(showAllPast ? past : past.slice(0, 3)).map((plan) => <PlanRow key={plan.id} plan={plan} onOpen={openPlan} />)}
                </ul>
              ) : (
                <p className={styles.empty}>아직 지난 여행이 없어요.</p>
              )}
              {upcoming.length > 1 && (
                <>
                  <h2 className={styles.otherTitle}>다가오는 여행</h2>
                  <ul className={styles.list}>
                    {upcoming.slice(1).map((plan) => <PlanRow key={plan.id} plan={plan} onOpen={openPlan} />)}
                  </ul>
                </>
              )}
              {plans.length === 0 && <button type="button" className={styles.createButton} onClick={() => navigate('/plans/new')}>여행계획 만들기</button>}
            </section>
          </div>
        )}
      </div>

      <TabBar activeTab="menu" className={styles.tabBar} />
    </main>
  );
}
