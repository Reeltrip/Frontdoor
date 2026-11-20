import { useState } from 'react';
import { formatDayDate, listDates } from './planDays';
import { chooseDestination, getConfirmedDestination, startDestination, typeDestination } from './planDestination';
import type { MapPosition } from '@/shared/components/Map/map.types';
import { rememberDestinationCenter } from '../lib/planMapCenter';
import type { CreatePlanRequest } from './plan.types';

/** 기능명세서 4-1: 종료일이 시작일보다 앞일 때 */
export const PLAN_PERIOD_ERROR_MESSAGE = '여행 기간을 다시 확인해주세요';

// 달력은 기기 시간대의 날짜를 주니까 toISOString(UTC)을 쓰면 하루가 밀릴 수 있음
const toDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** 계획 편집 화면처럼 이미 있는 값으로 시작할 때 넘겨요. 날짜는 YYYY-MM-DD */
export type PlanFormInitialValues = Partial<CreatePlanRequest>;

// 'YYYY-MM-DD'를 new Date()에 바로 넣으면 UTC 자정이 돼서 달력(기기 시간대)과 하루 어긋날 수 있음
const toLocalDate = (date: string | undefined) => {
  if (!date) return undefined;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/**
 * 여행계획 생성 화면의 입력값 (기능명세서 4-1). initial을 넘기면 그 값으로 시작해요 (계획 편집).
 * 기간은 달력에서 시작일 → 종료일 순으로 골라요. 둘 다 고른 뒤 다시 누르면 시작일부터 새로 골라요.
 */
export function usePlanCreateForm(initial?: PlanFormInitialValues) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [destination, setDestination] = useState(() => startDestination(initial?.destination));
  const [startDate, setStartDate] = useState(() => toLocalDate(initial?.startDate));
  const [endDate, setEndDate] = useState(() => toLocalDate(initial?.endDate));
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
  // 여행주소는 검색 결과에서 고른 값만 써요. 글자만 친 상태로는 요청을 만들지 않아요
  const confirmedDestination = getConfirmedDestination(destination);
  const request: CreatePlanRequest | undefined =
    trimmedTitle && confirmedDestination && start && end && dayCount > 0
      ? { title: trimmedTitle, destination: confirmedDestination, startDate: start, endDate: end }
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
    /** 여행주소 입력칸에 보이는 글자 */
    destination: destination.text,
    /** 검색 결과에서 골라 확정했는지 */
    isDestinationConfirmed: confirmedDestination !== undefined,
    typeDestination: (text: string) => setDestination((current) => typeDestination(current, text)),
    chooseDestination: (searchedQuery: string, resultName: string, center?: MapPosition) => {
      const chosen = chooseDestination(searchedQuery, resultName);
      // 계획 지도가 이 도시에서 열리도록 고른 좌표를 적어 둬요 (서버는 이름만 저장해요)
      if (center) rememberDestinationCenter(getConfirmedDestination(chosen), center);
      setDestination(chosen);
    },
    /** 달력에 초록 원으로 표시할 날짜 */
    selectedDates: [startDate, endDate].filter((date) => date !== undefined),
    selectDate,
    hasPeriodError,
    periodText: getPeriodText(),
    /** 모든 항목을 채웠을 때만 있어요. 없으면 생성하기 버튼을 막아요 */
    request,
  };
}
