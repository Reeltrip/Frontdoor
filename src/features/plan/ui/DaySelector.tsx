import { useEffect, useRef, useState } from 'react';
import chevronIcon from '@/shared/assets/icons/chevron-up-small.svg';
import { formatDayDate } from '../model/planDays';
import type { PlanDay } from '../model/plan.types';
import styles from './DaySelector.module.css';

type DaySelectorProps = {
  days: PlanDay[];
  selectedIndex: number;
  onSelect: (dayIndex: number) => void;
};

// 상단 '1일차 ▲'. 누르면 일차 목록이 열려 다른 일차로 옮겨 가요
export default function DaySelector({ days, selectedIndex, onSelect }: DaySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isOpen]);

  const selectDay = (index: number) => {
    setIsOpen(false);
    onSelect(index);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selectedIndex + 1}일차
        <img src={chevronIcon} alt="" className={isOpen ? styles.chevronOpen : styles.chevron} />
      </button>
      {isOpen && (
        <ul className={styles.menu} role="listbox" aria-label="일차 선택">
          {days.map((day, index) => (
            <li key={day.date}>
              <button
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                className={index === selectedIndex ? styles.optionSelected : styles.option}
                onClick={() => selectDay(index)}
              >
                <span>{index + 1}일차</span>
                <span className={styles.date}>{formatDayDate(day.date)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
