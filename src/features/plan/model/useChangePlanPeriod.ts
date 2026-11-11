import { useState } from 'react';
import type { Plan } from './plan.types';
import { changePlanPeriod, getPeriodChange, listDates } from './planDays';
import { useUpdatePlan } from './usePlan';

type Period = { startDate: string; endDate: string };

/**
 * 계획 기간 변경 (기능명세서 5-4).
 * - 늘리거나 날짜만 옮기면 바로 저장해요. 늘어난 날짜는 빈 일차가 되고 계획은 '작성 중'이 돼요
 * - 줄이면 저장하지 않고 keepCount를 채워요. 이때 KeepDaysModal을 띄워 남길 일차를 고르게 하고,
 *   확인은 confirmKeptDays, 취소는 cancelChange예요
 */
export function useChangePlanPeriod(plan: Plan | undefined) {
  const updatePlan = useUpdatePlan(plan?.id ?? '');
  const [shrinkingPeriod, setShrinkingPeriod] = useState<Period>();

  const requestChange = (startDate: string, endDate: string) => {
    if (!plan) return;
    const change = getPeriodChange(plan, startDate, endDate);
    if (change === 'none') return;
    if (change === 'shrink') {
      setShrinkingPeriod({ startDate, endDate });
      return;
    }
    updatePlan.mutate(changePlanPeriod(plan, startDate, endDate));
  };

  const confirmKeptDays = (keptDayIndexes: number[]) => {
    if (!plan || !shrinkingPeriod) return;
    updatePlan.mutate(changePlanPeriod(plan, shrinkingPeriod.startDate, shrinkingPeriod.endDate, keptDayIndexes));
    setShrinkingPeriod(undefined);
  };

  return {
    requestChange,
    /** 기간을 줄이는 중이면 남길 일차 수. 아니면 undefined */
    keepCount: shrinkingPeriod && listDates(shrinkingPeriod.startDate, shrinkingPeriod.endDate).length,
    confirmKeptDays,
    cancelChange: () => setShrinkingPeriod(undefined),
    isSaving: updatePlan.isPending,
    error: updatePlan.error,
  };
}
