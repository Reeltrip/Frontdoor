import { useState } from 'react';
import { formatDayDate, listDates } from './planDays';
import type { CreatePlanRequest } from './plan.types';

/** 기능명세서 4-1: 종료일이 시작일보다 앞일 때 */
export const PLAN_PERIOD_ERROR_MESSAGE = '여행 기간을 다시 확인해주세요';

// 달력은 기기 시간대의 날짜를 주니까 toISOString(UTC)을 쓰면 하루가 밀릴 수 있음
const toDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * 여행계획 생성 화면의 입력값 (기능명세서 4-1).
 * 기간은 달력에서 시작일 → 종료일 순으로 골라요. 둘 다 고른 뒤 다시 누르면 시작일부터 새로 골라요.
 */
export function usePlanCreateForm() {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [hasPeriodError, setHasPeriodError] = useState(false);

  /** 종료일까지 다 골랐으면 true를 돌려줘요 (달력을 닫을 때 씀) */
  const selectDate = (date: Date): boolean => {
    const isPickingEndDate = startDate !== undefined && endDate === undefined && !hasPeriodError;
    if (!isPickingEndDate) {
      setStartDate(date);
      setEndDate(undefined);
      setHasPeriodError(false);
      return false;
    }
    // 종료일이 시작일보다 앞: 에러를 보여주고, 다음에 누르는 날짜를 새 시작일로 받아요
    if (date.getTime() < startDate.getTime()) {
      setHasPeriodError(true);
      return false;
    }
    setEndDate(date);
    return true;
  };

  const start = startDate && toDateString(startDate);
  const end = endDate && toDateString(endDate);
  const dayCount = start && end ? listDates(start, end).length : 0;

  const trimmedTitle = title.trim();
  const trimmedDestination = destination.trim();
  const request: CreatePlanRequest | undefined =
    trimmedTitle && trimmedDestination && start && end && dayCount > 0
      ? { title: trimmedTitle, destination: trimmedDestination, startDate: start, endDate: end }
      : undefined;

  // 기간 입력칸에 보여줄 글자. 시작일만 골랐으면 '11.21 (토) ~'까지만 보여요
  const getPeriodText = () => {
    if (!start) return '';
    if (!end) return `${formatDayDate(start)} ~`;
    return `${formatDayDate(start)} ~ ${formatDayDate(end)} · ${dayCount}일`;
  };

  return {
    title,
    setTitle,
    destination,
    setDestination,
    /** 달력에 초록 원으로 표시할 날짜 */
    selectedDates: [startDate, endDate].filter((date) => date !== undefined),
    selectDate,
    hasPeriodError,
    periodText: getPeriodText(),
    /** 모든 항목을 채웠을 때만 있어요. 없으면 생성하기 버튼을 막아요 */
    request,
  };
}
