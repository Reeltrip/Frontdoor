import { useState } from 'react';
import prevIcon from '@/shared/assets/icons/calendar-prev.svg';
import nextIcon from '@/shared/assets/icons/calendar-next.svg';
import styles from './Calendar.module.css';

type CalendarProps = {
  /** 초록 원으로 표시할 날짜. 여행 기간이면 [시작일, 종료일]을 넘김 */
  selectedDates?: Date[];
  onSelectDate?: (date: Date) => void;
  /** 처음 보여줄 달. 없으면 첫 선택 날짜의 달, 그것도 없으면 이번 달 */
  initialMonth?: Date;
};

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// 어두운 배경의 월 달력 (여행 기간 선택)
export default function Calendar({ selectedDates = [], onSelectDate, initialMonth }: CalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const startMonth = initialMonth ?? selectedDates[0] ?? new Date();
    return new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: dayCount }, (_, index) => new Date(year, month, index + 1));

  const moveMonth = (offset: number) => setViewMonth(new Date(year, month + offset, 1));

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" className={styles.arrow} onClick={() => moveMonth(-1)} aria-label="이전 달">
          <img src={prevIcon} alt="" />
        </button>
        <p className={styles.month} aria-live="polite">
          {MONTH_NAMES[month]} {year}
        </p>
        <button type="button" className={styles.arrow} onClick={() => moveMonth(1)} aria-label="다음 달">
          <img src={nextIcon} alt="" />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className={styles.weekday}>
            {weekday}
          </span>
        ))}
      </div>

      <div className={`${styles.grid} ${styles.dates}`}>
        {days.map((date) => {
          const isSelected = selectedDates.some((selected) => isSameDay(selected, date));
          return (
            <button
              key={date.getDate()}
              type="button"
              className={`${styles.date} ${isSelected ? styles.selected : ''}`}
              style={date.getDate() === 1 ? { gridColumnStart: firstWeekday + 1 } : undefined}
              aria-pressed={isSelected}
              aria-label={`${month + 1}월 ${date.getDate()}일`}
              onClick={() => onSelectDate?.(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
