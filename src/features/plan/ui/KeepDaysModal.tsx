import { useEffect, useId, useState } from 'react';
import Button from '@/shared/components/Button';
import { KEEP_DAYS_MESSAGES } from '@/shared/lib/exceptionMessages';
import type { PlanDay } from '../model/plan.types';
import { formatDayDate } from '../model/planDays';
import styles from './KeepDaysModal.module.css';

type KeepDaysModalProps = {
  isOpen: boolean;
  /** 지금 계획의 일차 전부 */
  days: PlanDay[];
  /** 줄어든 뒤의 일수. 이만큼 골라야 확인할 수 있어요 */
  keepCount: number;
  onCancel: () => void;
  /** 고른 일차의 순서(0부터)를 오름차순으로 넘겨요 */
  onConfirm: (keptDayIndexes: number[]) => void;
  /** 화면 위에 띄우지 않고 그 자리에 그릴 때 (컴포넌트 테스트 페이지용) */
  isInline?: boolean;
};

// 기간을 줄일 때 남길 일차를 고르는 창 (기능명세서 5-4)
export default function KeepDaysModal({ isOpen, ...rest }: KeepDaysModalProps) {
  // 열 때마다 선택을 처음부터 다시 하도록, 닫히면 안쪽 상태를 버림
  if (!isOpen) return null;
  return <KeepDaysDialog {...rest} />;
}

function KeepDaysDialog({ days, keepCount, onCancel, onConfirm, isInline = false }: Omit<KeepDaysModalProps, 'isOpen'>) {
  const titleId = useId();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const isFull = selectedIndexes.length >= keepCount;

  useEffect(() => {
    if (isInline) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInline, onCancel]);

  const toggleDay = (dayIndex: number) => {
    setSelectedIndexes((current) =>
      current.includes(dayIndex) ? current.filter((index) => index !== dayIndex) : [...current, dayIndex],
    );
  };

  const dialog = (
    <div className={styles.dialog} role="dialog" aria-modal={!isInline} aria-labelledby={titleId}>
      <p id={titleId} className={styles.title}>
        {KEEP_DAYS_MESSAGES.title}
      </p>
      <p className={styles.description}>{KEEP_DAYS_MESSAGES.getDescription(keepCount)}</p>

      <ul className={styles.list}>
        {days.map((day, dayIndex) => {
          const isSelected = selectedIndexes.includes(dayIndex);
          const details = [
            formatDayDate(day.date),
            day.zone,
            day.nodes.length > 0 ? `장소 ${day.nodes.length}곳` : KEEP_DAYS_MESSAGES.emptyDay,
          ].filter(Boolean);

          return (
            <li key={day.date}>
              <button
                type="button"
                className={`${styles.day} ${isSelected ? styles.selected : ''}`}
                aria-pressed={isSelected}
                // 다 골랐으면 고른 것을 먼저 풀어야 다른 일차를 고를 수 있음
                disabled={!isSelected && isFull}
                onClick={() => toggleDay(dayIndex)}
              >
                <span className={styles.dayText}>
                  <span className={styles.dayName}>{dayIndex + 1}일차</span>
                  <span className={styles.dayDetails}>{details.join(' · ')}</span>
                </span>
                <span className={styles.check} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      <p className={styles.count} aria-live="polite">
        {selectedIndexes.length}/{keepCount} 선택
      </p>

      <div className={styles.actions}>
        <Button variant="outline" size="md" onClick={onCancel}>
          {KEEP_DAYS_MESSAGES.cancelLabel}
        </Button>
        <Button
          variant="filled"
          size="md"
          disabled={selectedIndexes.length !== keepCount}
          onClick={() => onConfirm([...selectedIndexes].sort((a, b) => a - b))}
        >
          {KEEP_DAYS_MESSAGES.confirmLabel}
        </Button>
      </div>
    </div>
  );

  if (isInline) return dialog;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.frame} onClick={(event) => event.stopPropagation()}>
        {dialog}
      </div>
    </div>
  );
}
