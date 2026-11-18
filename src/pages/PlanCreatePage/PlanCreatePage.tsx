import { useState, type SyntheticEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '@/shared/assets/icons/arrow-back-light.svg';
import backgroundImage from '@/shared/assets/images/plan-create-bg.png';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import Calendar from '@/shared/components/Calendar';
import ConfirmModal from '@/shared/components/ConfirmModal';
import LabeledInput from '@/shared/components/LabeledInput';
import DestinationField from '@/features/plan/ui/DestinationField';
import { LoadingSpinner } from '@/shared/components/Loading';
import type { Plan } from '@/features/plan/model/plan.types';
import { useCreateAiDraft, useCreatePlan } from '@/features/plan/model/usePlan';
import { PLAN_PERIOD_ERROR_MESSAGE, usePlanCreateForm } from '@/features/plan/model/usePlanCreateForm';
import styles from './PlanCreatePage.module.css';

// 여행계획 생성 (기능명세서 4-1, 예외 5-3 같은 기간에 새 여행계획)
export default function PlanCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const form = usePlanCreateForm();
  const createPlan = useCreatePlan();
  const [createdPlan, setCreatedPlan] = useState<Plan>();
  const [isAiNoticeShown, setIsAiNoticeShown] = useState(false);
  const aiDraft = useCreateAiDraft(createdPlan?.id ?? '');

  // 주소로 바로 들어와서 돌아갈 화면이 없으면 홈으로 보내요
  const leavePage = () => {
    if (location.key === 'default') navigate('/home', { replace: true });
    else navigate(-1);
  };

  const submit = () => {
    if (!form.request || createPlan.isPending) return;
    createPlan.mutate(form.request, { onSuccess: (plan) => setCreatedPlan(plan) });
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    submit();
  };

  const hasCreateError = createPlan.isError;

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <img className={styles.background} src={backgroundImage} alt="" />

      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={leavePage} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>새 여행계획</h1>
      </header>

      <div className={styles.fields}>
        <LabeledInput
          label="여행 이름"
          value={form.title}
          onChange={form.setTitle}
          placeholder="이름을 입력해주세요."
          maxLength={30}
        />

        <div className={styles.period}>
          <p className={styles.periodLabel}>여행 기간</p>
          <Calendar selectedDates={form.selectedDates} onSelectDate={form.selectDate} />
          {form.hasPeriodError && (
            <p className={styles.periodError} role="alert">
              {PLAN_PERIOD_ERROR_MESSAGE}
            </p>
          )}

        </div>

        <DestinationField
          value={form.destination}
          isConfirmed={form.isDestinationConfirmed}
          onType={form.typeDestination}
          onChoose={form.chooseDestination}
        />
      </div>

      <div className={styles.actions}>
        {hasCreateError && (
          <p className={styles.createError} role="alert">
            계획을 만들지 못했어요. {getErrorMessage(createPlan.error)}
          </p>
        )}
        <Button type="submit" variant="glass" disabled={!form.request || createPlan.isPending}>
          {hasCreateError ? '다시 시도하기' : '생성하기'}
        </Button>
      </div>

        {(createPlan.isPending || aiDraft.isPending) && (
        <div className={styles.loading}>
          <div className={styles.loadingContent} role="status">
            <LoadingSpinner label={aiDraft.isPending ? 'AI가 여행 동선을 만드는 중' : '여행 계획을 만드는 중'} />
            {aiDraft.isPending && (
              <>
                <p>AI가 여행 동선을 짜고 있어요.</p>
                <span>보통 5~10초 정도 걸려요.</span>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={createdPlan !== undefined}
        isDismissible={false}
        theme="dark"
        icon="ticket"
        title="여행 계획이 만들어졌어요."
        description={aiDraft.error ? getErrorMessage(aiDraft.error) : isAiNoticeShown ? 'AI 초안으로 여행 일정을 채울 수 있어요.' : '어떻게 만들까요?'}
        cancelLabel={aiDraft.error ? '다시 시도' : aiDraft.isPending ? '만드는 중' : 'AI 초안 만들기'}
        confirmLabel="직접 만들기"
        onCancel={() => {
          if (!createdPlan || aiDraft.isPending) return;
          setIsAiNoticeShown(true);
          aiDraft.mutate(undefined, {
            onSuccess: (draft) => navigate(`/plans/${draft.id}`, { replace: true }),
          });
        }}
        onConfirm={() => {
          if (createdPlan) navigate(`/plans/${createdPlan.id}/edit`, { replace: true, state: { returnTo: 'plans' } });
        }}
      />
    </form>
  );
}
