import { useState, type KeyboardEvent, type SyntheticEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import backIcon from '@/shared/assets/icons/arrow-back-light.svg';
import locationIcon from '@/shared/assets/icons/location-light.svg';
import backgroundImage from '@/shared/assets/images/plan-create-bg.png';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import Calendar from '@/shared/components/Calendar';
import ConfirmModal from '@/shared/components/ConfirmModal';
import LabeledInput from '@/shared/components/LabeledInput';
import { LoadingSpinner } from '@/shared/components/Loading';
import { EXCEPTION_MODALS } from '@/shared/lib/exceptionMessages';
import type { Plan } from '@/features/plan/model/plan.types';
import { getOverlappingPlanTitles, isPlanPeriodOverlapError, useCreatePlan } from '@/features/plan/model/usePlan';
import { PLAN_PERIOD_ERROR_MESSAGE, usePlanCreateForm } from '@/features/plan/model/usePlanCreateForm';
import styles from './PlanCreatePage.module.css';

// 여행계획 생성 (기능명세서 4-1, 예외 5-3 같은 기간에 새 여행계획)
export default function PlanCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const form = usePlanCreateForm();
  const createPlan = useCreatePlan();
  const [overlapError, setOverlapError] = useState<unknown>();
  const [createdPlan, setCreatedPlan] = useState<Plan>();
  const [isAiNoticeShown, setIsAiNoticeShown] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 주소로 바로 들어와서 돌아갈 화면이 없으면 홈으로 보내요
  const leavePage = () => {
    if (location.key === 'default') navigate('/home', { replace: true });
    else navigate(-1);
  };

  const submit = (isForced = false) => {
    if (!form.request || createPlan.isPending) return;
    createPlan.mutate(
      { ...form.request, isForced },
      {
        onSuccess: (plan) => setCreatedPlan(plan),
        onError: (error) => {
          if (isPlanPeriodOverlapError(error)) setOverlapError(error);
        },
      },
    );
  };

  // 종료일까지 고르면 달력을 닫아요
  const handleSelectDate = (date: Date) => {
    if (form.selectDate(date)) setIsCalendarOpen(false);
  };

  // 읽기 전용 입력칸에서 Enter를 누르면 폼이 제출되니까 막고 달력을 여닫아요
  const handlePeriodKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsCalendarOpen((isOpen) => !isOpen);
    } else if (event.key === 'Escape') {
      setIsCalendarOpen(false);
    }
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    submit();
  };

  // 기간이 겹치는 건 안내창으로 묻기 때문에 실패 문구로는 보여주지 않아요
  const hasCreateError = createPlan.isError && !isPlanPeriodOverlapError(createPlan.error);
  const overlappingTitles = getOverlappingPlanTitles(overlapError);

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
          <LabeledInput
            label="여행 기간"
            value={form.periodText}
            placeholder="날짜를 선택해주세요."
            readOnly
            aria-haspopup="dialog"
            aria-expanded={isCalendarOpen}
            onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
            onKeyDown={handlePeriodKeyDown}
          />
          {form.hasPeriodError && (
            <p className={styles.periodError} role="alert">
              {PLAN_PERIOD_ERROR_MESSAGE}
            </p>
          )}
          {isCalendarOpen && (
            <>
              <div className={styles.calendarBackdrop} onClick={() => setIsCalendarOpen(false)} />
              <div className={styles.calendar} role="dialog" aria-label="여행 기간 선택">
                <Calendar selectedDates={form.selectedDates} onSelectDate={handleSelectDate} />
              </div>
            </>
          )}
        </div>

        <div className={styles.destination}>
          <LabeledInput
            label="여행주소"
            value={form.destination}
            onChange={form.setDestination}
            placeholder="주소 검색하기"
            maxLength={50}
          />
          <span className={styles.destinationIcon}>
            <img src={locationIcon} alt="" />
          </span>
        </div>
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

      {createPlan.isPending && (
        <div className={styles.loading}>
          <LoadingSpinner label="여행 계획을 만드는 중" />
        </div>
      )}

      {/* '아니요'를 누르면 입력한 내용을 두고 화면을 나가니까 바깥을 눌러도 닫히지 않게 해요 */}
      <ConfirmModal
        {...EXCEPTION_MODALS.planPeriodOverlap}
        isOpen={overlapError !== undefined}
        isDismissible={false}
        description={overlappingTitles.length > 0 ? `겹치는 계획: ${overlappingTitles.join(', ')}` : undefined}
        onConfirm={() => {
          setOverlapError(undefined);
          submit(true);
        }}
        onCancel={leavePage}
      />

      <ConfirmModal
        isOpen={createdPlan !== undefined}
        isDismissible={false}
        theme="dark"
        icon="ticket"
        title="여행 계획이 만들어졌어요."
        description={isAiNoticeShown ? 'AI 초안은 준비 중이에요. 직접 만들어 주세요.' : '어떻게 만들까요?'}
        cancelLabel="AI 초안 만들기"
        confirmLabel="직접 만들기"
        onCancel={() => setIsAiNoticeShown(true)}
        onConfirm={() => {
          if (createdPlan) navigate(`/plans/${createdPlan.id}/edit`, { replace: true });
        }}
      />
    </form>
  );
}
