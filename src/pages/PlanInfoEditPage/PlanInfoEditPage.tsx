import { useState, type SyntheticEvent } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '@/shared/assets/icons/arrow-back-light.svg';
import locationIcon from '@/shared/assets/icons/location-light.svg';
import backgroundImage from '@/shared/assets/images/plan-create-bg.png';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import Calendar from '@/shared/components/Calendar';
import LabeledInput from '@/shared/components/LabeledInput';
import { LoadingSpinner } from '@/shared/components/Loading';
import type { Plan } from '@/features/plan/model/plan.types';
import { changePlanPeriod, getPeriodChange, listDates } from '@/features/plan/model/planDays';
import { usePlan, useUpdatePlan } from '@/features/plan/model/usePlan';
import { PLAN_PERIOD_ERROR_MESSAGE, usePlanCreateForm } from '@/features/plan/model/usePlanCreateForm';
import KeepDaysModal from '@/features/plan/ui/KeepDaysModal';
// 피그마 'S4-1 여행계획 수정'은 새 여행계획 화면과 모양이 같아서 그 스타일을 그대로 써요
import formStyles from '../PlanCreatePage/PlanCreatePage.module.css';
import styles from './PlanInfoEditPage.module.css';

type Period = { startDate: string; endDate: string };

// 계획 편집: 여행 이름·기간·여행지 수정 (피그마 S4-1 여행계획 수정, 기능명세서 5-4 기간 변경)
export default function PlanInfoEditPage() {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, viewStatus, error, refetch } = usePlan(planId);
  const viewPath = `/plans/${planId}`;

  // 주소로 바로 들어와서 돌아갈 화면이 없으면 계획 보기로 보내요
  const leavePage = () => {
    if (location.key === 'default') navigate(viewPath, { replace: true });
    else navigate(-1);
  };

  if (plan) {
    // 읽기 전용으로 공유받은 계획은 고치지 못해요
    if (plan.role === undefined || plan.role === 'VIEWER') return <Navigate to={viewPath} replace />;
    return <PlanInfoEditForm plan={plan} onLeave={leavePage} />;
  }

  return (
    <main className={formStyles.page}>
      <img className={formStyles.background} src={backgroundImage} alt="" />
      <header className={formStyles.header}>
        <button type="button" className={formStyles.backButton} onClick={leavePage} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </button>
        <h1 className={formStyles.title}>계획 편집</h1>
      </header>

      {viewStatus === 'error' ? (
        <div className={styles.status} role="alert">
          <p className={styles.statusTitle}>여행 계획을 불러오지 못했어요.</p>
          <p className={styles.statusText}>{getErrorMessage(error)}</p>
          <Button variant="glass" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <div className={styles.status}>
          <LoadingSpinner label="여행 계획을 불러오는 중" />
        </div>
      )}
    </main>
  );
}

// 입력값은 처음 받은 계획으로 한 번만 채워요. 그래서 계획을 다 불러온 뒤에 이 컴포넌트를 그려요
function PlanInfoEditForm({ plan, onLeave }: { plan: Plan; onLeave: () => void }) {
  const navigate = useNavigate();
  const form = usePlanCreateForm({
    title: plan.title,
    destination: plan.destination,
    startDate: plan.startDate,
    endDate: plan.endDate,
  });
  const updatePlan = useUpdatePlan(plan.id);
  const [shrinkingPeriod, setShrinkingPeriod] = useState<Period>();

  const { request } = form;
  const hasChange =
    request !== undefined &&
    (request.title !== plan.title ||
      request.destination !== (plan.destination ?? '') ||
      request.startDate !== plan.startDate ||
      request.endDate !== plan.endDate);
  const canSubmit = hasChange && !updatePlan.isSaving;

  const save = (period: Period, keptDayIndexes?: number[]) => {
    if (!request) return;
    // 여행지를 안 바꿨으면 원래 값을 그대로 둬요. updatePlan은 값이 같으면 city를 다시 보내지 않아요
    const edited: Plan = {
      ...plan,
      title: request.title,
      ...(request.destination ? { destination: request.destination } : {}),
    };
    updatePlan.mutate(changePlanPeriod(edited, period.startDate, period.endDate, keptDayIndexes), {
      onSuccess: () => navigate(`/plans/${plan.id}`, { replace: true }),
    });
  };

  const submit = () => {
    if (!request || !canSubmit) return;
    const period = { startDate: request.startDate, endDate: request.endDate };
    const isShrinking = getPeriodChange(plan, period.startDate, period.endDate) === 'shrink';
    // 줄여도 잃을 장소가 없으면(모든 일차가 비어 있으면) 고를 것이 없어서 바로 저장해요
    if (isShrinking && plan.days.some((day) => day.nodes.length > 0)) {
      setShrinkingPeriod(period);
      return;
    }
    const dayCount = listDates(period.startDate, period.endDate).length;
    save(period, isShrinking ? plan.days.slice(0, dayCount).map((_, index) => index) : undefined);
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    submit();
  };

  return (
    <form className={formStyles.page} onSubmit={handleSubmit}>
      <img className={formStyles.background} src={backgroundImage} alt="" />

      <header className={formStyles.header}>
        <button type="button" className={formStyles.backButton} onClick={onLeave} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </button>
        <h1 className={formStyles.title}>계획 편집</h1>
      </header>

      <div className={formStyles.fields}>
        <LabeledInput
          label="여행 이름"
          value={form.title}
          onChange={form.setTitle}
          placeholder="이름을 입력해주세요."
          maxLength={30}
        />

        <div className={formStyles.period}>
          <p className={formStyles.periodLabel}>여행 기간</p>
          <Calendar selectedDates={form.selectedDates} onSelectDate={form.selectDate} />
          {form.hasPeriodError && (
            <p className={formStyles.periodError} role="alert">
              {PLAN_PERIOD_ERROR_MESSAGE}
            </p>
          )}
        </div>

        <div className={formStyles.destination}>
          <LabeledInput
            label="여행주소"
            value={form.destination}
            onChange={form.setDestination}
            placeholder="주소 검색하기"
            maxLength={50}
          />
          <span className={formStyles.destinationIcon}>
            <img src={locationIcon} alt="" />
          </span>
        </div>
      </div>

      <div className={formStyles.actions}>
        {updatePlan.isError && !updatePlan.isSaving && (
          <p className={formStyles.createError} role="alert">
            계획을 수정하지 못했어요. {getErrorMessage(updatePlan.error)}
          </p>
        )}
        <Button type="submit" variant="glass" disabled={!canSubmit}>
          {updatePlan.isSaving ? '수정하는 중' : '수정하기'}
        </Button>
      </div>

      {updatePlan.isSaving && (
        <div className={formStyles.loading}>
          <div className={formStyles.loadingContent} role="status">
            <LoadingSpinner label="여행 계획을 수정하는 중" />
          </div>
        </div>
      )}

      <KeepDaysModal
        isOpen={shrinkingPeriod !== undefined}
        days={plan.days}
        keepCount={shrinkingPeriod ? listDates(shrinkingPeriod.startDate, shrinkingPeriod.endDate).length : 0}
        onCancel={() => setShrinkingPeriod(undefined)}
        onConfirm={(keptDayIndexes) => {
          if (!shrinkingPeriod) return;
          save(shrinkingPeriod, keptDayIndexes);
          setShrinkingPeriod(undefined);
        }}
      />
    </form>
  );
}
